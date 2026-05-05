const Usuario = require('../models/Usuario')
const Follow = require('../models/Follow')
const PrivacidadeAtividade = require('../models/PrivacidadeAtividade')
const bcrypt = require('bcrypt')

const formatUser = (user) => {
  if (!user) return null
  const userObj = user.toObject ? user.toObject() : user
  const { _id, senha, ...rest } = userObj
  return {
    id: _id.toString(),
    ...rest,
    createdAt: rest.createdAt || rest.membroDesde || null
  }
}

const sameId = (a, b) => String(a || '') === String(b || '')

// ===== NORMALIZAÇÃO =====
const normalizarGeneros = (generosInput = []) => {
  const locais = []
  const externos = []

  generosInput.forEach(g => {
    if (!g) return
    if (typeof g === 'string') {
      locais.push(g)
      return
    }
    if (g.source && g.source !== 'local') {
      externos.push({
        source: g.source,
        externalId: g.externalId || g.id,
        nome: g.nome || g.name || 'Desconhecido',
        icon: g.icon || g.emoji || '🎵',
        color: g.color || '#1DB954'
      })
    } else if (g.id && !g.source) {
      locais.push(g.id)
    } else if (g._id) {
      locais.push(g._id)
    }
  })

  return { locais, externos }
}

const normalizarArtistas = (artistasInput = []) => {
  const locais = []
  const externos = []

  artistasInput.forEach(a => {
    if (!a) return
    if (typeof a === 'string') {
      locais.push(a)
      return
    }
    if (a.source && a.source !== 'local') {
      externos.push({
        source: a.source,
        externalId: a.externalId || a.id,
        nome: a.nome || a.name || 'Desconhecido',
        imagem: a.imagem || a.photo || a.images?.[0]?.url || null,
        extra: {
          genero: a.genero || a.genre || '',
          popularidade: a.popularidade || a.popularity || 0
        }
      })
    } else if (a.id && !a.source) {
      locais.push(a.id)
    } else if (a._id) {
      locais.push(a._id)
    }
  })

  return { locais, externos }
}

const normalizarVibes = (vibesInput = []) => {
  const locais = []
  const externas = []

  vibesInput.forEach(v => {
    if (!v) return
    if (typeof v === 'string') {
      locais.push(v)
      return
    }
    if (v.source && v.source !== 'local') {
      externas.push({
        source: v.source,
        externalId: v.externalId || v.id || null,
        nome: v.nome || v.name || 'Desconhecido',
        emoji: v.emoji || v.icon || '✨',
        descricao: v.descricao || v.description || '',
        gradient: v.gradient || 'linear-gradient(135deg,#667eea,#764ba2)',
        tags: v.tags || []
      })
    } else if (v.id && !v.source) {
      locais.push(v.id)
    } else if (v._id) {
      locais.push(v._id)
    }
  })

  return { locais, externas }
}

// ===== PERMISSÕES =====
const canAccessProfile = async (targetUserId, viewerId) => {
  const user = await Usuario.findById(targetUserId, 'perfilPrivado')
  if (!user) return false
  if (!user.perfilPrivado) return true
  if (!viewerId) return false
  if (sameId(targetUserId, viewerId)) return true

  const follow = await Follow.findOne({
    seguidor_id: viewerId,
    seguindo_id: targetUserId,
    tipo: 'usuario'
  }).lean()

  return !!follow
}

const hasPendingFollowRequest = async (targetUserId, viewerId) => {
  if (!viewerId) return false
  const user = await Usuario.findById(targetUserId, 'solicitacoesSeguir')
  if (!user) return false
  return user.solicitacoesSeguir?.some(
    s => sameId(s.usuario, viewerId) && s.status === 'pendente'
  )
}

const isResourceBlocked = async (targetUserId, viewerId, recurso) => {
  if (!viewerId) return false
  if (sameId(targetUserId, viewerId)) return false

  const regra = await PrivacidadeAtividade.findOne({
    usuarioDono: targetUserId,
    usuarioBloqueado: viewerId
  }).lean()

  if (!regra) return false
  return regra.recursos.includes('tudo') || regra.recursos.includes(recurso)
}

