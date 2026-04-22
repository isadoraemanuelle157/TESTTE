const Usuario = require('../models/Usuario')
const Follow = require('../models/Follow')
const PrivacidadeAtividade = require('../models/PrivacidadeAtividade')
const bcrypt = require('bcrypt')

// Helper para formatar usuário
const formatUser = (user) => {
  if (!user) return null

  const userObj = user.toObject ? user.toObject() : user
  const { _id, senha, ...rest } = userObj

  return {
    id: _id.toString(),
    ...rest
  }
}

const sameId = (a, b) => String(a || '') === String(b || '')

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

// restante igual...
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

const createUser = async (data) => {
  const { nome, email, senha } = data

  const jaExiste = await Usuario.findOne({ email })
  if (jaExiste) {
    throw new Error('E-mail já cadastrado')
  }

  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const senhaHash = await bcrypt.hash(senha, 10)
  const defaultAvatar = generateDefaultAvatar(nome, null)

  const user = new Usuario({
    nome,
    username,
    email,
    senha: senhaHash,
    bio: '',
    avatar: defaultAvatar,
    cover: null,
    localizacao: '',
    perfilPrivado: false,
    mostrarAtividade: true
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
  return users.map(formatUser)
}

const getUserById = async (id, currentUserId) => {
  const user = await Usuario.findById(id, '-senha')
  if (!user) return null

  const formatted = formatUser(user)
  const isOwner = sameId(formatted.id, currentUserId)

  // 🔓 BASE PÚBLICA (SEMPRE VEM) — inclui bio
  const basePublic = {
    id: formatted.id,
    nome: formatted.nome,
    username: formatted.username,
    avatar: formatted.avatar,
    cover: formatted.cover || null,
    bio: formatted.bio || '',        // ← SEMPRE visível
    membroDesde: formatted.membroDesde || null,
    perfilPrivado: formatted.perfilPrivado
  }

  // 🔓 Se não é privado ou é dono → acesso total
  if (!formatted.perfilPrivado || isOwner) {
    return {
      ...formatted,
      acessoLiberado: true,
      solicitacaoPendente: false
    }
  }

  // 🔍 Verifica se já segue
  const follow = await Follow.findOne({
    seguidor_id: currentUserId,
    seguindo_id: id,
    tipo: 'usuario'
  }).lean()

  if (follow) {
    return {
      ...formatted,
      acessoLiberado: true,
      solicitacaoPendente: false
    }
  }

  // ⏳ Verifica solicitação pendente
  const solicitacaoPendente = user.solicitacoesSeguir?.some(
    s => sameId(s.usuario, currentUserId) && s.status === 'pendente'
  )

  // 🔒 PERFIL PRIVADO BLOQUEADO — bio já está no basePublic
  return {
    ...basePublic,
    acessoLiberado: false,
    solicitacaoPendente: !!solicitacaoPendente
  }
}

const updateUser = async (id, data) => {
  const {
    nome,
    username,
    bio,
    avatar,
    cover,
    localizacao,
    email,
    website,
    generos,
    perfilPrivado,
    mostrarAtividade
  } = data

  const updateData = {}

  if (nome !== undefined) updateData.nome = nome
  if (username !== undefined) updateData.username = username
  if (bio !== undefined) updateData.bio = bio
  if (avatar !== undefined) updateData.avatar = avatar
  if (cover !== undefined) updateData.cover = cover
  if (localizacao !== undefined) updateData.localizacao = localizacao
  if (email !== undefined) updateData.email = email
  if (website !== undefined) updateData.website = website
  if (generos !== undefined) updateData.generos = generos
  if (perfilPrivado !== undefined) updateData.perfilPrivado = perfilPrivado
  if (mostrarAtividade !== undefined) updateData.mostrarAtividade = mostrarAtividade

  const user = await Usuario.findByIdAndUpdate(
    id,
    updateData,
    { new: true, select: '-senha' }
  )

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

  return {
    musicasCurtidas,
    playlists
  }
}

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  generateDefaultAvatar,
  getUserStats,
  canAccessProfile,
  hasPendingFollowRequest,
  isResourceBlocked
}
