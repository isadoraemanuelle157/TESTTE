const Match = require('../models/Match')
const CurtidaMusical = require('../models/CurtidaMusical')
const Usuario = require('../models/Usuario')
const axios = require('axios')

const DEEZER_PROXY = 'https://proxy.corsfix.com/?https://api.deezer.com'

// Buscar músicas do Deezer (via proxy para evitar CORS no backend também)
const fetchDeezerTracks = async (query = 'chart', limit = 20) => {
  try {
    const endpoint = query === 'chart' 
      ? `${DEEZER_PROXY}/chart/0/tracks?limit=${limit}`
      : `${DEEZER_PROXY}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    
    const response = await axios.get(endpoint, { timeout: 10000 })
    return response.data.data || []
  } catch (error) {
    console.error('Erro ao buscar Deezer:', error.message)
    return []
  }
}

// Formatar track do Deezer
const formatTrack = (track) => ({
  deezerId: track.id,
  titulo: track.title,
  artista: track.artist?.name || 'Desconhecido',
  album: track.album?.title || '',
  capa: track.album?.cover_medium || track.album?.cover || null,
  preview: track.preview || null,
  duracao: track.duration || 0
})

// Curtir uma música
const curtirMusica = async (usuarioId, trackData, tipo = 'like') => {
  const formatted = formatTrack(trackData)
  
  const curtida = await CurtidaMusical.findOneAndUpdate(
    { usuario: usuarioId, deezerId: formatted.deezerId },
    { 
      ...formatted,
      tipo,
      $setOnInsert: { usuario: usuarioId }
    },
    { upsert: true, new: true }
  )
  
  // Verificar matches após curtida
  await verificarMatches(usuarioId, formatted)
  
  return curtida
}

// Remover curtida
const removerCurtida = async (usuarioId, deezerId) => {
  await CurtidaMusical.deleteOne({ usuario: usuarioId, deezerId })
  
  // Recalcular matches que envolviam essa música
  await recalcularMatches(usuarioId)
  
  return { message: 'Curtida removida' }
}

// Verificar e criar matches
const verificarMatches = async (usuarioId, track) => {
  // Buscar outros usuários que curtiram a mesma música
  const outrasCurtidas = await CurtidaMusical.find({
    deezerId: track.deezerId,
    usuario: { $ne: usuarioId }
  }).distinct('usuario')
  
  for (const outroUsuarioId of outrasCurtidas) {
    await criarOuAtualizarMatch(usuarioId, outroUsuarioId)
  }
}

// Criar ou atualizar match entre dois usuários
const criarOuAtualizarMatch = async (userA, userB) => {
  const [curtidasA, curtidasB, userAData, userBData] = await Promise.all([
    CurtidaMusical.find({ usuario: userA }),
    CurtidaMusical.find({ usuario: userB }),
    Usuario.findById(userA).populate('generos'),
    Usuario.findById(userB).populate('generos')
  ])
  
  // Músicas em comum
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
  
  // Gêneros em comum
  const generosA = new Set((userAData.generos || []).map(g => g._id.toString()))
  const generosB = new Set((userBData.generos || []).map(g => g._id.toString()))
  const generosComuns = [...generosA].filter(g => generosB.has(g))
  
  // Calcular compatibilidade
  const totalMusicas = Math.min(curtidasA.length, 10) + Math.min(curtidasB.length, 10)
  const scoreMusicas = musicasComuns.length > 0 
    ? Math.min((musicasComuns.length / Math.max(totalMusicas, 1)) * 100, 60)
    : 0
  
  const scoreGeneros = generosComuns.length > 0
    ? Math.min(generosComuns.length * 15, 30)
    : 0
  
  const compatibilidade = Math.min(Math.floor(scoreMusicas + scoreGeneros + 10), 100)
  
  // Só cria match se tiver pelo menos 1 música em comum OU alta compatibilidade
  if (musicasComuns.length === 0 && compatibilidade < 50) return null
  
  // Garantir ordem consistente
  const [idA, idB] = [userA.toString(), userB.toString()].sort()
  
  const match = await Match.findOneAndUpdate(
    { usuarioA: idA, usuarioB: idB },
    {
      musicasComuns: musicasComuns.slice(0, 10),
      generosComuns: generosComuns.slice(0, 5),
      compatibilidade,
      $setOnInsert: { 
        usuarioA: idA, 
        usuarioB: idB,
        iniciadoPor: userA
      }
    },
    { upsert: true, new: true }
  ).populate('usuarioA usuarioB generosComuns')
  
  return match
}

// Recalcular todos os matches de um usuário
const recalcularMatches = async (usuarioId) => {
  const matches = await Match.find({
    $or: [{ usuarioA: usuarioId }, { usuarioB: usuarioId }]
  })
  
  for (const match of matches) {
    const outroId = match.usuarioA.toString() === usuarioId.toString() 
      ? match.usuarioB 
      : match.usuarioA
    await criarOuAtualizarMatch(usuarioId, outroId)
  }
}

// Buscar matches do usuário
const getMatches = async (usuarioId) => {
  const matches = await Match.find({
    $or: [{ usuarioA: usuarioId }, { usuarioB: usuarioId }],
    status: { $ne: 'recusado' }
  })
  .populate('usuarioA usuarioB generosComuns')
  .sort({ compatibilidade: -1, createdAt: -1 })
  
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
        bio: outroUsuario.bio
      },
      compatibility: match.compatibilidade,
      commonSongs: match.musicasComuns.map(m => m.titulo),
      commonGenres: (match.generosComuns || []).map(g => g.nome),
      commonSongsData: match.musicasComuns,
      status: match.status,
      unread: !visto,
      createdAt: match.createdAt
    }
  })
}

// Buscar sugestões de músicas para o usuário
const getSugestoes = async (usuarioId, generosFavoritos = []) => {
  // Buscar curtidas existentes para não repetir
  const curtidasExistentes = await CurtidaMusical.find({ usuario: usuarioId })
    .select('deezerId')
  const idsExistentes = new Set(curtidasExistentes.map(c => c.deezerId))
  
  // Buscar tracks do Deezer
  const queries = generosFavoritos.length > 0 
    ? generosFavoritos.slice(0, 3)
    : ['chart', 'pop', 'rock']
  
  let todasTracks = []
  for (const query of queries) {
    const tracks = await fetchDeezerTracks(query, 20)
    todasTracks.push(...tracks)
  }
  
  // Remover duplicadas e já curtidas
  const unicas = []
  const vistos = new Set()
  for (const track of todasTracks) {
    if (!vistos.has(track.id) && !idsExistentes.has(track.id)) {
      vistos.add(track.id)
      unicas.push(formatTrack(track))
    }
  }
  
  // Embaralhar
  return unicas.sort(() => Math.random() - 0.5).slice(0, 30)
}

// Buscar estatísticas do usuário
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

// Marcar match como visto
const marcarVisto = async (matchId, usuarioId) => {
  const match = await Match.findById(matchId)
  if (!match) return null
  
  const isUserA = match.usuarioA.toString() === usuarioId.toString()
  if (isUserA) {
    match.vistoPorA = true
  } else {
    match.vistoPorB = true
  }
  
  await match.save()
  return match
}

// Aceitar/recusar match
const responderMatch = async (matchId, usuarioId, resposta) => {
  const match = await Match.findById(matchId)
  if (!match) throw new Error('Match não encontrado')
  
  // Verificar se o usuário é parte do match
  const isParte = [match.usuarioA.toString(), match.usuarioB.toString()]
    .includes(usuarioId.toString())
  if (!isParte) throw new Error('Não autorizado')
  
  match.status = resposta // 'aceito' ou 'recusado'
  await match.save()
  
  return match
}

module.exports = {
  fetchDeezerTracks,
  curtirMusica,
  removerCurtida,
  getMatches,
  getSugestoes,
  getEstatisticasMusicais,
  marcarVisto,
  responderMatch,
  formatTrack
}