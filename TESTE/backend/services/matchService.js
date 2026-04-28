const mongoose = require('mongoose')
const Match = require('../models/Match')
const CurtidaMusical = require('../models/CurtidaMusical')
const Usuario = require('../models/Usuario')
// const Chat = require('../models/Chat')
const axios = require('axios')

const DEEZER_PROXY = 'https://proxy.corsfix.com/?https://api.deezer.com'

const fetchDeezerTracks = async (query = 'chart', limit = 20) => {
  try {
    const endpoint = query === 'chart'
      ? `${DEEZER_PROXY}/chart/0/tracks?limit=${limit}`
      : `${DEEZER_PROXY}/search?q=${encodeURIComponent(query)}&limit=${limit}`

    const response = await axios.get(endpoint, { timeout: 10000 })
    return response.data?.data || []
  } catch (error) {
    console.error('Erro ao buscar Deezer:', error.message)
    return []
  }
}

const formatTrack = (track) => {
  const deezerId = track?.id || track?.deezerId
  const title = track?.title || track?.titulo || ''
  const artistName = track?.artist?.name || track?.artista || 'Desconhecido'
  const albumTitle = track?.album?.title || track?.album || ''
  const cover = track?.album?.cover_medium || track?.album?.cover || track?.capa || null
  const preview = track?.preview || null
  const duration = track?.duration || track?.duracao || 0

  return {
    deezerId,
    id: deezerId,
    titulo: title,
    title,
    artista: artistName,
    artist: { name: artistName },
    album: {
      title: albumTitle,
      cover_medium: cover,
      cover_small: cover
    },
    capa: cover,
    cover,
    preview,
    duracao: duration,
    duration
  }
}

