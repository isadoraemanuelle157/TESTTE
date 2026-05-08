const Usuario = require('../models/Usuario')
const Follow = require('../models/Follow')
const PrivacidadeAtividade = require('../models/PrivacidadeAtividade')
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

  if (!usuario.onboardingCompleto) {
    return { 
      mixes: [],
      message: 'Onboarding não completado',
      hasPreferences: false 
    }
  }

  const mixes = []
  const usedTrackIds = new Set()

  // Helper para extrair dados do usuário
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

  // ============================================
  // MIX 1: Baseado nos GÊNEROS favoritos
  // ============================================
  if (generosCompletos.length > 0) {
    const generoPrincipal = generosCompletos[0]
    const tracksGenero = await buscarTracksPorGenero(
      generoPrincipal.nome, 
      10, 
      usedTrackIds
    )
    
    if (tracksGenero.length > 0) {
      tracksGenero.forEach(t => usedTrackIds.add(t.id))
      
      mixes.push({
        id: `mix_genero_${generoPrincipal.id}`,
        title: `${generoPrincipal.nome} para Você`,
        description: `Os melhores hits de ${generoPrincipal.nome} selecionados especialmente`,
        tracks: tracksGenero.length,
        cover: tracksGenero[0]?.cover || tracksGenero[0]?.album?.cover_medium || '',
        gradient: generoPrincipal.color 
          ? `linear-gradient(135deg, ${generoPrincipal.color} 0%, #764ba2 100%)`
          : MIX_GRADIENTS[0],
        _tracks: tracksGenero,
        tipo: 'genero',
        basedOn: generoPrincipal.nome
      })
    }
  }

  // ============================================
  // MIX 2: Baseado nos ARTISTAS favoritos
  // ============================================
  if (artistasCompletos.length > 0) {
    const artistasSelecionados = artistasCompletos.slice(0, 3)
    const tracksArtistas = []
    
    for (const artista of artistasSelecionados) {
      const tracks = await buscarTracksPorArtista(
        artista.nome, 
        5, 
        usedTrackIds
      )
      tracks.forEach(t => {
        usedTrackIds.add(t.id)
        tracksArtistas.push(t)
      })
    }
    
    if (tracksArtistas.length > 0) {
      const shuffled = tracksArtistas.sort(() => Math.random() - 0.5)
      
      mixes.push({
        id: `mix_artistas_${Date.now()}`,
        title: `Seus Artistas Favoritos`,
        description: artistasSelecionados.map(a => a.nome).join(', ') + ' e mais',
        tracks: shuffled.length,
        cover: shuffled[0]?.cover || shuffled[0]?.album?.cover_medium || '',
        gradient: MIX_GRADIENTS[1],
        _tracks: shuffled,
        tipo: 'artistas',
        basedOn: artistasSelecionados.map(a => a.nome).join(', ')
      })
    }
  }

  // ============================================
  // MIX 3: Baseado nas VIBES favoritas
  // ============================================
  if (vibesCompletas.length > 0) {
    const vibePrincipal = vibesCompletas[0]
    const searchTerms = VIBE_SEARCH_MAP[vibePrincipal.nome] || [vibePrincipal.nome.toLowerCase()]
    
    const tracksVibe = await buscarTracksPorVibe(
      searchTerms, 
      10, 
      usedTrackIds
    )
    
    if (tracksVibe.length > 0) {
      tracksVibe.forEach(t => usedTrackIds.add(t.id))
      
      mixes.push({
        id: `mix_vibe_${vibePrincipal.id}`,
        title: `${vibePrincipal.nome} ${vibePrincipal.emoji || '✨'}`,
        description: vibePrincipal.descricao || `Músicas perfeitas para ${vibePrincipal.nome}`,
        tracks: tracksVibe.length,
        cover: tracksVibe[0]?.cover || tracksVibe[0]?.album?.cover_medium || '',
        gradient: vibePrincipal.gradient || MIX_GRADIENTS[2],
        _tracks: tracksVibe,
        tipo: 'vibe',
        basedOn: vibePrincipal.nome
      })
    }
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
      const tracksDescobertas = await buscarTracksDescobertas(
        termosBusca,
        10,
        usedTrackIds
      )
      
      if (tracksDescobertas.length > 0) {
        tracksDescobertas.forEach(t => usedTrackIds.add(t.id))
        
        mixes.push({
          id: `mix_descobertas_${Date.now()}`,
          title: `Descobertas da Semana`,
          description: `Novas músicas baseadas no seu gosto por ${generosCompletos[0]?.nome || 'vários estilos'}`,
          tracks: tracksDescobertas.length,
          cover: tracksDescobertas[0]?.cover || tracksDescobertas[0]?.album?.cover_medium || '',
          gradient: MIX_GRADIENTS[3],
          _tracks: tracksDescobertas,
          tipo: 'descobertas',
          basedOn: 'múltiplos gostos'
        })
      }
    }
  }

  // ============================================
  // MIX 5: Top do Gênero Principal
  // ============================================
  if (mixes.length < limit && generosCompletos.length > 0) {
    const tracksTop = await buscarTracksTopGenero(
      generosCompletos[0].nome,
      10,
      usedTrackIds
    )
    
    if (tracksTop.length > 0) {
      mixes.push({
        id: `mix_top_${Date.now()}`,
        title: `Top ${generosCompletos[0].nome}`,
        description: `As mais tocadas do momento em ${generosCompletos[0].nome}`,
        tracks: tracksTop.length,
        cover: tracksTop[0]?.cover || tracksTop[0]?.album?.cover_medium || '',
        gradient: MIX_GRADIENTS[4],
        _tracks: tracksTop,
        tipo: 'top',
        basedOn: generosCompletos[0].nome
      })
    }
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

// ============================================
// EXPORTS ATUALIZADOS
// ============================================

module.exports = {
  createUser, loginUser, getUsers, getUserById,
  updateUser, deleteUser, searchUsers,
  generateDefaultAvatar, getUserStats,
  canAccessProfile, hasPendingFollowRequest, isResourceBlocked,
  getUserMixes  // 🎯 NOVO
}