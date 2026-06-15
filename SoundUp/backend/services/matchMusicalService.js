const mongoose = require('mongoose')
const axios = require('axios')
const Usuario = require('../models/Usuario')
const Musica = require('../models/Musicas')
const MatchInteracao = require('../models/MatchInteracao')
const notificacaoService = require('./notificacaoService')
const MatchMusical = require('../models/MatchMusical')

// ============================================
// CONFIGURAÇÃO DAS APIs EXTERNAS
// ============================================

const DEEZER_API_BASE = 'https://api.deezer.com'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Se você tiver tokens de API, configure aqui:
// const SPOTIFY_TOKEN = process.env.SPOTIFY_TOKEN
// const DEEZER_TOKEN = process.env.DEEZER_TOKEN

// ============================================
// HELPERS
// ============================================

const sameId = (a, b) => String(a || '') === String(b || '')

const toObjectIdIfValid = (value) => {
  if (!value) return null
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null
}

const pairKeyFromUsers = (a, b) => {
  return [String(a), String(b)].sort().join(':')
}

const parseDurationToSeconds = (duracao) => {
  if (!duracao) return 0
  if (typeof duracao === 'number') return duracao
  if (typeof duracao === 'string') {
    if (/^\\d+$/.test(duracao)) return Number(duracao)
    const parts = duracao.split(':').map(Number)
    if (parts.length === 2) return (parts[0] * 60) + parts[1]
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2]
  }
  return 0
}

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ============================================
// NORMALIZADORES DE TRACK (unificam formato)
// ============================================

const normalizeBancoTrack = (musica) => {
  const artistName = (musica.cantores || []).map(c => c.nome).join(', ') || 'Artista desconhecido'
  const albumTitle = musica.albuns?.[0]?.nome || musica.generos?.[0]?.nome || 'Sem álbum'
  const cover = musica.foto || ''

  return {
    id: musica._id.toString(),
    trackId: musica._id.toString(),
    title: musica.nome,
    artist: { name: artistName },
    album: {
      title: albumTitle,
      cover_medium: cover,
      cover_small: cover
    },
    cover,
    duration: parseDurationToSeconds(musica.duracao),
    preview: '',
    genre: musica.generos?.[0]?.nome || '',
    link: musica.link || '',
    source: 'database'
  }
}

const normalizeDeezerTrack = (track) => {
  return {
    id: `deezer_${track.id}`,
    trackId: `deezer_${track.id}`,
    title: track.title || 'Sem título',
    artist: {
      name: track.artist?.name || 'Artista desconhecido'
    },
    album: {
      title: track.album?.title || '',
      cover_medium: track.album?.cover_medium || track.album?.cover || '',
      cover_small: track.album?.cover_small || track.album?.cover || ''
    },
    cover: track.album?.cover_medium || track.album?.cover || '',
    duration: track.duration || 0,
    preview: track.preview || '',
    genre: '',
    link: track.link || `https://deezer.com/track/${track.id}`,
    source: 'deezer'
  }
}

const normalizeSpotifyTrack = (track) => {
  const albumImages = track.album?.images || []
  const cover = albumImages[1]?.url || albumImages[0]?.url || ''
  
  return {
    id: `spotify_${track.id}`,
    trackId: `spotify_${track.id}`,
    title: track.name || 'Sem título',
    artist: {
      name: track.artists?.[0]?.name || 'Artista desconhecido'
    },
    album: {
      title: track.album?.name || '',
      cover_medium: cover,
      cover_small: albumImages[2]?.url || cover
    },
    cover,
    duration: Math.round((track.duration_ms || 0) / 1000),
    preview: track.preview_url || '',
    genre: '',
    link: track.external_urls?.spotify || '',
    source: 'spotify'
  }
}

const normalizeTrack = (track) => {
  const rawId = track?.trackId || track?.deezerId || track?.id || track?._id || ''
  const trackId = String(rawId)

  return {
    trackId,
    musicaRef: toObjectIdIfValid(rawId),
    title: track?.title || track?.nome || 'Sem título',
    artist: {
      name: track?.artist?.name || track?.artist || track?.artista || 'Artista desconhecido'
    },
    album: {
      title: track?.album?.title || track?.album?.nome || track?.genre || '',
      cover_medium: track?.album?.cover_medium || track?.cover || track?.foto || '',
      cover_small: track?.album?.cover_small || track?.cover || track?.foto || ''
    },
    cover: track?.cover || track?.foto || track?.album?.cover_medium || '',
    duration: parseDurationToSeconds(track?.duration || track?.duracao),
    preview: track?.preview || '',
    genre: track?.genre || '',
    link: track?.link || ''
  }
}