const curtirMusica = async (usuarioId, trackData, tipo = 'like') => {
  const formatted = formatTrack(trackData)

  if (!formatted.deezerId) {
    throw new Error('deezerId da música é obrigatório')
  }

  const usuario = await Usuario.findById(usuarioId).select('generos').lean()
  const generosUsuario = usuario?.generos || []

  const curtida = await CurtidaMusical.findOneAndUpdate(
    { usuario: usuarioId, deezerId: formatted.deezerId },
    {
      usuario: usuarioId,
      deezerId: formatted.deezerId,
      titulo: formatted.titulo,
      artista: formatted.artista,
      album: formatted.album?.title || '',
      capa: formatted.capa,
      preview: formatted.preview,
      duracao: formatted.duracao,
      tipo,
      generos: generosUsuario
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const matchesGerados = await verificarMatches(usuarioId, formatted.deezerId)

  return {
    curtida,
    matchesGerados
  }
}

const removerCurtida = async (usuarioId, deezerId) => {
  await CurtidaMusical.deleteOne({
    usuario: usuarioId,
    deezerId: Number(deezerId)
  })

  await recalcularMatches(usuarioId)

  return { message: 'Curtida removida' }
}

const getCurtidas = async (usuarioId, tipo) => {
  const filtro = { usuario: usuarioId }
  if (tipo) filtro.tipo = tipo

  const curtidas = await CurtidaMusical.find(filtro)
    .sort({ createdAt: -1 })
    .lean()

  return curtidas.map(c => ({
    id: c._id,
    deezerId: c.deezerId,
    tipo: c.tipo,
    musica: {
      id: c.deezerId,
      deezerId: c.deezerId,
      titulo: c.titulo,
      title: c.titulo,
      artista: c.artista,
      artist: { name: c.artista },
      album: {
        title: c.album,
        cover_medium: c.capa,
        cover_small: c.capa
      },
      capa: c.capa,
      cover: c.capa,
      preview: c.preview,
      duracao: c.duracao,
      duration: c.duracao
    },
    createdAt: c.createdAt
  }))
}

const verificarMatches = async (usuarioId, deezerId) => {
  const outrasCurtidas = await CurtidaMusical.find({
    deezerId,
    usuario: { $ne: usuarioId },
    tipo: { $in: ['like', 'superlike', 'favorite'] }
  }).distinct('usuario')

  const matches = []

  for (const outroUsuarioId of outrasCurtidas) {
    const match = await criarOuAtualizarMatch(usuarioId, outroUsuarioId)
    if (match) matches.push(match)
  }

  return matches
}

const criarOuAtualizarMatch = async (userA, userB) => {
  const [curtidasA, curtidasB, userAData, userBData] = await Promise.all([
    CurtidaMusical.find({ usuario: userA, tipo: { $in: ['like', 'superlike', 'favorite'] } }).lean(),
    CurtidaMusical.find({ usuario: userB, tipo: { $in: ['like', 'superlike', 'favorite'] } }).lean(),
    Usuario.findById(userA).populate('generos', 'nome icon color').lean(),
    Usuario.findById(userB).populate('generos', 'nome icon color').lean()
  ])

  if (!userAData || !userBData) return null

  const musicasA = new Map(curtidasA.map(c => [c.deezerId, c]))
  const musicasB = new Map(curtidasB.map(c => [c.deezerId, c]))

  const musicasComuns = []
  for (const [deezerId, musicaA] of musicasA) {
    if (musicasB.has(deezerId)) {
      musicasComuns.push({
        deezerId: musicaA.deezerId,
        titulo: musicaA.titulo,
        artista: musicaA.artista,
        capa: musicaA.capa,
        preview: musicaA.preview
      })
    }
  }

  const generosA = new Set((userAData.generos || []).map(g => g._id.toString()))
  const generosB = new Set((userBData.generos || []).map(g => g._id.toString()))
  const generosComuns = [...generosA].filter(g => generosB.has(g))

  const maxBase = Math.max(curtidasA.length, curtidasB.length, 1)
  const scoreMusicas = Math.min((musicasComuns.length / maxBase) * 70, 70)
  const scoreGeneros = Math.min(generosComuns.length * 10, 30)
  const compatibilidade = Math.min(Math.round(scoreMusicas + scoreGeneros), 100)

  const [idA, idB] = [userA.toString(), userB.toString()].sort()

  if (musicasComuns.length === 0 && compatibilidade < 50) {
    await Match.findOneAndDelete({ usuarioA: idA, usuarioB: idB })
    return null
  }

  const match = await Match.findOneAndUpdate(
    { usuarioA: idA, usuarioB: idB },
    {
      usuarioA: idA,
      usuarioB: idB,
      musicasComuns: musicasComuns.slice(0, 10),
      generosComuns: generosComuns.slice(0, 5),
      compatibilidade,
      ultimaInteracao: new Date(),
      $setOnInsert: {
        iniciadoPor: userA,
        status: 'pendente'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .populate('usuarioA', 'nome username avatar bio localizacao idade')
    .populate('usuarioB', 'nome username avatar bio localizacao idade')
    .populate('generosComuns', 'nome icon color')

  return match
}

const recalcularMatches = async (usuarioId) => {
  const matches = await Match.find({
    $or: [{ usuarioA: usuarioId }, { usuarioB: usuarioId }]
  }).lean()

  for (const match of matches) {
    const outroId =
      match.usuarioA.toString() === usuarioId.toString()
        ? match.usuarioB
        : match.usuarioA

    await criarOuAtualizarMatch(usuarioId, outroId)
  }
}

const getMatches = async (usuarioId) => {
  const matches = await Match.find({
    $or: [{ usuarioA: usuarioId }, { usuarioB: usuarioId }],
    status: { $ne: 'recusado' }
  })
    .populate('usuarioA', 'nome username avatar bio localizacao idade')
    .populate('usuarioB', 'nome username avatar bio localizacao idade')
    .populate('generosComuns', 'nome icon color')
    .sort({ compatibilidade: -1, createdAt: -1 })
    .lean()

  return matches.map(match => {
    const isUserA = match.usuarioA._id.toString() === usuarioId.toString()
    const outroUsuario = isUserA ? match.usuarioB : match.usuarioA
    const visto = isUserA ? match.vistoPorA : match.vistoPorB

    return {
      id: match._id,
      user: {
        id: outroUsuario._id,
        name: outroUsuario.nome,
        username: outroUsuario.username,
        avatar: outroUsuario.avatar,
        location: outroUsuario.localizacao,
        bio: outroUsuario.bio,
        age: outroUsuario.idade
      },
      compatibility: match.compatibilidade,
      commonSongs: match.musicasComuns.map(m => m.titulo),
      commonGenres: (match.generosComuns || []).map(g => g.nome),
      commonSongsData: match.musicasComuns,
      status: match.status,
      unread: !visto,
      chatId: match.chatId || null,
      createdAt: match.createdAt
    }
  })
}

const getSugestoes = async (usuarioId, generosFavoritos = []) => {
  const usuario = await Usuario.findById(usuarioId)
    .populate('generos', 'nome')
    .lean()

  const curtidasExistentes = await CurtidaMusical.find({ usuario: usuarioId })
    .select('deezerId')
    .lean()

  const idsExistentes = new Set(curtidasExistentes.map(c => c.deezerId))

  const nomesGenerosUsuario = (usuario?.generos || []).map(g => g.nome)
  const queriesBase = [...generosFavoritos, ...nomesGenerosUsuario]
  const queries = [...new Set(queriesBase.filter(Boolean))]

  if (!queries.length) {
    queries.push('chart', 'pop', 'rock')
  }

  let todasTracks = []

  for (const query of queries.slice(0, 3)) {
    const tracks = await fetchDeezerTracks(query, 20)
    todasTracks.push(...tracks)
  }

  const unicas = []
  const vistos = new Set()

  for (const track of todasTracks) {
    if (!track?.id) continue
    if (vistos.has(track.id)) continue
    if (idsExistentes.has(track.id)) continue

    vistos.add(track.id)
    unicas.push(formatTrack(track))
  }

  return unicas.sort(() => Math.random() - 0.5).slice(0, 30)
}

const getEstatisticasMusicais = async (usuarioId) => {
  const [totalCurtidas, totalFavoritos, totalMatches, topArtistas] = await Promise.all([
    CurtidaMusical.countDocuments({ usuario: usuarioId }),
    CurtidaMusical.countDocuments({ usuario: usuarioId, tipo: 'favorite' }),
    Match.countDocuments({
      $or: [{ usuarioA: usuarioId }, { usuarioB: usuarioId }],
      status: 'aceito'
    }),
    CurtidaMusical.aggregate([
      { $match: { usuario: new mongoose.Types.ObjectId(usuarioId) } },
      { $group: { _id: '$artista', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
  ])

  return {
    musicasCurtidas: totalCurtidas,
    favoritos: totalFavoritos,
    matches: totalMatches,
    topArtistas: topArtistas.map(a => ({ nome: a._id, count: a.count }))
  }
}

const marcarVisto = async (matchId, usuarioId) => {
  const match = await Match.findById(matchId)
  if (!match) return null

  const isUserA = match.usuarioA.toString() === usuarioId.toString()

  if (isUserA) match.vistoPorA = true
  else match.vistoPorB = true

  await match.save()
  return match
}

const responderMatch = async (matchId, usuarioId, resposta) => {
  if (!['aceito', 'recusado', 'bloqueado'].includes(resposta)) {
    throw new Error('Resposta inválida')
  }

  const match = await Match.findById(matchId)
  if (!match) throw new Error('Match não encontrado')

  const isParte = [match.usuarioA.toString(), match.usuarioB.toString()]
    .includes(usuarioId.toString())

  if (!isParte) throw new Error('Não autorizado')

  match.status = resposta

  if (resposta === 'aceito' && !match.chatId) {
    const chat = new Chat({
      participantes: [match.usuarioA, match.usuarioB],
      matchId: match._id
    })
    await chat.save()
    match.chatId = chat._id
  }

  await match.save()
  return match
}

module.exports = {
  fetchDeezerTracks,
  formatTrack,
  curtirMusica,
  removerCurtida,
  getCurtidas,
  getMatches,
  getSugestoes,
  getEstatisticasMusicais,
  marcarVisto,
  responderMatch
}
