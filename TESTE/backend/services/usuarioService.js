
const mongoose = require('mongoose')
const Usuario = require('../models/Usuario')
const Follow = require('../models/Follow')
const PrivacidadeAtividade = require('../models/PrivacidadeAtividade')
const Bloqueio = require('../models/Bloqueio')
const Denuncia = require('../models/Denuncia')
const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')

const bcrypt = require('bcrypt')
const axios = require('axios')

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
      if (mongoose.Types.ObjectId.isValid(g)) {
        locais.push(g)
      } else {
        // String que não é ObjectId vira externo genérico
        externos.push({
          source: 'local',
          externalId: g,
          nome: g,
          icon: '🎵',
          color: '#1DB954'
        })
      }
      return
    }

    // Se é objeto com source externo
    if (g.source && g.source !== 'local') {
      externos.push({
        source: g.source,
        externalId: g.externalId || g.id || String(g._id),
        nome: g.nome || g.name || 'Desconhecido',
        icon: g.icon || g.emoji || '🎵',
        color: g.color || '#1DB954'
      })
    } 
    // Se é objeto sem source ou source local, verificar ID
    else if (g._id || g.id) {
      const id = String(g._id || g.id)
      if (mongoose.Types.ObjectId.isValid(id)) {
        locais.push(id)
      } else {
        externos.push({
          source: g.source || 'local',
          externalId: id,
          nome: g.nome || g.name || 'Desconhecido',
          icon: g.icon || g.emoji || '🎵',
          color: g.color || '#1DB954'
        })
      }
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

  if (viewerId) {
    const blockRelation = await getBlockRelation(viewerId, targetUserId)
    if (blockRelation.blocked) return false
  }

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

    if (!isOwner && currentUserId) {
    const blockRelation = await getBlockRelation(currentUserId, id)

    if (blockRelation.blocked) {
      return {
        id: formatted.id,
        nome: formatted.nome,
        username: formatted.username,
        avatar: formatted.avatar,
        cover: formatted.cover || null,
        bio: '',
        membroDesde: formatted.membroDesde || null,
        perfilPrivado: false,
        onboardingCompleto: formatted.onboardingCompleto || false,
        generos: { todos: [], locais: [], externos: [] },
        artistasFavoritos: { todos: [], locais: [], externos: [] },
        vibesFavoritas: { todos: [], locais: [], externas: [] },
        acessoLiberado: false,
        solicitacaoPendente: false,
        perfilBloqueado: true,
        bloqueadoPorMim: blockRelation.blockedByMe,
        meBloqueou: blockRelation.blockedMe
      }
    }
  }

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
  
  // ✅ Forçar reset do campo para migrar de array antigo para objeto novo
  usuarioAtual.markModified('artistasFavoritos')
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
  const Playlist = require('../models/Playlist')

  const [curtidasLocais, curtidasExternas, playlists] = await Promise.all([
    Curtida.countDocuments({ usuario: userId }),
    CurtidaExterna.countDocuments({ usuario: userId }),
    Playlist.countDocuments({ usuario: userId, privacidade: 'Pública' })
  ])

  return {
    musicasCurtidas: curtidasLocais + curtidasExternas,
    playlists
  }
}

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const DEEZER_API_URL = 'https://api.deezer.com'

let spotifyToken = null
let tokenExpiresAt = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiresAt - 60000) {
    return spotifyToken
  }

  try {
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    spotifyToken = response.data.access_token
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000
    console.log('🎵 Token Spotify renovado (service)')
    return spotifyToken
  } catch (error) {
    console.error('❌ Erro token Spotify:', error.response?.data || error.message)
    throw new Error('Falha autenticação Spotify')
  }
}

async function spotifyRequest(config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await getSpotifyToken()
      const response = await axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10)
        const delay = Math.min(retryAfter * 1000, 15000)
        console.warn(`⏳ Spotify Rate Limit → ${delay}ms`)
        await sleep(delay)
      } else if (error.response?.status === 401) {
        spotifyToken = null
      } else {
        throw error
      }
    }
  }
  throw new Error('Spotify max retries exceeded')
}

// ============================================
// 🎵 DADOS MOCKADOS DE FALLBACK (15 músicas por mix, diferentes cada)
// ============================================

