const mongoose = require('mongoose')
const Usuario = require('../models/Usuario')
const Musica = require('../models/Musicas')
const MatchInteracao = require('../models/MatchInteracao')
const MatchMusical = require('../models/MatchMusical')

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
    if (/^\d+$/.test(duracao)) return Number(duracao)

    const parts = duracao.split(':').map(Number)
    if (parts.length === 2) {
      return (parts[0] * 60) + parts[1]
    }
    if (parts.length === 3) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2]
    }
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

const formatMusicaToCard = (musica) => {
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
    link: musica.link || ''
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

const buildCommonGenres = (userA, userB) => {
  const a = (userA?.generos || []).map(g => g.nome).filter(Boolean)
  const b = (userB?.generos || []).map(g => g.nome).filter(Boolean)
  return [...new Set(a.filter(nome => b.includes(nome)))]
}

const calcCompatibility = (songsCount, genresCount) => {
  const value = 50 + (songsCount * 12) + (genresCount * 8)
  return Math.max(50, Math.min(99, value))
}

const recalculateMatchBetweenUsers = async (userAId, userBId) => {
  const [userA, userB, likesA, likesB, existing] = await Promise.all([
    Usuario.findById(userAId).populate('generos', 'nome').lean(),
    Usuario.findById(userBId).populate('generos', 'nome').lean(),
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

  for (const otherUserId of relatedUsers) {
    await recalculateMatchBetweenUsers(userId, otherUserId)
  }
}

const getSuggestions = async (userId) => {
  const user = await Usuario.findById(userId).populate('generos', '_id nome').lean()

  const interactions = await MatchInteracao.find({ usuario: userId }).select('trackId').lean()
  const interactedIds = interactions
    .map(item => item.trackId)
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id))

  let query = {}

  if (interactedIds.length > 0) {
    query._id = { $nin: interactedIds }
  }

  if (user?.generos?.length) {
    query.generos = { $in: user.generos.map(g => g._id) }
  }

  let musicas = await Musica.find(query)
    .populate('generos', 'nome')
    .populate('albuns', 'nome')
    .populate('cantores', 'nome')
    .limit(60)
    .lean()

  if (!musicas.length) {
    const fallbackQuery = interactedIds.length > 0
      ? { _id: { $nin: interactedIds } }
      : {}

    musicas = await Musica.find(fallbackQuery)
      .populate('generos', 'nome')
      .populate('albuns', 'nome')
      .populate('cantores', 'nome')
      .limit(60)
      .lean()
  }

  if (!musicas.length) {
    return { cards: [] }
  }

  const cards = shuffleArray(musicas)
    .slice(0, 20)
    .map(formatMusicaToCard)

  return { cards }
}

const listCurtidas = async (userId, tipo) => {
  const query = { usuario: userId }
  if (tipo) query.tipo = tipo

  const curtidas = await MatchInteracao.find(query)
    .sort({ createdAt: -1 })
    .lean()

  return curtidas
}

const createCurtida = async (userId, track, tipo) => {
  const musica = normalizeTrack(track)

  if (!musica.trackId) {
    throw new Error('Track inválida')
  }

  const saved = await MatchInteracao.findOneAndUpdate(
    {
      usuario: userId,
      trackId: musica.trackId,
      tipo
    },
    {
      usuario: userId,
      trackId: musica.trackId,
      musicaRef: musica.musicaRef,
      tipo,
      musica
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  )

  if (tipo === 'like') {
    await updateMatchesForLike(userId, musica.trackId)
  }

  return saved
}

const deleteCurtida = async (userId, trackId, tipo) => {
  const relatedUsers = await MatchInteracao.find({
    usuario: { $ne: userId },
    tipo: 'like',
    trackId: String(trackId)
  }).distinct('usuario')

  const query = {
    usuario: userId,
    trackId: String(trackId)
  }

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
  const likesCount = await MatchInteracao.countDocuments({
    usuario: userId,
    tipo: 'like'
  })

  if (likesCount < 3) {
    return {
      matches: [],
      naoVistos: 0
    }
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
    {
      status,
      $addToSet: { vistosPor: userId }
    },
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