// ===== AVATAR =====
const generateDefaultAvatar = (nome, id) => {
  const initials = nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const str = id || nome || 'default'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867']
  ]

  const colorIndex = Math.abs(hash) % gradients.length
  const [color1, color2] = gradients[colorIndex]

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#g)"/>
      <text x="50%" y="50%" font-family="Arial,sans-serif" font-size="80"
            font-weight="bold" fill="white" text-anchor="middle" dy=".35em">
        ${initials}
      </text>
    </svg>
  `

  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

// ===== CRUD =====
const createUser = async (data) => {
  const { nome, email, senha } = data
  const jaExiste = await Usuario.findOne({ email })
  if (jaExiste) throw new Error('E-mail já cadastrado')

  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const senhaHash = await bcrypt.hash(senha, 10)
  const defaultAvatar = generateDefaultAvatar(nome, null)

  const user = new Usuario({
    nome, username, email,
    senha: senhaHash,
    bio: '', avatar: defaultAvatar, cover: null, localizacao: '',
    perfilPrivado: false, mostrarAtividade: true,
    generos: { locais: [], externos: [] },
    artistasFavoritos: { locais: [], externos: [] },
    vibesFavoritas: { locais: [], externas: [] }
  })

  const savedUser = await user.save()
  if (savedUser._id) {
    savedUser.avatar = generateDefaultAvatar(nome, savedUser._id.toString())
    await savedUser.save()
  }

  return formatUser(savedUser)
}

const loginUser = async (email, senha) => {
  const user = await Usuario.findOne({ email })
  if (!user) throw new Error('Usuário não encontrado')
  const senhaValida = await bcrypt.compare(senha, user.senha)
  if (!senhaValida) throw new Error('Senha inválida')
  return formatUser(user)
}

const getUsers = async () => {
  const users = await Usuario.find({}, '-senha')
  return users.map(u => formatUser(u))
}

const getUserById = async (id, currentUserId) => {
  const user = await Usuario.findById(id, '-senha')
    .populate('generos.locais', 'nome icon color popularidade')
    .populate('artistasFavoritos.locais', 'nome foto generos')
    .populate('vibesFavoritas.locais', 'nome emoji descricao gradient tags')

  if (!user) return null

  const formatted = formatUser(user)
  const isOwner = sameId(formatted.id, currentUserId)

  const montarResposta = async (completo = false) => {
    if (!completo) {
      return {
        id: formatted.id,
        nome: formatted.nome,
        username: formatted.username,
        avatar: formatted.avatar,
        cover: formatted.cover || null,
        bio: formatted.bio || '',
        membroDesde: formatted.membroDesde || null,
        perfilPrivado: formatted.perfilPrivado,
        onboardingCompleto: formatted.onboardingCompleto || false,
        generos: { todos: [], locais: [], externos: [] },
        artistasFavoritos: { todos: [], locais: [], externos: [] },
        vibesFavoritas: { todos: [], locais: [], externas: [] },
        acessoLiberado: false,
        solicitacaoPendente: false
      }
    }

    const [generos, artistas, vibes] = await Promise.all([
      user.getGenerosCompletos(),
      user.getArtistasCompletos(),
      user.getVibesCompletas()
    ])

    return {
      ...formatted,
      generos: { todos: generos, locais: formatted.generos?.locais, externos: formatted.generos?.externos },
      artistasFavoritos: { todos: artistas, locais: formatted.artistasFavoritos?.locais, externos: formatted.artistasFavoritos?.externos },
      vibesFavoritas: { todos: vibes, locais: formatted.vibesFavoritas?.locais, externas: formatted.vibesFavoritas?.externas },
      acessoLiberado: true,
      solicitacaoPendente: false
    }
  }

  // Público ou dono
  if (!formatted.perfilPrivado || isOwner) {
    return await montarResposta(true)
  }

  // Verifica se segue
  const follow = await Follow.findOne({
    seguidor_id: currentUserId,
    seguindo_id: id,
    tipo: 'usuario'
  }).lean()

  if (follow) {
    return await montarResposta(true)
  }

  // Perfil privado e não segue
  const solicitacaoPendente = user.solicitacoesSeguir?.some(
    s => sameId(s.usuario, currentUserId) && s.status === 'pendente'
  )

  const base = await montarResposta(false)
  base.solicitacaoPendente = !!solicitacaoPendente
  return base
}

const updateUser = async (id, data) => {
  const {
    nome, username, idade, bio, avatar, cover, localizacao,
    email, website, perfilPrivado, mostrarAtividade,
    generos, artistasFavoritos, vibesFavoritas, onboardingCompleto
  } = data

  // Busca usuário atual para fazer merge nos arrays híbridos
  const usuarioAtual = await Usuario.findById(id)
  if (!usuarioAtual) return null

  // Campos simples
  if (nome !== undefined) usuarioAtual.nome = nome
  if (username !== undefined) usuarioAtual.username = username
  if (idade !== undefined) usuarioAtual.idade = idade
  if (bio !== undefined) usuarioAtual.bio = bio
  if (avatar !== undefined) usuarioAtual.avatar = avatar
  if (cover !== undefined) usuarioAtual.cover = cover
  if (localizacao !== undefined) usuarioAtual.localizacao = localizacao
  if (email !== undefined) usuarioAtual.email = email
  if (website !== undefined) usuarioAtual.website = website
  if (perfilPrivado !== undefined) usuarioAtual.perfilPrivado = perfilPrivado
  if (mostrarAtividade !== undefined) usuarioAtual.mostrarAtividade = mostrarAtividade
  if (onboardingCompleto !== undefined) usuarioAtual.onboardingCompleto = onboardingCompleto

  // Campos híbridos — substituição completa (não append)
  if (generos !== undefined) {
    const norm = normalizarGeneros(generos)
    usuarioAtual.generos = { locais: norm.locais, externos: norm.externos }
  }

  if (artistasFavoritos !== undefined) {
    const norm = normalizarArtistas(artistasFavoritos)
    usuarioAtual.artistasFavoritos = { locais: norm.locais, externos: norm.externos }
  }

  if (vibesFavoritas !== undefined) {
    const norm = normalizarVibes(vibesFavoritas)
    usuarioAtual.vibesFavoritas = { locais: norm.locais, externas: norm.externas }
  }

  const saved = await usuarioAtual.save()

  const user = await Usuario.findById(saved._id, '-senha')
    .populate('generos.locais', 'nome icon color popularidade')
    .populate('artistasFavoritos.locais', 'nome foto generos')
    .populate('vibesFavoritas.locais', 'nome emoji descricao gradient tags')

  return formatUser(user)
}

const deleteUser = async (id) => {
  const user = await Usuario.findByIdAndDelete(id)
  return formatUser(user)
}

const searchUsers = async (query) => {
  if (!query || query.trim() === '') return []
  const regex = new RegExp(query, 'i')
  const users = await Usuario.find({
    $or: [
      { nome: { $regex: regex } },
      { username: { $regex: regex } },
      { email: { $regex: regex } }
    ]
  }, 'nome username avatar bio perfilPrivado mostrarAtividade').limit(10)

  return users.map(user => ({
    id: user._id.toString(),
    nome: user.nome,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio || '',
    perfilPrivado: !!user.perfilPrivado,
    mostrarAtividade: user.mostrarAtividade !== false
  }))
}

const getUserStats = async (userId) => {
  const Curtida = require('../models/Curtida')
  const Playlist = require('../models/Playlist')

  const [musicasCurtidas, playlists] = await Promise.all([
    Curtida.countDocuments({ usuario: userId }),
    Playlist.countDocuments({ usuario: userId, privacidade: 'Pública' })
  ])

  return { musicasCurtidas, playlists }
}

module.exports = {
  createUser, loginUser, getUsers, getUserById,
  updateUser, deleteUser, searchUsers,
  generateDefaultAvatar, getUserStats,
  canAccessProfile, hasPendingFollowRequest, isResourceBlocked
}