const MOCK_TRACKS_POOL = [
  // 🎸 Rock
  { id: "mock_rock_1", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", cover: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b", url: "https://p.scdn.co/mp3-preview/sample1", duration: 354, source: "spotify", popularity: 95 },
  { id: "mock_rock_2", title: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV", cover: "https://i.scdn.co/image/ab67616d0000b273c8a11e3f7e6e7b5e5b5b5b5b", url: "https://p.scdn.co/mp3-preview/sample2", duration: 482, source: "spotify", popularity: 94 },
  { id: "mock_rock_3", title: "Hotel California", artist: "Eagles", album: "Hotel California", cover: "https://i.scdn.co/image/ab67616d0000b273b5d4c4c4c4c4c4c4c4c4c4c4", url: "https://p.scdn.co/mp3-preview/sample3", duration: 391, source: "spotify", popularity: 93 },
  { id: "mock_rock_4", title: "Sweet Child O\' Mine", artist: "Guns N\' Roses", album: "Appetite for Destruction", cover: "https://i.scdn.co/image/ab67616d0000b273a1a1a1a1a1a1a1a1a1a1a1a1", url: "https://p.scdn.co/mp3-preview/sample4", duration: 356, source: "spotify", popularity: 92 },
  { id: "mock_rock_5", title: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind", cover: "https://i.scdn.co/image/ab67616d0000b273b2b2b2b2b2b2b2b2b2b2b2b2", url: "https://p.scdn.co/mp3-preview/sample5", duration: 301, source: "spotify", popularity: 91 },
  // 🎤 Pop
  { id: "mock_pop_1", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", cover: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", url: "https://p.scdn.co/mp3-preview/sample6", duration: 200, source: "spotify", popularity: 98 },
  { id: "mock_pop_2", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", cover: "https://i.scdn.co/image/ab67616d0000b273bd6f8ac82dc5fe1028c14f7d", url: "https://p.scdn.co/mp3-preview/sample7", duration: 203, source: "spotify", popularity: 96 },
  { id: "mock_pop_3", title: "Anti-Hero", artist: "Taylor Swift", album: "Midnights", cover: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268a0d6d", url: "https://p.scdn.co/mp3-preview/sample8", duration: 200, source: "spotify", popularity: 97 },
  { id: "mock_pop_4", title: "As It Was", artist: "Harry Styles", album: "Harry\'s House", cover: "https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caac71", url: "https://p.scdn.co/mp3-preview/sample9", duration: 167, source: "spotify", popularity: 95 },
  { id: "mock_pop_5", title: "Flowers", artist: "Miley Cyrus", album: "Endless Summer Vacation", cover: "https://i.scdn.co/image/ab67616d0000b273f5e7b2e5e5e5e5e5e5e5e5e5", url: "https://p.scdn.co/mp3-preview/sample10", duration: 200, source: "spotify", popularity: 94 },
  // 🔥 Funk
  { id: "mock_funk_1", title: "Dançarina", artist: "MC Pedrinho", album: "Funk Total", cover: "https://i.scdn.co/image/ab67616d0000b273c3c3c3c3c3c3c3c3c3c3c3c3", url: "https://p.scdn.co/mp3-preview/sample11", duration: 180, source: "spotify", popularity: 88 },
  { id: "mock_funk_2", title: "Tá OK", artist: "DENNIS", album: "Funk Brasil", cover: "https://i.scdn.co/image/ab67616d0000b273d4d4d4d4d4d4d4d4d4d4d4d4", url: "https://p.scdn.co/mp3-preview/sample12", duration: 175, source: "spotify", popularity: 87 },
  { id: "mock_funk_3", title: "Vai Descendo", artist: "MC Zaac", album: "Funk 2024", cover: "https://i.scdn.co/image/ab67616d0000b273e5e5e5e5e5e5e5e5e5e5e5e5", url: "https://p.scdn.co/mp3-preview/sample13", duration: 190, source: "spotify", popularity: 86 },
  { id: "mock_funk_4", title: "Bum Bum Tam Tam", artist: "MC Fioti", album: "Funk Hits", cover: "https://i.scdn.co/image/ab67616d0000b273f6f6f6f6f6f6f6f6f6f6f6f6", url: "https://p.scdn.co/mp3-preview/sample14", duration: 185, source: "spotify", popularity: 85 },
  { id: "mock_funk_5", title: "Envolver", artist: "Anitta", album: "Versions of Me", cover: "https://i.scdn.co/image/ab67616d0000b273a7a7a7a7a7a7a7a7a7a7a7a7", url: "https://p.scdn.co/mp3-preview/sample15", duration: 193, source: "spotify", popularity: 89 },
  // 🎹 Eletrônica
  { id: "mock_elec_1", title: "Titanium", artist: "David Guetta ft. Sia", album: "Nothing but the Beat", cover: "https://i.scdn.co/image/ab67616d0000b273b8b8b8b8b8b8b8b8b8b8b8b8", url: "https://p.scdn.co/mp3-preview/sample16", duration: 245, source: "spotify", popularity: 90 },
  { id: "mock_elec_2", title: "Clarity", artist: "Zedd", album: "Clarity", cover: "https://i.scdn.co/image/ab67616d0000b273c9c9c9c9c9c9c9c9c9c9c9c9", url: "https://p.scdn.co/mp3-preview/sample17", duration: 270, source: "spotify", popularity: 89 },
  { id: "mock_elec_3", title: "Don\'t You Worry Child", artist: "Swedish House Mafia", album: "Until Now", cover: "https://i.scdn.co/image/ab67616d0000b273d0d0d0d0d0d0d0d0d0d0d0d0", url: "https://p.scdn.co/mp3-preview/sample18", duration: 210, source: "spotify", popularity: 88 },
  { id: "mock_elec_4", title: "Wake Me Up", artist: "Avicii", album: "True", cover: "https://i.scdn.co/image/ab67616d0000b273e1e1e1e1e1e1e1e1e1e1e1e1", url: "https://p.scdn.co/mp3-preview/sample19", duration: 249, source: "spotify", popularity: 91 },
  { id: "mock_elec_5", title: "Lean On", artist: "Major Lazer", album: "Peace Is the Mission", cover: "https://i.scdn.co/image/ab67616d0000b273f2f2f2f2f2f2f2f2f2f2f2f2", url: "https://p.scdn.co/mp3-preview/sample20", duration: 176, source: "spotify", popularity: 90 },
  // 🙏 Gospel
  { id: "mock_gosp_1", title: "Oceans", artist: "Hillsong United", album: "Zion", cover: "https://i.scdn.co/image/ab67616d0000b273a3a3a3a3a3a3a3a3a3a3a3a3", url: "https://p.scdn.co/mp3-preview/sample21", duration: 560, source: "spotify", popularity: 85 },
  { id: "mock_gosp_2", title: "Graves into Gardens", artist: "Elevation Worship", album: "Graves into Gardens", cover: "https://i.scdn.co/image/ab67616d0000b273b4b4b4b4b4b4b4b4b4b4b4b4", url: "https://p.scdn.co/mp3-preview/sample22", duration: 277, source: "spotify", popularity: 84 },
  { id: "mock_gosp_3", title: "Way Maker", artist: "Sinach", album: "Way Maker", cover: "https://i.scdn.co/image/ab67616d0000b273c5c5c5c5c5c5c5c5c5c5c5c5", url: "https://p.scdn.co/mp3-preview/sample23", duration: 302, source: "spotify", popularity: 83 },
  { id: "mock_gosp_4", title: "A Thousand Hallelujahs", artist: "Brooke Ligertwood", album: "EIGHT", cover: "https://i.scdn.co/image/ab67616d0000b273d6d6d6d6d6d6d6d6d6d6d6d6", url: "https://p.scdn.co/mp3-preview/sample24", duration: 245, source: "spotify", popularity: 82 },
  { id: "mock_gosp_5", title: "Rattle!", artist: "Elevation Worship", album: "Graves into Gardens", cover: "https://i.scdn.co/image/ab67616d0000b273e7e7e7e7e7e7e7e7e7e7e7e7", url: "https://p.scdn.co/mp3-preview/sample25", duration: 289, source: "spotify", popularity: 81 },
  // 🥁 Samba/MPB
  { id: "mock_samb_1", title: "Garota de Ipanema", artist: "Tom Jobim", album: "Getz/Gilberto", cover: "https://i.scdn.co/image/ab67616d0000b273f8f8f8f8f8f8f8f8f8f8f8f8", url: "https://p.scdn.co/mp3-preview/sample26", duration: 185, source: "spotify", popularity: 88 },
  { id: "mock_samb_2", title: "Mas Que Nada", artist: "Sérgio Mendes", album: "Mas Que Nada", cover: "https://i.scdn.co/image/ab67616d0000b273a9a9a9a9a9a9a9a9a9a9a9a9", url: "https://p.scdn.co/mp3-preview/sample27", duration: 180, source: "spotify", popularity: 87 },
  { id: "mock_samb_3", title: "Chega de Saudade", artist: "João Gilberto", album: "Chega de Saudade", cover: "https://i.scdn.co/image/ab67616d0000b273b0b0b0b0b0b0b0b0b0b0b0b0", url: "https://p.scdn.co/mp3-preview/sample28", duration: 190, source: "spotify", popularity: 86 },
  { id: "mock_samb_4", title: "Águas de Março", artist: "Elis Regina", album: "Elis & Tom", cover: "https://i.scdn.co/image/ab67616d0000b273c1c1c1c1c1c1c1c1c1c1c1c1", url: "https://p.scdn.co/mp3-preview/sample29", duration: 210, source: "spotify", popularity: 85 },
  { id: "mock_samb_5", title: "Canto de Ossanha", artist: "Baden Powell", album: "Os Afro-Sambas", cover: "https://i.scdn.co/image/ab67616d0000b273d2d2d2d2d2d2d2d2d2d2d2d2", url: "https://p.scdn.co/mp3-preview/sample30", duration: 195, source: "spotify", popularity: 84 },
  // 🌾 Sertanejo
  { id: "mock_sert_1", title: "Notificação Preferida", artist: "Zé Neto & Cristiano", album: "Um Novo Sonho", cover: "https://i.scdn.co/image/ab67616d0000b273e3e3e3e3e3e3e3e3e3e3e3e3", url: "https://p.scdn.co/mp3-preview/sample31", duration: 185, source: "spotify", popularity: 89 },
  { id: "mock_sert_2", title: "Ciumeira", artist: "Marília Mendonça", album: "Realidade", cover: "https://i.scdn.co/image/ab67616d0000b273f4f4f4f4f4f4f4f4f4f4f4f4", url: "https://p.scdn.co/mp3-preview/sample32", duration: 190, source: "spotify", popularity: 90 },
  { id: "mock_sert_3", title: "Infiel", artist: "Marília Mendonça", album: "Realidade", cover: "https://i.scdn.co/image/ab67616d0000b273f4f4f4f4f4f4f4f4f4f4f4f4", url: "https://p.scdn.co/mp3-preview/sample33", duration: 188, source: "spotify", popularity: 91 },
  { id: "mock_sert_4", title: "Mal Feito", artist: "Henrique & Juliano", album: "O Céu Explica Tudo", cover: "https://i.scdn.co/image/ab67616d0000b273a5a5a5a5a5a5a5a5a5a5a5a5", url: "https://p.scdn.co/mp3-preview/sample34", duration: 192, source: "spotify", popularity: 88 },
  { id: "mock_sert_5", title: "Evidências", artist: "Chitãozinho & Xororó", album: "Evidências", cover: "https://i.scdn.co/image/ab67616d0000b273b6b6b6b6b6b6b6b6b6b6b6b6", url: "https://p.scdn.co/mp3-preview/sample35", duration: 280, source: "spotify", popularity: 87 },
  // 🎧 Indie
  { id: "mock_indi_1", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", cover: "https://i.scdn.co/image/ab67616d0000b2734c4c4c4c4c4c4c4c4c4c4c4c", url: "https://p.scdn.co/mp3-preview/sample36", duration: 272, source: "spotify", popularity: 92 },
  { id: "mock_indi_2", title: "Take Me Out", artist: "Franz Ferdinand", album: "Franz Ferdinand", cover: "https://i.scdn.co/image/ab67616d0000b273d5d5d5d5d5d5d5d5d5d5d5d5", url: "https://p.scdn.co/mp3-preview/sample37", duration: 237, source: "spotify", popularity: 88 },
  { id: "mock_indi_3", title: "Electric Feel", artist: "MGMT", album: "Oracular Spectacular", cover: "https://i.scdn.co/image/ab67616d0000b273e6e6e6e6e6e6e6e6e6e6e6e6", url: "https://p.scdn.co/mp3-preview/sample38", duration: 229, source: "spotify", popularity: 87 },
  { id: "mock_indi_4", title: "Somebody That I Used to Know", artist: "Gotye", album: "Making Mirrors", cover: "https://i.scdn.co/image/ab67616d0000b273f7f7f7f7f7f7f7f7f7f7f7f7", url: "https://p.scdn.co/mp3-preview/sample39", duration: 244, source: "spotify", popularity: 89 },
  { id: "mock_indi_5", title: "Riptide", artist: "Vance Joy", album: "Dream Your Life Away", cover: "https://i.scdn.co/image/ab67616d0000b273a8a8a8a8a8a8a8a8a8a8a8a8", url: "https://p.scdn.co/mp3-preview/sample40", duration: 204, source: "spotify", popularity: 90 },
  // 🎤 Rap/Hip Hop
  { id: "mock_rap_1", title: "Lose Yourself", artist: "Eminem", album: "8 Mile", cover: "https://i.scdn.co/image/ab67616d0000b273c2c2c2c2c2c2c2c2c2c2c2c2", url: "https://p.scdn.co/mp3-preview/sample41", duration: 326, source: "spotify", popularity: 94 },
  { id: "mock_rap_2", title: "HUMBLE.", artist: "Kendrick Lamar", album: "DAMN.", cover: "https://i.scdn.co/image/ab67616d0000b273d3d3d3d3d3d3d3d3d3d3d3d3", url: "https://p.scdn.co/mp3-preview/sample42", duration: 177, source: "spotify", popularity: 93 },
  { id: "mock_rap_3", title: "Sicko Mode", artist: "Travis Scott", album: "Astroworld", cover: "https://i.scdn.co/image/ab67616d0000b273e4e4e4e4e4e4e4e4e4e4e4e4", url: "https://p.scdn.co/mp3-preview/sample43", duration: 312, source: "spotify", popularity: 92 },
  { id: "mock_rap_4", title: "God\'s Plan", artist: "Drake", album: "Scorpion", cover: "https://i.scdn.co/image/ab67616d0000b273f5f5f5f5f5f5f5f5f5f5f5f5", url: "https://p.scdn.co/mp3-preview/sample44", duration: 198, source: "spotify", popularity: 91 },
  { id: "mock_rap_5", title: "Ni**as in Paris", artist: "Jay-Z & Kanye West", album: "Watch the Throne", cover: "https://i.scdn.co/image/ab67616d0000b273a6a6a6a6a6a6a6a6a6a6a6a6", url: "https://p.scdn.co/mp3-preview/sample45", duration: 219, source: "spotify", popularity: 90 },
  // 🎷 Jazz
  { id: "mock_jazz_1", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", cover: "https://i.scdn.co/image/ab67616d0000b273b7b7b7b7b7b7b7b7b7b7b7b7", url: "https://p.scdn.co/mp3-preview/sample46", duration: 324, source: "spotify", popularity: 82 },
  { id: "mock_jazz_2", title: "So What", artist: "Miles Davis", album: "Kind of Blue", cover: "https://i.scdn.co/image/ab67616d0000b273c8c8c8c8c8c8c8c8c8c8c8c8", url: "https://p.scdn.co/mp3-preview/sample47", duration: 434, source: "spotify", popularity: 83 },
  { id: "mock_jazz_3", title: "Fly Me to the Moon", artist: "Frank Sinatra", album: "It Might as Well Be Swing", cover: "https://i.scdn.co/image/ab67616d0000b273d9d9d9d9d9d9d9d9d9d9d9d9", url: "https://p.scdn.co/mp3-preview/sample48", duration: 147, source: "spotify", popularity: 85 },
  { id: "mock_jazz_4", title: "What a Wonderful World", artist: "Louis Armstrong", album: "What a Wonderful World", cover: "https://i.scdn.co/image/ab67616d0000b273e0e0e0e0e0e0e0e0e0e0e0e0", url: "https://p.scdn.co/mp3-preview/sample49", duration: 139, source: "spotify", popularity: 86 },
  { id: "mock_jazz_5", title: "Summertime", artist: "Ella Fitzgerald", album: "Ella Fitzgerald Sings", cover: "https://i.scdn.co/image/ab67616d0000b273f1f1f1f1f1f1f1f1f1f1f1f1", url: "https://p.scdn.co/mp3-preview/sample50", duration: 288, source: "spotify", popularity: 84 },
  // 🎻 Clássica
  { id: "mock_clas_1", title: "Four Seasons - Spring", artist: "Vivaldi", album: "The Four Seasons", cover: "https://i.scdn.co/image/ab67616d0000b273e2e2e2e2e2e2e2e2e2e2e2e2", url: "https://p.scdn.co/mp3-preview/sample51", duration: 189, source: "spotify", popularity: 80 },
  { id: "mock_clas_2", title: "Moonlight Sonata", artist: "Beethoven", album: "Piano Sonatas", cover: "https://i.scdn.co/image/ab67616d0000b273f3f3f3f3f3f3f3f3f3f3f3f3", url: "https://p.scdn.co/mp3-preview/sample52", duration: 900, source: "spotify", popularity: 81 },
  { id: "mock_clas_3", title: "Clair de Lune", artist: "Debussy", album: "Suite Bergamasque", cover: "https://i.scdn.co/image/ab67616d0000b273a4a4a4a4a4a4a4a4a4a4a4a4", url: "https://p.scdn.co/mp3-preview/sample53", duration: 300, source: "spotify", popularity: 79 },
  { id: "mock_clas_4", title: "Canon in D", artist: "Pachelbel", album: "Canon & Gigue", cover: "https://i.scdn.co/image/ab67616d0000b273b5b5b5b5b5b5b5b5b5b5b5b5", url: "https://p.scdn.co/mp3-preview/sample54", duration: 270, source: "spotify", popularity: 78 },
  { id: "mock_clas_5", title: "The Marriage of Figaro", artist: "Mozart", album: "Opera Arias", cover: "https://i.scdn.co/image/ab67616d0000b273c6c6c6c6c6c6c6c6c6c6c6c6", url: "https://p.scdn.co/mp3-preview/sample55", duration: 240, source: "spotify", popularity: 77 },
  // 🌿 Reggae
  { id: "mock_regg_1", title: "No Woman, No Cry", artist: "Bob Marley", album: "Natty Dread", cover: "https://i.scdn.co/image/ab67616d0000b273d7d7d7d7d7d7d7d7d7d7d7d7", url: "https://p.scdn.co/mp3-preview/sample56", duration: 230, source: "spotify", popularity: 89 },
  { id: "mock_regg_2", title: "Three Little Birds", artist: "Bob Marley", album: "Exodus", cover: "https://i.scdn.co/image/ab67616d0000b273e8e8e8e8e8e8e8e8e8e8e8e8", url: "https://p.scdn.co/mp3-preview/sample57", duration: 180, source: "spotify", popularity: 88 },
  { id: "mock_regg_3", title: "Redemption Song", artist: "Bob Marley", album: "Uprising", cover: "https://i.scdn.co/image/ab67616d0000b273f9f9f9f9f9f9f9f9f9f9f9f9", url: "https://p.scdn.co/mp3-preview/sample58", duration: 227, source: "spotify", popularity: 87 },
  { id: "mock_regg_4", title: "Is This Love", artist: "Bob Marley", album: "Kaya", cover: "https://i.scdn.co/image/ab67616d0000b273a0a0a0a0a0a0a0a0a0a0a0a0", url: "https://p.scdn.co/mp3-preview/sample59", duration: 215, source: "spotify", popularity: 86 },
  { id: "mock_regg_5", title: "Buffalo Soldier", artist: "Bob Marley", album: "Confrontation", cover: "https://i.scdn.co/image/ab67616d0000b273b1b1b1b1b1b1b1b1b1b1b1b1", url: "https://p.scdn.co/mp3-preview/sample60", duration: 257, source: "spotify", popularity: 85 },
  // 💃 Latino/Reggaeton
  { id: "mock_lat_1", title: "Despacito", artist: "Luis Fonsi", album: "Vida", cover: "https://i.scdn.co/image/ab67616d0000b273c2c2c2c2c2c2c2c2c2c2c2c2", url: "https://p.scdn.co/mp3-preview/sample61", duration: 228, source: "spotify", popularity: 95 },
  { id: "mock_lat_2", title: "Dakiti", artist: "Bad Bunny", album: "El Último Tour", cover: "https://i.scdn.co/image/ab67616d0000b273d3d3d3d3d3d3d3d3d3d3d3d3", url: "https://p.scdn.co/mp3-preview/sample62", duration: 205, source: "spotify", popularity: 94 },
  { id: "mock_lat_3", title: "Tusa", artist: "Karol G", album: "KG0516", cover: "https://i.scdn.co/image/ab67616d0000b273e4e4e4e4e4e4e4e4e4e4e4e4", url: "https://p.scdn.co/mp3-preview/sample63", duration: 200, source: "spotify", popularity: 93 },
  { id: "mock_lat_4", title: "Vida Loca", artist: "Black Eyed Peas", album: "Translation", cover: "https://i.scdn.co/image/ab67616d0000b273f5f5f5f5f5f5f5f5f5f5f5f5", url: "https://p.scdn.co/mp3-preview/sample64", duration: 210, source: "spotify", popularity: 88 },
  { id: "mock_lat_5", title: "Bailando", artist: "Enrique Iglesias", album: "Sex and Love", cover: "https://i.scdn.co/image/ab67616d0000b273a6a6a6a6a6a6a6a6a6a6a6a6", url: "https://p.scdn.co/mp3-preview/sample65", duration: 216, source: "spotify", popularity: 89 },
  // 🎮 Gaming/Focus
  { id: "mock_gam_1", title: "The Legend of Zelda Theme", artist: "Koji Kondo", album: "Zelda OST", cover: "https://i.scdn.co/image/ab67616d0000b273b8b8b8b8b8b8b8b8b8b8b8b8", url: "https://p.scdn.co/mp3-preview/sample66", duration: 180, source: "spotify", popularity: 75 },
  { id: "mock_gam_2", title: "Megalovania", artist: "Toby Fox", album: "Undertale OST", cover: "https://i.scdn.co/image/ab67616d0000b273c9c9c9c9c9c9c9c9c9c9c9c9", url: "https://p.scdn.co/mp3-preview/sample67", duration: 160, source: "spotify", popularity: 78 },
  { id: "mock_gam_3", title: "Toss a Coin", artist: "Joey Batey", album: "The Witcher", cover: "https://i.scdn.co/image/ab67616d0000b273d0d0d0d0d0d0d0d0d0d0d0d0", url: "https://p.scdn.co/mp3-preview/sample68", duration: 195, source: "spotify", popularity: 76 },
  { id: "mock_gam_4", title: "Main Theme - Skyrim", artist: "Jeremy Soule", album: "Skyrim OST", cover: "https://i.scdn.co/image/ab67616d0000b273e1e1e1e1e1e1e1e1e1e1e1e1", url: "https://p.scdn.co/mp3-preview/sample69", duration: 240, source: "spotify", popularity: 74 },
  { id: "mock_gam_5", title: "One-Winged Angel", artist: "Nobuo Uematsu", album: "FFVII OST", cover: "https://i.scdn.co/image/ab67616d0000b273f2f2f2f2f2f2f2f2f2f2f2f2", url: "https://p.scdn.co/mp3-preview/sample70", duration: 420, source: "spotify", popularity: 77 },
  // ☕ Lo-Fi / Chill
  { id: "mock_lofi_1", title: "lofi study beats", artist: "ChilledCow", album: "Lofi Girl", cover: "https://i.scdn.co/image/ab67616d0000b273a3a3a3a3a3a3a3a3a3a3a3a3", url: "https://p.scdn.co/mp3-preview/sample71", duration: 180, source: "spotify", popularity: 72 },
  { id: "mock_lofi_2", title: "Rainy Day", artist: "Lofi Fruits", album: "Chill Vibes", cover: "https://i.scdn.co/image/ab67616d0000b273b4b4b4b4b4b4b4b4b4b4b4b4", url: "https://p.scdn.co/mp3-preview/sample72", duration: 160, source: "spotify", popularity: 71 },
  { id: "mock_lofi_3", title: "Midnight Coffee", artist: "Chillhop", album: "Essentials", cover: "https://i.scdn.co/image/ab67616d0000b273c5c5c5c5c5c5c5c5c5c5c5c5", url: "https://p.scdn.co/mp3-preview/sample73", duration: 175, source: "spotify", popularity: 70 },
  { id: "mock_lofi_4", title: "Dreaming", artist: "Lofi Girl", album: "Sleepy", cover: "https://i.scdn.co/image/ab67616d0000b273d6d6d6d6d6d6d6d6d6d6d6d6", url: "https://p.scdn.co/mp3-preview/sample74", duration: 190, source: "spotify", popularity: 69 },
  { id: "mock_lofi_5", title: "Sunset Drive", artist: "Chill Beats", album: "Evening", cover: "https://i.scdn.co/image/ab67616d0000b273e7e7e7e7e7e7e7e7e7e7e7e7", url: "https://p.scdn.co/mp3-preview/sample75", duration: 185, source: "spotify", popularity: 68 },
]

// Helper: gerar 15 músicas mockadas diferentes para um mix
// ============================================
// 🎯 MAPEAMENTO DE GÊNEROS (sinônimos e variações)
// ============================================
const GENRE_ALIASES = {
  'pagode': ['pagode', 'samba'],
  'samba': ['samba', 'pagode'],
  'sertanejo': ['sertanejo'],
  'funk': ['funk'],
  'rock': ['rock', 'indie'],
  'pop': ['pop'],
  'mpb': ['mpb', 'samba'],
  'gospel': ['gospel'],
  'eletronica': ['eletronica'],
  'eletrônica': ['eletronica'],
  'rap': ['rap'],
  'hip hop': ['rap'],
  'hiphop': ['rap'],
  'reggae': ['reggae'],
  'indie': ['indie', 'rock'],
  'latino': ['latino'],
  'reggaeton': ['latino'],
  'lo-fi': ['lofi'],
  'lofi': ['lofi'],
  'chill': ['lofi', 'indie', 'mpb']
}

function normalizeGenreName(nome) {
  return (nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function getGenreAliases(generoNome) {
  const normalized = normalizeGenreName(generoNome)
  return GENRE_ALIASES[normalized] || [normalized]
}

// ============================================
// 🎲 EMBARALHAR COM SEED
// ============================================
function seededShuffle(array, seed) {
  const arr = [...array]
  let s = seed
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ============================================
// 🎵 GERAR MOCK TRACKS FILTRADO POR GÊNERO/VIBE
// ============================================
function gerarMockTracks(tipo, seed, generoNome = "", artistaNome = "", vibeNome = "") {
  let poolFiltrado = []
  
  // 1️⃣ FILTRAR POR GÊNERO (com aliases)
  if (generoNome && generoNome.trim()) {
    const aliases = getGenreAliases(generoNome)
    poolFiltrado = MOCK_TRACKS_POOL.filter(t => aliases.includes(t.genre))
  }
  
  // 2️⃣ Se não encontrou nada, usar pool completo
  if (poolFiltrado.length === 0) {
    poolFiltrado = [...MOCK_TRACKS_POOL]
  }
  
  // 3️⃣ Embaralhar e pegar 15
  const shuffled = seededShuffle(poolFiltrado, seed)
  return shuffled.slice(0, 15).map((t, i) => ({
    ...t,
    id: `${t.id}_mix${seed}_${i}`,
    categoria: 'musicas',
    razao: generoNome ? `Top ${generoNome}` : 'Recomendado para você'
  }))
}

// ============================================
// 🎵 MOCK HELPERS PARA RECOMENDAÇÕES
// ============================================

function gerarMockAlbuns(generos, artistas, seed) {
  const generoPrincipal = generos[0] || 'pop'
  const aliases = getGenreAliases(generoPrincipal)
  
  // Pegar músicas do gênero certo e extrair álbuns únicos
  const tracksDoGenero = MOCK_TRACKS_POOL.filter(t => aliases.includes(t.genre))
  const albunsMap = new Map()
  
  tracksDoGenero.forEach((t, i) => {
    const key = `${t.artist}_${t.album}`
    if (!albunsMap.has(key)) {
      albunsMap.set(key, {
        id: `mock_album_${seed}_${i}`,
        title: t.album,
        artist: t.artist,
        cover: t.cover,
        releaseDate: `202${(i % 4) + 1}-0${(i % 9) + 1}-15`,
        totalTracks: 10 + (i % 8),
        source: 'spotify',
        type: 'album',
        razao: `Álbum de ${generoPrincipal}`
      })
    }
  })
  
  let result = Array.from(albunsMap.values())
  
  // Se faltarem álbuns, completar com outros do pool
  if (result.length < 15) {
    const extras = MOCK_TRACKS_POOL
      .filter(t => !result.some(a => a.title === t.album))
      .slice(0, 15 - result.length)
      .map((t, i) => ({
        id: `mock_album_extra_${seed}_${i}`,
        title: t.album,
        artist: t.artist,
        cover: t.cover,
        releaseDate: `202${(i % 4) + 1}-0${(i % 9) + 1}-15`,
        totalTracks: 10 + (i % 8),
        source: 'spotify',
        type: 'album',
        razao: `Recomendado para você`
      }))
    result = [...result, ...extras]
  }
  
  return seededShuffle(result, seed).slice(0, 15)
}

function gerarMockArtistas(artistas, generos, seed) {
  const generoPrincipal = generos[0] || 'pop'
  const aliases = getGenreAliases(generoPrincipal)
  
  // Extrair artistas únicos do pool, filtrados por gênero
  const tracksDoGenero = MOCK_TRACKS_POOL.filter(t => aliases.includes(t.genre))
  const artistasMap = new Map()
  
  tracksDoGenero.forEach((t, i) => {
    if (!artistasMap.has(t.artist)) {
      artistasMap.set(t.artist, {
        id: `mock_artist_${seed}_${i}`,
        title: t.artist,
        cover: t.cover,
        followers: 1000000 + Math.floor(Math.random() * 50000000),
        genres: [generoPrincipal],
        popularity: t.popularity,
        source: 'spotify',
        type: 'artist',
        razao: `Artista de ${generoPrincipal}`
      })
    }
  })
  
  // Adicionar artistas favoritos do usuário no topo
  artistas.forEach((nome, i) => {
    if (!Array.from(artistasMap.values()).some(a => normalizeGenreName(a.title) === normalizeGenreName(nome))) {
      artistasMap.set(`fav_${nome}`, {
        id: `mock_artist_fav_${seed}_${i}`,
        title: nome,
        cover: `https://picsum.photos/seed/${encodeURIComponent(nome)}/300/300`,
        followers: 5000000 + Math.floor(Math.random() * 30000000),
        genres: [generoPrincipal],
        popularity: 85 + (i % 10),
        source: 'spotify',
        type: 'artist',
        razao: 'Você curte este artista'
      })
    }
  })
  
  let result = Array.from(artistasMap.values())
  
  // Completar com artistas populares se faltar
  if (result.length < 15) {
    const extras = MOCK_TRACKS_POOL
      .filter(t => !result.some(a => a.title === t.artist))
      .slice(0, 15 - result.length)
      .map((t, i) => ({
        id: `mock_artist_extra_${seed}_${i}`,
        title: t.artist,
        cover: t.cover,
        followers: 500000 + Math.floor(Math.random() * 10000000),
        genres: [t.genre],
        popularity: t.popularity,
        source: 'spotify',
        type: 'artist',
        razao: 'Artistas populares'
      }))
    result = [...result, ...extras]
  }
  
  return seededShuffle(result, seed).slice(0, 15)
}

function gerarMockPlaylists(vibes, generos, seed) {
  const vibePrincipal = vibes[0] || 'Música'
  const generoPrincipal = generos[0] || 'Pop'
  const aliases = getGenreAliases(generoPrincipal)
  
  const tracksRelacionadas = MOCK_TRACKS_POOL.filter(t => aliases.includes(t.genre))
  const coversPool = tracksRelacionadas.length > 0 ? tracksRelacionadas : MOCK_TRACKS_POOL
  
  const templates = [
    { name: `This Is ${generoPrincipal}`, desc: `Os maiores hits de ${generoPrincipal}` },
    { name: `Top ${generoPrincipal} Hits`, desc: `As mais tocadas de ${generoPrincipal}` },
    { name: `${vibePrincipal} ${generoPrincipal}`, desc: `${generoPrincipal} para ${vibePrincipal}` },
    { name: `Essentials: ${generoPrincipal}`, desc: `O essencial de ${generoPrincipal}` },
    { name: `${generoPrincipal} Clássicos`, desc: `Clássicos eternos de ${generoPrincipal}` },
    { name: `${generoPrincipal} 2024`, desc: `Novidades em ${generoPrincipal}` },
    { name: `Mix ${generoPrincipal}`, desc: `Mix diário de ${generoPrincipal}` },
    { name: `${generoPrincipal} Acústico`, desc: `Versões acústicas` },
    { name: `${generoPrincipal} para Treinar`, desc: `Energia para o treino` },
    { name: `${generoPrincipal} para Relaxar`, desc: `Tranquilidade em forma de música` },
    { name: `${generoPrincipal} Romântico`, desc: `Para momentos a dois` },
    { name: `Festa ${generoPrincipal}`, desc: `Para curtir com os amigos` },
    { name: `${generoPrincipal} Brasil`, desc: `O melhor de ${generoPrincipal} nacional` },
    { name: `Radar ${generoPrincipal}`, desc: `Descobertas em ${generoPrincipal}` },
    { name: `${generoPrincipal} On Repeat`, desc: `Você ouve sem parar` }
  ]
  
  const shuffled = seededShuffle(coversPool, seed)
  
  return templates.map((p, i) => ({
    id: `mock_playlist_${seed}_${i}`,
    title: p.name,
    description: p.desc,
    cover: shuffled[i % shuffled.length]?.cover || '',
    owner: 'SoundUp',
    tracksCount: 20 + (i * 3),
    source: 'spotify',
    type: 'playlist',
    razao: `Playlist de ${generoPrincipal}`
  })).slice(0, 15)
}

// Gradients pré-definidos
const MIX_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
]

// Mapeamento de vibes para termos de busca
const VIBE_SEARCH_MAP = {
  'Festa': ['party', 'dance', 'electronic', 'funk'],
  'Chill': ['chill', 'relax', 'acoustic', 'indie'],
  'Treino': ['workout', 'gym', 'motivation', 'electronic'],
  'Focus': ['focus', 'study', 'instrumental', 'ambient'],
  'Triste': ['sad', 'melancholic', 'acoustic', 'piano'],
  'Romântico': ['romance', 'love', 'acoustic', 'pop'],
  'Viajante': ['road trip', 'travel', 'indie', 'rock']
}

// ============================================
// 🎯 FUNÇÃO PRINCIPAL: GET USER MIXES
// ============================================

// ============================================
// 🎯 FUNÇÃO PRINCIPAL: GET USER MIXES (AJUSTADA)
// ============================================

const getUserMixes = async (userId, limit = 6) => {
  const mongoose = require('mongoose')
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID inválido')
  }

  const usuario = await Usuario.findById(userId)
    .populate('generos.locais', 'nome icon color')
    .populate('artistasFavoritos.locais', 'nome foto generos')
    .populate('vibesFavoritas.locais', 'nome emoji descricao gradient tags')
    .lean()

  if (!usuario) {
    throw new Error('Usuário não encontrado')
  }

  // ✅ VERIFICA SE TEM PREFERÊNCIAS (locais OU externos)
  const temGeneros = (usuario.generos?.locais?.length > 0) || (usuario.generos?.externos?.length > 0)
  const temArtistas = (usuario.artistasFavoritos?.locais?.length > 0) || (usuario.artistasFavoritos?.externos?.length > 0)
  const temVibes = (usuario.vibesFavoritas?.locais?.length > 0) || (usuario.vibesFavoritas?.externas?.length > 0)

  if (!temGeneros && !temArtistas && !temVibes) {
    return { 
      mixes: [],
      message: 'Nenhuma preferência encontrada. Complete o onboarding primeiro.',
      hasPreferences: false 
    }
  }

  const mixes = []
  const usedTrackIds = new Set()

  // Helper para extrair dados do usuário (funciona com locais E externos)
  const getGeneros = () => {
    const locais = (usuario.generos?.locais || []).map(g => ({
      id: g._id?.toString(),
      nome: g.nome,
      icon: g.icon,
      color: g.color,
      source: 'local'
    }))
    const externos = (usuario.generos?.externos || []).map(g => ({
      id: `ext_${g.source}_${g.externalId}`,
      nome: g.nome,
      icon: g.icon,
      color: g.color,
      source: g.source
    }))
    return [...locais, ...externos]
  }

  const getArtistas = () => {
    const locais = (usuario.artistasFavoritos?.locais || []).map(a => ({
      id: a._id?.toString(),
      nome: a.nome,
      foto: a.foto,
      source: 'local'
    }))
    const externos = (usuario.artistasFavoritos?.externos || []).map(a => ({
      id: `ext_${a.source}_${a.externalId}`,
      nome: a.nome,
      foto: a.imagem,
      source: a.source
    }))
    return [...locais, ...externos]
  }

  const getVibes = () => {
    const locais = (usuario.vibesFavoritas?.locais || []).map(v => ({
      id: v._id?.toString(),
      nome: v.nome,
      emoji: v.emoji,
      descricao: v.descricao,
      gradient: v.gradient,
      tags: v.tags,
      source: 'local'
    }))
    const externas = (usuario.vibesFavoritas?.externas || []).map(v => ({
      id: `ext_${v.source}_${v.externalId}`,
      nome: v.nome,
      emoji: v.emoji,
      descricao: v.descricao,
      gradient: v.gradient,
      tags: v.tags,
      source: v.source
    }))
    return [...locais, ...externas]
  }

  const generosCompletos = getGeneros()
  const artistasCompletos = getArtistas()
  const vibesCompletas = getVibes()

  let seedCounter = 1

  // ============================================
  // MIX 1: Baseado nos GÊNEROS favoritos
  // ============================================
  if (generosCompletos.length > 0) {
    const generoPrincipal = generosCompletos[0]
    
    // Tentar buscar da API primeiro
    let tracksGenero = []
    try {
      tracksGenero = await buscarTracksPorGenero(generoPrincipal.nome, 15, usedTrackIds)
    } catch (e) {
      console.warn('⚠️ API falhou para gênero, usando mock:', e.message)
    }
    
    // Se não conseguiu 15 da API, completar com mock
  // ✅ Sempre garantir 15 músicas do gênero correto
if (tracksGenero.length < 15) {
  const mockTracks = gerarMockTracks('genero', seedCounter++ + Date.now(), generoPrincipal.nome)
  // Remover duplicados por ID
  const existingIds = new Set(tracksGenero.map(t => t.id))
  const novas = mockTracks.filter(t => !existingIds.has(t.id))
  tracksGenero = [...tracksGenero, ...novas].slice(0, 15)
}
    
    tracksGenero.forEach(t => usedTrackIds.add(t.id))
    
    mixes.push({
      id: `mix_genero_${generoPrincipal.id}`,
      title: `${generoPrincipal.nome} para Você`,
      description: `15 hits de ${generoPrincipal.nome} selecionados especialmente`,
      tracks: 15,
      cover: tracksGenero[0]?.cover || tracksGenero[0]?.album?.cover_medium || '',
      gradient: generoPrincipal.color 
        ? `linear-gradient(135deg, ${generoPrincipal.color} 0%, #764ba2 100%)`
        : MIX_GRADIENTS[0],
      _tracks: tracksGenero,
      tipo: 'genero',
      basedOn: generoPrincipal.nome
    })
  }

  // ============================================
  // MIX 2: Baseado nos ARTISTAS favoritos
  // ============================================
  if (artistasCompletos.length > 0) {
    const artistasSelecionados = artistasCompletos.slice(0, 3)
    
    // Tentar buscar da API primeiro
    let tracksArtistas = []
    try {
      for (const artista of artistasSelecionados) {
        const tracks = await buscarTracksPorArtista(artista.nome, 5, usedTrackIds)
        tracks.forEach(t => {
          usedTrackIds.add(t.id)
          tracksArtistas.push(t)
        })
      }
    } catch (e) {
      console.warn('⚠️ API falhou para artistas, usando mock:', e.message)
    }
    
    // Se não conseguiu 15 da API, completar com mock
    if (tracksArtistas.length < 15) {
      const mockTracks = gerarMockTracks('artistas', seedCounter++ + Date.now(), '', artistasSelecionados[0]?.nome)
      const needed = 15 - tracksArtistas.length
      tracksArtistas = [...tracksArtistas, ...mockTracks.slice(0, needed)]
    }
    
    const shuffled = tracksArtistas.slice(0, 15).sort(() => Math.random() - 0.5)
    
    mixes.push({
      id: `mix_artistas_${Date.now()}`,
      title: `Seus Artistas Favoritos`,
      description: artistasSelecionados.map(a => a.nome).join(', ') + ' e mais',
      tracks: 15,
      cover: shuffled[0]?.cover || shuffled[0]?.album?.cover_medium || '',
      gradient: MIX_GRADIENTS[1],
      _tracks: shuffled,
      tipo: 'artistas',
      basedOn: artistasSelecionados.map(a => a.nome).join(', ')
    })
  }

  // ============================================
  // MIX 3: Baseado nas VIBES favoritas
  // ============================================
  if (vibesCompletas.length > 0) {
    const vibePrincipal = vibesCompletas[0]
    const searchTerms = VIBE_SEARCH_MAP[vibePrincipal.nome] || [vibePrincipal.nome.toLowerCase()]
    
    // Tentar buscar da API primeiro
    let tracksVibe = []
    try {
      tracksVibe = await buscarTracksPorVibe(searchTerms, 15, usedTrackIds)
    } catch (e) {
      console.warn('⚠️ API falhou para vibe, usando mock:', e.message)
    }
    
    // Se não conseguiu 15 da API, completar com mock
    if (tracksVibe.length < 15) {
      const mockTracks = gerarMockTracks('vibe', seedCounter++ + Date.now(), '', '', vibePrincipal.nome)
      const needed = 15 - tracksVibe.length
      tracksVibe = [...tracksVibe, ...mockTracks.slice(0, needed)]
    }
    
    tracksVibe.forEach(t => usedTrackIds.add(t.id))
    
    mixes.push({
      id: `mix_vibe_${vibePrincipal.id}`,
      title: `${vibePrincipal.nome} ${vibePrincipal.emoji || '✨'}`,
      description: vibePrincipal.descricao || `15 músicas perfeitas para ${vibePrincipal.nome}`,
      tracks: 15,
      cover: tracksVibe[0]?.cover || tracksVibe[0]?.album?.cover_medium || '',
      gradient: vibePrincipal.gradient || MIX_GRADIENTS[2],
      _tracks: tracksVibe,
      tipo: 'vibe',
      basedOn: vibePrincipal.nome
    })
  }

  // ============================================
  // MIX 4: Descobertas (gêneros + artistas misturados)
  // ============================================
  if (generosCompletos.length > 1 || artistasCompletos.length > 1) {
    const termosBusca = [
      ...generosCompletos.slice(1).map(g => g.nome),
      ...artistasCompletos.slice(1).map(a => a.nome)
    ].filter(Boolean)
    
    if (termosBusca.length > 0) {
      // Tentar buscar da API primeiro
      let tracksDescobertas = []
      try {
        tracksDescobertas = await buscarTracksDescobertas(termosBusca, 15, usedTrackIds)
      } catch (e) {
        console.warn('⚠️ API falhou para descobertas, usando mock:', e.message)
      }
      
      // Se não conseguiu 15 da API, completar com mock
      if (tracksDescobertas.length < 15) {
        const mockTracks = gerarMockTracks('descobertas', seedCounter++ + Date.now())
        const needed = 15 - tracksDescobertas.length
        tracksDescobertas = [...tracksDescobertas, ...mockTracks.slice(0, needed)]
      }
      
      tracksDescobertas.forEach(t => usedTrackIds.add(t.id))
      
      mixes.push({
        id: `mix_descobertas_${Date.now()}`,
        title: `Descobertas da Semana`,
        description: `15 novas músicas baseadas no seu gosto por ${generosCompletos[0]?.nome || 'vários estilos'}`,
        tracks: 15,
        cover: tracksDescobertas[0]?.cover || tracksDescobertas[0]?.album?.cover_medium || '',
        gradient: MIX_GRADIENTS[3],
        _tracks: tracksDescobertas,
        tipo: 'descobertas',
        basedOn: 'múltiplos gostos'
      })
    }
  }

  // ============================================
  // MIX 5: Top do Gênero Principal
  // ============================================
  if (mixes.length < limit && generosCompletos.length > 0) {
    // Tentar buscar da API primeiro
    let tracksTop = []
    try {
      tracksTop = await buscarTracksTopGenero(generosCompletos[0].nome, 15, usedTrackIds)
    } catch (e) {
      console.warn('⚠️ API falhou para top, usando mock:', e.message)
    }
    
    // Se não conseguiu 15 da API, completar com mock
    if (tracksTop.length < 15) {
      const mockTracks = gerarMockTracks('top', seedCounter++ + Date.now(), generosCompletos[0].nome)
      const needed = 15 - tracksTop.length
      tracksTop = [...tracksTop, ...mockTracks.slice(0, needed)]
    }
    
    tracksTop.forEach(t => usedTrackIds.add(t.id))
    
    mixes.push({
      id: `mix_top_${Date.now()}`,
      title: `Top ${generosCompletos[0].nome}`,
      description: `As 15 mais tocadas do momento em ${generosCompletos[0].nome}`,
      tracks: 15,
      cover: tracksTop[0]?.cover || tracksTop[0]?.album?.cover_medium || '',
      gradient: MIX_GRADIENTS[4],
      _tracks: tracksTop,
      tipo: 'top',
      basedOn: generosCompletos[0].nome
    })
  }

  // ============================================
  // MIX 6: On Repeat (se ainda precisar de mais)
  // ============================================
  if (mixes.length < limit) {
    const mockTracks = gerarMockTracks('mix', seedCounter++ + Date.now())
    
    mixes.push({
      id: `mix_onrepeat_${Date.now()}`,
      title: `On Repeat`,
      description: `15 músicas que você ama ouvir`,
      tracks: 15,
      cover: mockTracks[0]?.cover || '',
      gradient: MIX_GRADIENTS[5],
      _tracks: mockTracks,
      tipo: 'mix',
      basedOn: 'seus gostos'
    })
  }

  const mixesFinal = mixes.slice(0, limit)

  return {
    mixes: mixesFinal,
    total: mixesFinal.length,
    hasPreferences: true,
    preferences: {
      generos: generosCompletos.map(g => g.nome),
      artistas: artistasCompletos.map(a => a.nome),
      vibes: vibesCompletas.map(v => v.nome)
    }
  }
}

// ============================================
// 🔍 BUSCAS NAS APIs DE MÚSICA
// ============================================

async function buscarTracksPorGenero(genero, limit = 10, excludeIds = new Set()) {
  try {
    const spotifyResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: `genre:${genero.toLowerCase()}`,
        type: 'track',
        limit: limit * 2,
        market: 'BR'
      }
    })
    
    const tracks = spotifyResponse.data?.tracks?.items
      ?.filter(t => t.preview_url && !excludeIds.has(t.id))
      ?.map(t => normalizarTrackSpotify(t))
      ?.slice(0, limit)
    
    if (tracks && tracks.length > 0) return tracks
    
    const deezerResponse = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: genero, limit: limit * 2 },
      timeout: 5000
    })
    
    return deezerResponse.data?.data
      ?.filter(t => t.preview && !excludeIds.has(t.id.toString()))
      ?.map(t => normalizarTrackDeezer(t))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca gênero ${genero}:`, error.message)
    return []
  }
}

async function buscarTracksPorArtista(artista, limit = 5, excludeIds = new Set()) {
  try {
    const searchResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: `artist:${artista}`,
        type: 'artist',
        limit: 1,
        market: 'BR'
      }
    })
    
    const artistId = searchResponse.data?.artists?.items?.[0]?.id
    
    if (artistId) {
      const topTracks = await spotifyRequest({
        method: 'GET',
        url: `${SPOTIFY_API_URL}/artists/${artistId}/top-tracks`,
        params: { market: 'BR' }
      })
      
      const tracks = topTracks.data?.tracks
        ?.filter(t => t.preview_url && !excludeIds.has(t.id))
        ?.map(t => normalizarTrackSpotify(t))
        ?.slice(0, limit)
      
      if (tracks && tracks.length > 0) return tracks
    }
    
    const deezerResponse = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: `artist:"${artista}"`, limit: limit * 2 },
      timeout: 5000
    })
    
    return deezerResponse.data?.data
      ?.filter(t => t.preview && !excludeIds.has(t.id.toString()))
      ?.map(t => normalizarTrackDeezer(t))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca artista ${artista}:`, error.message)
    return []
  }
}