// ============================================
// BUSCA DEEZER API
// ============================================

const fetchDeezerTracks = async (query, limit = 20) => {
  try {
    console.log(`[Deezer] Buscando: "${query}"`)
    const response = await axios.get(`${DEEZER_API_BASE}/search/track`, {
      params: { q: query, limit },
      timeout: 8000
    })

    const tracks = response.data?.data || []
    console.log(`[Deezer] Encontradas: ${tracks.length} tracks`)

    return tracks.map(normalizeDeezerTrack)
  } catch (err) {
    console.error('[Deezer] Erro:', err.message)
    return []
  }
}

const fetchDeezerChart = async (limit = 20) => {
  try {
    console.log('[Deezer] Buscando chart/top tracks...')
    const response = await axios.get(`${DEEZER_API_BASE}/chart/0/tracks`, {
      params: { limit },
      timeout: 8000
    })

    const tracks = response.data?.data || []
    console.log(`[Deezer Chart] Encontradas: ${tracks.length} tracks`)

    return tracks.map(normalizeDeezerTrack)
  } catch (err) {
    console.error('[Deezer Chart] Erro:', err.message)
    return []
  }
}

const fetchDeezerByGenre = async (genreName, limit = 15) => {
  try {
    // Buscar tracks relacionadas ao gênero
    const response = await axios.get(`${DEEZER_API_BASE}/search/track`, {
      params: { q: genreName, limit },
      timeout: 8000
    })

    const tracks = response.data?.data || []
    return tracks.map(normalizeDeezerTrack)
  } catch (err) {
    console.error(`[Deezer Genre] Erro em "${genreName}":`, err.message)
    return []
  }
}

// ============================================
// BUSCA SPOTIFY API (público ou com token)
// ============================================

const fetchSpotifyToken = async () => {
  try {
    // Se você tem CLIENT_ID e CLIENT_SECRET, pode gerar token aqui
    // Ou usar um token já existente
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.log('[Spotify] Sem credenciais, pulando Spotify')
      return null
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      }
    )

    return response.data?.access_token
  } catch (err) {
    console.error('[Spotify] Erro ao obter token:', err.message)
    return null
  }
}

const fetchSpotifyTracks = async (query, token, limit = 20) => {
  if (!token) return []

  try {
    console.log(`[Spotify] Buscando: "${query}"`)
    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      params: { q: query, type: 'track', limit },
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 8000
    })

    const tracks = response.data?.tracks?.items || []
    console.log(`[Spotify] Encontradas: ${tracks.length} tracks`)

    return tracks.map(normalizeSpotifyTrack)
  } catch (err) {
    console.error('[Spotify] Erro:', err.message)
    return []
  }
}

// ============================================
// BUSCA BANCO LOCAL
// ============================================

const fetchBancoTracks = async (userId, genreIds, artistIds, interactedTrackIds, limit = 40) => {
  try {
    console.log('[Banco] Buscando músicas locais...')

    const baseQuery = {}
    if (interactedTrackIds.length > 0) {
      const validObjectIds = interactedTrackIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
      if (validObjectIds.length > 0) {
        baseQuery._id = { $nin: validObjectIds }
      }
    }

    const orConditions = []
    if (genreIds.length > 0) {
      orConditions.push({
        generos: {
          $in: genreIds.map(id =>
            mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
          )
        }
      })
    }
    if (artistIds.length > 0) {
      orConditions.push({
        cantores: {
          $in: artistIds.map(id =>
            mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
          )
        }
      })
    }

    let musicas = []

    // Tentar busca personalizada
    if (orConditions.length > 0) {
      musicas = await Musica.find({ ...baseQuery, $or: orConditions })
        .populate('generos', 'nome')
        .populate('albuns', 'nome')
        .populate('cantores', 'nome')
        .limit(limit)
        .lean()
    }

    // Fallback: qualquer música
    if (!musicas.length) {
      musicas = await Musica.find(baseQuery)
        .populate('generos', 'nome')
        .populate('albuns', 'nome')
        .populate('cantores', 'nome')
        .limit(limit)
        .lean()
    }

    // Último recurso: todas
    if (!musicas.length) {
      musicas = await Musica.find()
        .populate('generos', 'nome')
        .populate('albuns', 'nome')
        .populate('cantores', 'nome')
        .limit(limit)
        .lean()
    }

    console.log(`[Banco] Encontradas: ${musicas.length} músicas`)
    return musicas.map(normalizeBancoTrack)
  } catch (err) {
    console.error('[Banco] Erro:', err.message)
    return []
  }
}