async function buscarTracksPorVibe(searchTerms, limit = 10, excludeIds = new Set()) {
  try {
    const query = searchTerms.join(' OR ')
    
    const spotifyResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: query,
        type: 'track',
        limit: limit * 2,
        market: 'BR'
      }
    })
    
    const tracks = spotifyResponse.data?.tracks?.items
      ?.filter(t => t.preview_url && !excludeIds.has(t.id))
      ?.map(t => normalizarTrackSpotify(t))
      ?.slice(0, limit)
    
    if (tracks && tracks.length > 0) return tracks
    
    const deezerResponse = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: searchTerms[0], limit: limit * 2 },
      timeout: 5000
    })
    
    return deezerResponse.data?.data
      ?.filter(t => t.preview && !excludeIds.has(t.id.toString()))
      ?.map(t => normalizarTrackDeezer(t))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca vibe:`, error.message)
    return []
  }
}

async function buscarTracksDescobertas(termos, limit = 10, excludeIds = new Set()) {
  const query = termos.slice(0, 3).join(' ')
  return buscarTracksPorVibe([query], limit, excludeIds)
}

async function buscarTracksTopGenero(genero, limit = 10, excludeIds = new Set()) {
  return buscarTracksPorGenero(genero, limit, excludeIds)
}

// ============================================
// 🔄 NORMALIZAÇÃO DE TRACKS
// ============================================

function normalizarTrackSpotify(track) {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists?.map(a => a.name).join(', '),
    album: track.album?.name,
    cover: track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || '',
    url: track.preview_url,
    duration: Math.floor(track.duration_ms / 1000),
    source: 'spotify',
    popularity: track.popularity
  }
}

function normalizarTrackDeezer(track) {
  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.artist?.name,
    album: track.album?.title,
    cover: track.album?.cover_medium || track.album?.cover || '',
    url: track.preview,
    duration: track.duration,
    source: 'deezer',
    popularity: track.rank
  }
}

const recuperarSenha = async (email, novaSenha) => {
  const usuario = await Usuario.findOne({ email })

  if (!usuario) {
    throw new Error('Usuário não encontrado')
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10)

  await Usuario.updateOne(
    { email },
    { $set: { senha: senhaHash } }
  )

  return true
}

const getBlockRelation = async (viewerId, targetUserId) => {
  if (!viewerId || !targetUserId || sameId(viewerId, targetUserId)) {
    return {
      blocked: false,
      blockedByMe: false,
      blockedMe: false
    }
  }

  const [blockedByMe, blockedMe] = await Promise.all([
    Bloqueio.findOne({
      bloqueador: viewerId,
      bloqueado: targetUserId
    }).lean(),
    Bloqueio.findOne({
      bloqueador: targetUserId,
      bloqueado: viewerId
    }).lean()
  ])

  return {
    blocked: !!(blockedByMe || blockedMe),
    blockedByMe: !!blockedByMe,
    blockedMe: !!blockedMe
  }
}

const getPublicFollowers = async (targetUserId, viewerId) => {
  const podeAcessar = await canAccessProfile(targetUserId, viewerId)
  if (!podeAcessar) {
    const err = new Error('Perfil privado')
    err.code = 'PROFILE_PRIVATE'
    throw err
  }

  const bloqueado = await isResourceBlocked(targetUserId, viewerId, 'seguidores')
  if (bloqueado) {
    const err = new Error('Seguidores ocultos para você')
    err.code = 'FOLLOWERS_BLOCKED'
    throw err
  }

  const followingViewer = viewerId
    ? await Follow.find({
        seguidor_id: viewerId,
        tipo: 'usuario'
      }).select('seguindo_id').lean()
    : []

  const followingViewerSet = new Set(
    followingViewer.map(item => String(item.seguindo_id))
  )

  const followers = await Follow.find({
    seguindo_id: targetUserId,
    tipo: 'usuario'
  })
    .populate('seguidor_id', 'nome username avatar')
    .sort({ createdAt: -1 })
    .lean()

  return followers
    .map(item => {
      const user = item.seguidor_id
      if (!user) return null

      return {
        _id: user._id,
        id: user._id,
        nome: user.nome,
        username: user.username,
        avatar: user.avatar || null,
        tipo: 'usuario',
        isFollowing: followingViewerSet.has(String(user._id))
      }
    })
    .filter(Boolean)
}

const getPublicFollowing = async (targetUserId, viewerId) => {
  const podeAcessar = await canAccessProfile(targetUserId, viewerId)
  if (!podeAcessar) {
    const err = new Error('Perfil privado')
    err.code = 'PROFILE_PRIVATE'
    throw err
  }

  const bloqueado = await isResourceBlocked(targetUserId, viewerId, 'seguindo')
  if (bloqueado) {
    const err = new Error('Seguindo oculto para você')
    err.code = 'FOLLOWING_BLOCKED'
    throw err
  }

  const [seguindoUsuarios, seguindoCantores] = await Promise.all([
    Follow.find({
      seguidor_id: targetUserId,
      tipo: 'usuario'
    })
      .populate('seguindo_id', 'nome username avatar')
      .sort({ createdAt: -1 })
      .lean(),

    Follow.find({
      seguidor_id: targetUserId,
      tipo: 'cantor'
    })
      .populate('seguindo_id', 'nome foto avatar')
      .sort({ createdAt: -1 })
      .lean()
  ])

  const usuarios = seguindoUsuarios
    .map(item => {
      const user = item.seguindo_id
      if (!user) return null

      return {
        _id: user._id,
        id: user._id,
        nome: user.nome,
        username: user.username,
        avatar: user.avatar || null,
        tipo: 'usuario'
      }
    })
    .filter(Boolean)

  const cantores = seguindoCantores
    .map(item => {
      const cantor = item.seguindo_id
      if (!cantor) return null

      return {
        _id: cantor._id,
        id: cantor._id,
        nome: cantor.nome,
        avatar: cantor.foto || cantor.avatar || null,
        foto: cantor.foto || cantor.avatar || null,
        tipo: 'cantor'
      }
    })
    .filter(Boolean)

  return [...usuarios, ...cantores]
}

const blockUser = async (actorId, targetUserId) => {
  if (sameId(actorId, targetUserId)) {
    throw new Error('Você não pode bloquear a si mesmo')
  }

  await Bloqueio.findOneAndUpdate(
    {
      bloqueador: actorId,
      bloqueado: targetUserId
    },
    {
      $setOnInsert: {
        bloqueador: actorId,
        bloqueado: targetUserId
      }
    },
    {
      upsert: true,
      new: true
    }
  )

  await Promise.all([
    Follow.deleteMany({
      tipo: 'usuario',
      $or: [
        { seguidor_id: actorId, seguindo_id: targetUserId },
        { seguidor_id: targetUserId, seguindo_id: actorId }
      ]
    }),
    PrivacidadeAtividade.deleteMany({
      $or: [
        { usuarioDono: actorId, usuarioBloqueado: targetUserId },
        { usuarioDono: targetUserId, usuarioBloqueado: actorId }
      ]
    }),
    Usuario.updateOne(
      { _id: actorId },
      { $pull: { solicitacoesSeguir: { usuario: targetUserId } } }
    ),
    Usuario.updateOne(
      { _id: targetUserId },
      { $pull: { solicitacoesSeguir: { usuario: actorId } } }
    )
  ])

  return {
    blocked: true,
    blockedByMe: true,
    blockedMe: false
  }
}

const unblockUser = async (actorId, targetUserId) => {
  await Bloqueio.findOneAndDelete({
    bloqueador: actorId,
    bloqueado: targetUserId
  })

  return {
    blocked: false,
    blockedByMe: false,
    blockedMe: false
  }
}

const getBlockStatus = async (actorId, targetUserId) => {
  return getBlockRelation(actorId, targetUserId)
}

const reportUser = async (denuncianteId, denunciadoId, motivo, chat = null) => {
  if (sameId(denuncianteId, denunciadoId)) {
    throw new Error('Você não pode denunciar a si mesmo')
  }

  if (!motivo || !String(motivo).trim()) {
    throw new Error('Motivo da denúncia é obrigatório')
  }

  const denuncia = await Denuncia.create({
    denunciante: denuncianteId,
    denunciado: denunciadoId,
    chat,
    motivo: String(motivo).trim()
  })

  return denuncia
}

const buscarRecomendacoesCompletas = async (userId, tipo = 'tudo', limit = 50) => {
  const mongoose = require('mongoose')
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID inválido')
  }

  const usuario = await Usuario.findById(userId)
    .populate('generos.locais', 'nome icon color')
    .populate('artistasFavoritos.locais', 'nome foto generos')
    .populate('vibesFavoritas.locais', 'nome emoji descricao gradient tags')
    .lean()

  if (!usuario) throw new Error('Usuário não encontrado')

  const generosNomes = [
    ...(usuario.generos?.locais || []).map(g => g.nome),
    ...(usuario.generos?.externos || []).map(g => g.nome)
  ].filter(Boolean)

  const artistasNomes = [
    ...(usuario.artistasFavoritos?.locais || []).map(a => a.nome),
    ...(usuario.artistasFavoritos?.externos || []).map(a => a.nome)
  ].filter(Boolean)

  const vibesNomes = [
    ...(usuario.vibesFavoritas?.locais || []).map(v => v.nome),
    ...(usuario.vibesFavoritas?.externas || []).map(v => v.nome)
  ].filter(Boolean)

  // ✅ GARANTIR QUE SEMPRE TEMOS DADOS — usar preferências ou defaults
  const generosFallback = generosNomes.length > 0 ? generosNomes : ['Pop', 'Rock', 'Funk']
  const artistasFallback = artistasNomes.length > 0 ? artistasNomes : ['The Weeknd', 'Anitta', 'Marília Mendonça']
  const vibesFallback = vibesNomes.length > 0 ? vibesNomes : ['Festa', 'Chill', 'Treino']

  const resultado = {
    tudo: [],
    musicas: [],
    albuns: [],
    artistas: [],
    playlists: []
  }

  let seedCounter = Date.now()

  // ============================================
  // 🎵 MÚSICAS — SEMPRE 15 MÚSICAS DIFERENTES
  // ============================================
  if (tipo === 'tudo' || tipo === 'musicas') {
    // Tentar API primeiro
    let tracksAPI = []
    try {
      if (generosNomes.length > 0) {
        const tracksGenero = await buscarTracksPorGenero(generosFallback[0], 8)
        tracksAPI.push(...tracksGenero)
      }
      if (artistasNomes.length > 0) {
        for (const artista of artistasFallback.slice(0, 2)) {
          const tracksArtista = await buscarTracksPorArtista(artista, 4)
          tracksAPI.push(...tracksArtista)
        }
      }
      if (vibesNomes.length > 0) {
        const searchTerms = VIBE_SEARCH_MAP[vibesFallback[0]] || [vibesFallback[0].toLowerCase()]
        const tracksVibe = await buscarTracksPorVibe(searchTerms, 8)
        tracksAPI.push(...tracksVibe)
      }
    } catch (e) {
      console.warn('⚠️ API falhou para músicas, usando mock:', e.message)
    }

    // ✅ FALLBACK MOCK: Gerar 15 músicas diferentes baseadas nos gostos do usuário
   const mockTracks = gerarMockTracks('musicas', seedCounter++, generosFallback[0], artistasFallback[0], vibesFallback[0])

    // Combinar API + Mock, remover duplicados, garantir 15
    const combinado = [...tracksAPI, ...mockTracks]
    const seen = new Set()
    const unicos = combinado.filter(t => {
      const key = `${t.source || 'unknown'}_${t.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Se ainda faltar, gerar mais mocks com seeds diferentes
   while (unicos.length < 15) {
  const extraSeed = seedCounter++
  const extraMock = gerarMockTracks('musicas', extraSeed, 
    generosFallback[unicos.length % generosFallback.length] || 'pop',
    artistasFallback[unicos.length % artistasFallback.length] || '',
    vibesFallback[unicos.length % vibesFallback.length] || ''
  )
      for (const t of extraMock) {
        const key = `${t.source || 'unknown'}_${t.id}`
        if (!seen.has(key)) {
          seen.add(key)
          unicos.push(t)
          if (unicos.length >= 15) break
        }
      }
    }

    resultado.musicas = unicos.slice(0, 15).map((t, i) => ({
      ...t,
      categoria: 'musicas',
      razao: t.razao || `Recomendado para você (${i + 1})`
    }))
  }

  // ============================================
  // 💿 ÁLBUNS — SEMPRE 15 ÁLBUNS DIFERENTES
  // ============================================
  if (tipo === 'tudo' || tipo === 'albuns') {
    let albunsAPI = []
    try {
      albunsAPI = await buscarAlbunsPorGenero(generosFallback[0], 15)
    } catch (e) {
      console.warn('⚠️ API falhou para álbuns, usando mock:', e.message)
    }

    // ✅ FALLBACK MOCK: Criar álbuns baseados nos gêneros/artistas
    const mockAlbuns = gerarMockAlbuns(generosFallback, artistasFallback, seedCounter++)
    
    const combinado = [...albunsAPI, ...mockAlbuns]
    const seen = new Set()
    const unicos = combinado.filter(a => {
      const key = `${a.source || 'unknown'}_${a.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    while (unicos.length < 15) {
      const extraMock = gerarMockAlbuns(generosFallback, artistasFallback, seedCounter++)
      for (const a of extraMock) {
        const key = `${a.source || 'unknown'}_${a.id}`
        if (!seen.has(key)) {
          seen.add(key)
          unicos.push(a)
          if (unicos.length >= 15) break
        }
      }
    }

    resultado.albuns = unicos.slice(0, 15).map(a => ({
      ...a,
      categoria: 'albuns',
      razao: a.razao || `Álbuns de ${generosFallback[0]}`
    }))
  }

  // ============================================
  // 🎤 ARTISTAS — SEMPRE 15 ARTISTAS DIFERENTES
  // ============================================
  if (tipo === 'tudo' || tipo === 'artistas') {
    let artistasAPI = []
    try {
      for (const artista of artistasFallback.slice(0, 3)) {
        const encontrados = await buscarArtistasPorNome(artista, 5)
        artistasAPI.push(...encontrados)
      }
    } catch (e) {
      console.warn('⚠️ API falhou para artistas, usando mock:', e.message)
    }

    // ✅ FALLBACK MOCK
    const mockArtistas = gerarMockArtistas(artistasFallback, generosFallback, seedCounter++)
    
    const combinado = [...artistasAPI, ...mockArtistas]
    const seen = new Set()
    const unicos = combinado.filter(a => {
      const key = `${a.source || 'unknown'}_${a.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    while (unicos.length < 15) {
      const extraMock = gerarMockArtistas(artistasFallback, generosFallback, seedCounter++)
      for (const a of extraMock) {
        const key = `${a.source || 'unknown'}_${a.id}`
        if (!seen.has(key)) {
          seen.add(key)
          unicos.push(a)
          if (unicos.length >= 15) break
        }
      }
    }

    resultado.artistas = unicos.slice(0, 15).map(a => ({
      ...a,
      categoria: 'artistas',
      razao: a.razao || 'Artistas relacionados aos seus gostos'
    }))
  }

  // ============================================
  // 📋 PLAYLISTS — SEMPRE 15 PLAYLISTS DIFERENTES
  // ============================================
  if (tipo === 'tudo' || tipo === 'playlists') {
    let playlistsAPI = []
    try {
      const searchTerms = vibesFallback[0] ? (VIBE_SEARCH_MAP[vibesFallback[0]] || [vibesFallback[0].toLowerCase()]) : ['pop']
      playlistsAPI = await buscarPlaylistsPorVibe(searchTerms, 15)
    } catch (e) {
      console.warn('⚠️ API falhou para playlists, usando mock:', e.message)
    }

    // ✅ FALLBACK MOCK
    const mockPlaylists = gerarMockPlaylists(vibesFallback, generosFallback, seedCounter++)
    
    const combinado = [...playlistsAPI, ...mockPlaylists]
    const seen = new Set()
    const unicos = combinado.filter(p => {
      const key = `${p.source || 'unknown'}_${p.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    while (unicos.length < 15) {
      const extraMock = gerarMockPlaylists(vibesFallback, generosFallback, seedCounter++)
      for (const p of extraMock) {
        const key = `${p.source || 'unknown'}_${p.id}`
        if (!seen.has(key)) {
          seen.add(key)
          unicos.push(p)
          if (unicos.length >= 15) break
        }
      }
    }

    resultado.playlists = unicos.slice(0, 15).map(p => ({
      ...p,
      categoria: 'playlists',
      razao: p.razao || `Playlist para ${vibesFallback[0] || 'você'}`
    }))
  }

  // ============================================
  // 🎯 ABA "TUDO" — MIX DE TODAS AS CATEGORIAS
  // ============================================
  if (tipo === 'tudo') {
    const maxPorCategoria = 4 // 4 de cada = ~16 itens misturados
    
    const tudo = [
      ...resultado.musicas.slice(0, maxPorCategoria).map(m => ({ ...m, type: 'musicas' })),
      ...resultado.albuns.slice(0, maxPorCategoria).map(a => ({ ...a, type: 'albuns' })),
      ...resultado.artistas.slice(0, maxPorCategoria).map(a => ({ ...a, type: 'artistas' })),
      ...resultado.playlists.slice(0, maxPorCategoria).map(p => ({ ...p, type: 'playlists' }))
    ].sort(() => Math.random() - 0.5)

    // Se ainda tiver pouco, adicionar mais músicas
    if (tudo.length < 15) {
      const maisMusicas = resultado.musicas
        .slice(maxPorCategoria, maxPorCategoria + (15 - tudo.length))
        .map(m => ({ ...m, type: 'musicas' }))
      tudo.push(...maisMusicas)
    }

    resultado.tudo = tudo.slice(0, 16)
  }

  return {
    tudo: resultado.tudo,
    musicas: resultado.musicas,
    albuns: resultado.albuns,
    artistas: resultado.artistas,
    playlists: resultado.playlists,
    total: resultado[tipo === 'tudo' ? 'tudo' : tipo].length,
    preferences: { 
      generos: generosNomes, 
      artistas: artistasNomes, 
      vibes: vibesNomes 
    }
  }
}

async function buscarAlbunsPorGenero(genero, limit = 10) {
  try {
    const spotifyResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: `genre:${genero.toLowerCase()}`,
        type: 'album',
        limit: limit * 2,
        market: 'BR'
      }
    })
    
    return spotifyResponse.data?.albums?.items
      ?.map(album => ({
        id: album.id,
        title: album.name,
        artist: album.artists?.map(a => a.name).join(', '),
        cover: album.images?.[0]?.url || album.images?.[1]?.url || '',
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        source: 'spotify',
        type: 'album'
      }))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca álbuns ${genero}:`, error.message)
    return []
  }
}

async function buscarArtistasPorNome(nome, limit = 5) {
  try {
    const spotifyResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: `artist:${nome}`,
        type: 'artist',
        limit: limit * 2,
        market: 'BR'
      }
    })
    
    return spotifyResponse.data?.artists?.items
      ?.map(artist => ({
        id: artist.id,
        title: artist.name,
        cover: artist.images?.[0]?.url || artist.images?.[1]?.url || '',
        followers: artist.followers?.total,
        genres: artist.genres || [],
        popularity: artist.popularity,
        source: 'spotify',
        type: 'artist'
      }))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca artistas ${nome}:`, error.message)
    return []
  }
}

async function buscarPlaylistsPorVibe(searchTerms, limit = 10) {
  try {
    const query = searchTerms.join(' ')
    const spotifyResponse = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q: query,
        type: 'playlist',
        limit: limit * 2,
        market: 'BR'
      }
    })
    
    return spotifyResponse.data?.playlists?.items
      ?.map(playlist => ({
        id: playlist.id,
        title: playlist.name,
        description: playlist.description || '',
        cover: playlist.images?.[0]?.url || '',
        owner: playlist.owner?.display_name || 'Spotify',
        tracksCount: playlist.tracks?.total || 0,
        source: 'spotify',
        type: 'playlist'
      }))
      ?.slice(0, limit) || []
      
  } catch (error) {
    console.warn(`⚠️ Erro busca playlists:`, error.message)
    return []
  }
}

// ============================================
// EXPORTS ATUALIZADOS
// ============================================

module.exports = {
  createUser, loginUser, getUsers, getUserById,
  updateUser, deleteUser, searchUsers,
  generateDefaultAvatar, getUserStats,
  canAccessProfile, hasPendingFollowRequest, isResourceBlocked,
  getUserMixes, recuperarSenha, getPublicFollowers,
  getPublicFollowing,
  blockUser,
  unblockUser,
  getBlockStatus,
  reportUser,
  buscarRecomendacoesCompletas
}