// ============================================
// RANKING E COMBINAÇÃO
// ============================================

const rankTracks = (tracks, genreIds, artistIds, genreNames) => {
  return tracks.map(track => {
    let score = 0

    // Pontuação por source (dá preferência ao banco local)
    if (track.source === 'database') score += 5
    else if (track.source === 'spotify') score += 2
    else if (track.source === 'deezer') score += 1

    // Pontuação por gênero (se disponível)
    const trackGenre = (track.genre || '').toLowerCase()
    if (genreNames.some(g => trackGenre.includes(g))) score += 3

    // Pontuação por artista (comparar nomes)
    // (simplificado - pode melhorar com fuzzy matching)

    return { track, score }
  }).sort((a, b) => b.score - a.score || Math.random() - 0.5)
}

const deduplicateTracks = (tracks) => {
  const seen = new Set()
  return tracks.filter(track => {
    const key = `${track.title.toLowerCase().trim()}_${track.artist.name.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ============================================
// MATCH RECALCULATION (mantido igual)
// ============================================

const buildCommonGenres = (userA, userB) => {
  const a = [
    ...(userA?.generos?.locais || []).map(g => g.nome),
    ...(userA?.generos?.externos || []).map(g => g.nome)
  ].filter(Boolean)

  const b = [
    ...(userB?.generos?.locais || []).map(g => g.nome),
    ...(userB?.generos?.externos || []).map(g => g.nome)
  ].filter(Boolean)

  return [...new Set(a.filter(nome => b.includes(nome)))]
}

const calcCompatibility = (songsCount, genresCount) => {
  const value = 50 + (songsCount * 12) + (genresCount * 8)
  return Math.max(50, Math.min(99, value))
}

const recalculateMatchBetweenUsers = async (userAId, userBId) => {
  const [userA, userB, likesA, likesB, existing] = await Promise.all([
    Usuario.findById(userAId).populate('generos.locais', 'nome').lean(),
    Usuario.findById(userBId).populate('generos.locais', 'nome').lean(),
    MatchInteracao.find({ usuario: userAId, tipo: 'like' }).lean(),
    MatchInteracao.find({ usuario: userBId, tipo: 'like' }).lean(),
    MatchMusical.findOne({ pairKey: pairKeyFromUsers(userAId, userBId) }).lean()
  ])

  if (!userA || !userB) return null

  const likesBMap = new Map(likesB.map(item => [String(item.trackId), item]))
  const commonLikeDocs = likesA.filter(item => likesBMap.has(String(item.trackId)))

  if (commonLikeDocs.length === 0) {
    await MatchMusical.findOneAndDelete({ pairKey: pairKeyFromUsers(userAId, userBId) })
    return null
  }

  const commonSongs = commonLikeDocs.map(item => ({
    trackId: item.trackId,
    title: item.musica.title,
    artist: { name: item.musica.artist?.name || '' },
    cover: item.musica.cover || item.musica.album?.cover_medium || ''
  }))

  const commonGenres = buildCommonGenres(userA, userB)
  const compatibility = calcCompatibility(commonSongs.length, commonGenres.length)
  const pairKey = pairKeyFromUsers(userAId, userBId)

  const payload = {
    pairKey,
    usuarios: [userAId, userBId],
    commonSongs: commonSongs.slice(0, 10),
    commonGenres,
    compatibility,
    status: existing?.status || 'aceito',
    vistosPor: existing?.vistosPor || [],
    ocultoPor: existing?.ocultoPor || []
  }

  return MatchMusical.findOneAndUpdate(
    { pairKey },
    payload,
    { upsert: true, new: true }
  )
}

const updateMatchesForLike = async (userId, trackId) => {
  const relatedUsers = await MatchInteracao.find({
    usuario: { $ne: userId },
    tipo: 'like',
    trackId: String(trackId)
  }).distinct('usuario')

  const novosMatches = []

  for (const otherUserId of relatedUsers) {
    const pairKey = pairKeyFromUsers(userId, otherUserId)
    const existedBefore = await MatchMusical.exists({ pairKey })

    const match = await recalculateMatchBetweenUsers(userId, otherUserId)

    if (!existedBefore && match) {
      novosMatches.push({ match, otherUserId })
    }
  }

  return novosMatches
}


// ============================================
// GET SUGGESTIONS - MULTI-FONTE
// ============================================

const getSuggestions = async (userId) => {
  console.log(`[getSuggestions] ========== INÍCIO ==========`)
  console.log(`[getSuggestions] Usuário: ${userId}`)

  // 1. Buscar usuário
  const user = await Usuario.findById(userId)
    .populate('generos.locais', '_id nome')
    .populate('generos.externos', '_id nome')
    .populate('artistasFavoritos.locais', '_id nome')
    .populate('artistasFavoritos.externos', '_id nome')
    .lean()

  // 2. Extrair preferências
  const genreIds = []
  const genreNames = []
  const artistNames = []

  if (user?.generos?.locais) {
    user.generos.locais.forEach(g => {
      if (g._id) genreIds.push(String(g._id))
      if (g.nome) genreNames.push(g.nome.toLowerCase())
    })
  }
  if (user?.generos?.externos) {
    user.generos.externos.forEach(g => {
      if (g._id) genreIds.push(String(g._id))
      if (g.nome) genreNames.push(g.nome.toLowerCase())
    })
  }

  const artistIds = []
  if (user?.artistasFavoritos?.locais) {
    user.artistasFavoritos.locais.forEach(a => {
      if (a._id) artistIds.push(String(a._id))
      if (a.nome) artistNames.push(a.nome)
    })
  }

  console.log(`[getSuggestions] Gêneros: ${genreNames.join(', ') || 'nenhum'}`)
  console.log(`[getSuggestions] Artistas: ${artistNames.join(', ') || 'nenhum'}`)

  // 3. Buscar interações
  const interactions = await MatchInteracao.find({ usuario: userId }).select('trackId').lean()
  const interactedTrackIds = interactions.map(item => String(item.trackId))

  // 4. Buscar de TODAS as fontes em paralelo
  const searchQueries = []

  // Adicionar buscas por gêneros favoritos
  genreNames.forEach(g => searchQueries.push(g))

  // Adicionar buscas por artistas favoritos
  artistNames.forEach(a => searchQueries.push(a))

  // Se não tiver preferências, usar queries genéricas
  if (searchQueries.length === 0) {
    searchQueries.push('pop', 'rock', 'hip hop', 'electronic')
  }

  // Limitar queries para não sobrecarregar
  const limitedQueries = searchQueries.slice(0, 3)
  console.log(`[getSuggestions] Queries de busca: ${limitedQueries.join(', ')}`)

  // Buscar token do Spotify (se disponível)
  const spotifyToken = await fetchSpotifyToken()

  // Executar todas as buscas em paralelo
  const [
    bancoTracks,
    ...apiResults
  ] = await Promise.all([
    // Banco local
    fetchBancoTracks(userId, genreIds, artistIds, interactedTrackIds, 30),

    // Deezer - por cada query
    ...limitedQueries.map(q => fetchDeezerTracks(q, 10)),

    // Deezer - chart/top (sempre busca)
    fetchDeezerChart(15),

    // Spotify - por cada query (se tiver token)
    ...(spotifyToken
      ? limitedQueries.map(q => fetchSpotifyTracks(q, spotifyToken, 10))
      : [Promise.resolve([])]
    )
  ])

  // 5. Combinar todos os resultados
  let allTracks = [
    ...bancoTracks,
    ...apiResults.flat()
  ]

  console.log(`[getSuggestions] Total antes de deduplicar: ${allTracks.length}`)

  // 6. Remover duplicatas (mesmo título + artista)
  allTracks = deduplicateTracks(allTracks)
  console.log(`[getSuggestions] Total após deduplicar: ${allTracks.length}`)

  // 7. Remover já interagidas
  const interactedSet = new Set(interactedTrackIds)
  allTracks = allTracks.filter(track => {
    const trackId = String(track.trackId || track.id)
    return !interactedSet.has(trackId)
  })
  console.log(`[getSuggestions] Total após filtrar interações: ${allTracks.length}`)

  // 8. Rankear
  const ranked = rankTracks(allTracks, genreIds, artistIds, genreNames)
    .slice(0, 20)
    .map(item => item.track)

  // 9. Embaralhar levemente para variedade (mantendo ranking geral)
  const finalTracks = shuffleArray(ranked).slice(0, 20)

  console.log(`[getSuggestions] Cards finais: ${finalTracks.length}`)
  console.log(`[getSuggestions] Fontes:`, finalTracks.reduce((acc, t) => {
    acc[t.source] = (acc[t.source] || 0) + 1
    return acc
  }, {}))
  console.log(`[getSuggestions] ========== FIM ==========`)

  return { cards: finalTracks }
}

// ============================================
// CURTIDAS / FAVORITOS / MATCHES (mantidos)
// ============================================

const listCurtidas = async (userId, tipo) => {
  const query = { usuario: userId }
  if (tipo) query.tipo = tipo
  return MatchInteracao.find(query).sort({ createdAt: -1 }).lean()
}

const createCurtida = async (userId, track, tipo) => {
  const musica = normalizeTrack(track)
  if (!musica.trackId) throw new Error('Track inválida')

  const saved = await MatchInteracao.findOneAndUpdate(
    { usuario: userId, trackId: musica.trackId, tipo },
    { usuario: userId, trackId: musica.trackId, musicaRef: musica.musicaRef, tipo, musica },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
if (tipo === 'like') {
  const novosMatches = await updateMatchesForLike(userId, musica.trackId)

  if (novosMatches.length > 0) {
    const usuarioAtual = await Usuario.findById(userId).select('nome').lean()

    for (const { match, otherUserId } of novosMatches) {
      const outroUsuario = await Usuario.findById(otherUserId).select('nome').lean()

      await notificacaoService.criarMuitas([
        {
          usuarioDestino: userId,
          usuarioOrigem: otherUserId,
          tipo: 'matchmusical',
          mensagem: `🎵 Você deu match musical com ${outroUsuario?.nome || 'alguém'}!`,
          meta: {
            matchId: match._id.toString(),
            usuarioOrigemId: String(otherUserId)
          }
        },
        {
          usuarioDestino: otherUserId,
          usuarioOrigem: userId,
          tipo: 'matchmusical',
          mensagem: `🎵 Você deu match musical com ${usuarioAtual?.nome || 'alguém'}!`,
          meta: {
            matchId: match._id.toString(),
            usuarioOrigemId: String(userId)
          }
        }
      ])
    }
  }
}

return saved
}

const deleteCurtida = async (userId, trackId, tipo) => {
  const relatedUsers = await MatchInteracao.find({
    usuario: { $ne: userId }, tipo: 'like', trackId: String(trackId)
  }).distinct('usuario')

  const query = { usuario: userId, trackId: String(trackId) }
  if (tipo) query.tipo = tipo

  const removed = await MatchInteracao.findOneAndDelete(query)

  if (removed && (!tipo || tipo === 'like')) {
    for (const otherUserId of relatedUsers) {
      await recalculateMatchBetweenUsers(userId, otherUserId)
    }
  }
  return removed
}

const listMatches = async (userId) => {
  const likesCount = await MatchInteracao.countDocuments({ usuario: userId, tipo: 'like' })

  if (likesCount < 3) {
    return { matches: [], naoVistos: 0 }
  }

  const matches = await MatchMusical.find({
    usuarios: userId,
    ocultoPor: { $nin: [userId] },
    status: { $ne: 'recusado' }
  })
    .populate('usuarios', 'nome idade avatar localizacao bio')
    .sort({ updatedAt: -1 })
    .lean()

  const formatted = matches.map(match => {
    const otherUser = (match.usuarios || []).find(u => !sameId(u._id, userId))
    const unread = !(match.vistosPor || []).some(id => sameId(id, userId))

    return {
      id: match._id.toString(),
      compatibility: match.compatibility || 0,
      status: match.status,
      unread,
      commonSongs: (match.commonSongs || []).map(song => song.title),
      commonGenres: match.commonGenres || [],
      user: {
        id: otherUser?._id?.toString() || '',
        name: otherUser?.nome || 'Usuário',
        age: otherUser?.idade || null,
        avatar: otherUser?.avatar || '',
        location: otherUser?.localizacao || '',
        bio: otherUser?.bio || ''
      }
    }
  })

  return {
    matches: formatted,
    naoVistos: formatted.filter(m => m.unread).length
  }
}

const markMatchAsSeen = async (matchId, userId) => {
  return MatchMusical.findOneAndUpdate(
    { _id: matchId, usuarios: userId },
    { $addToSet: { vistosPor: userId } },
    { new: true }
  )
}

const respondToMatch = async (matchId, userId, resposta) => {
  const status = resposta === 'aceito' ? 'aceito' : 'recusado'
  return MatchMusical.findOneAndUpdate(
    { _id: matchId, usuarios: userId },
    { status, $addToSet: { vistosPor: userId } },
    { new: true }
  )
}

const hideMatch = async (matchId, userId) => {
  const match = await MatchMusical.findOneAndUpdate(
    { _id: matchId, usuarios: userId },
    { $addToSet: { ocultoPor: userId } },
    { new: true }
  )

  if (!match) return null

  if ((match.ocultoPor || []).length >= 2) {
    await MatchMusical.findByIdAndDelete(matchId)
  }

  return match
}

module.exports = {
  getSuggestions,
  listCurtidas,
  createCurtida,
  deleteCurtida,
  listMatches,
  markMatchAsSeen,
  respondToMatch,
  hideMatch
}