const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')
const mongoose = require('mongoose')  // <-- ADICIONAR no topo

// ========== CURTIDAS LOCAIS ==========
const toggleCurtida = async (usuarioId, musicaId) => {
  // 🔥 GARANTE QUE AMBOS SÃO OBJECTID
  const userOid = mongoose.Types.ObjectId.isValid(usuarioId) 
    ? new mongoose.Types.ObjectId(usuarioId) 
    : usuarioId
  const musicaOid = mongoose.Types.ObjectId.isValid(musicaId) 
    ? new mongoose.Types.ObjectId(musicaId) 
    : musicaId

  const existing = await Curtida.findOne({
    usuario: userOid,
    musica: musicaOid
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false, source: 'local' }
  }

  await Curtida.create({
    usuario: userOid,
    musica: musicaOid
  })

  return { liked: true, source: 'local' }
}
const countCurtidas = async (playlistId) => {
  return Curtida.countDocuments({ playlist: playlistId })
}

// ========== CURTIDAS EXTERNAS (Spotify/Deezer) ==========
const toggleCurtidaExterna = async (usuarioId, musicaId, source, dadosMusica) => {
  // 🔥 CONVERTE usuarioId PARA OBJECTID
  const userOid = mongoose.Types.ObjectId.isValid(usuarioId)
    ? new mongoose.Types.ObjectId(usuarioId)
    : usuarioId

  const idExterno = String(musicaId)

  const existing = await CurtidaExterna.findOne({
    usuario: userOid,          // ✅ ObjectId consistente
    musicaId: idExterno,
    source: source
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false, source: source }
  }

  await CurtidaExterna.create({
    usuario: userOid,          // ✅ ObjectId consistente
    musicaId: idExterno,
    source: source,
    dadosMusica: {
      titulo: dadosMusica.titulo,
      artista: dadosMusica.artista,
      capa: dadosMusica.capa || '',
      previewUrl: dadosMusica.previewUrl || '',
      duration: dadosMusica.duration || 30,
      ano: dadosMusica.ano || null,
      album: dadosMusica.album || ''
    }
  })

  return { liked: true, source: source }
}

// Buscar todas as curtidas do usuário (locais + externas)
const getTodasCurtidas = async (usuarioId) => {
    const userOid = mongoose.Types.ObjectId.isValid(usuarioId) 
    ? new mongoose.Types.ObjectId(usuarioId) 
    : usuarioId
    
 const [locais, externas] = await Promise.all([
    Curtida.find({ usuario: userOid })              // ✅ usa userOid (ObjectId)
      .populate({
        path: 'musica',
        populate: { path: 'cantores', select: 'nome' }
      })
      .sort({ createdAt: -1 }),
  CurtidaExterna.find({ usuario: userOid })       // ✅ usa userOid (ObjectId)
  ])

  return { locais, externas }
}

// ========== VERIFICAR SE MÚSICA ESTÁ EM ALGUMA PLAYLIST DO USUÁRIO ==========
const getPlaylistsComMusica = async (usuarioId, musicaId, source) => {
  const userOid = mongoose.Types.ObjectId.isValid(usuarioId)
    ? new mongoose.Types.ObjectId(usuarioId)
    : usuarioId

  const Playlist = mongoose.model('Playlist') // ou require('../models/Playlist')

  const playlists = await Playlist.find({ usuario: userOid })

  // Verifica em cada playlist se a música existe
  const playlistsComMusica = playlists.filter(p => {
    return p.musicas?.some(m => {
      const idMusicaPlaylist = String(m.id || m._id || m.musicaId)
      const idMusicaBuscada = String(musicaId)
      return idMusicaPlaylist === idMusicaBuscada
    })
  }).map(p => String(p._id))

  return playlistsComMusica
}

// ========== VERIFICAR SE MÚSICA ESTÁ NOS FAVORITOS ==========
const isFavorita = async (usuarioId, musicaId, source) => {
  const userOid = mongoose.Types.ObjectId.isValid(usuarioId)
    ? new mongoose.Types.ObjectId(usuarioId)
    : usuarioId

  const Favorita = mongoose.model('Favorita') // ou require('../models/Favorita')

  const query = { usuario: userOid }

  if (source && source !== 'local') {
    query.musicaId = String(musicaId)
    query.source = source
  } else {
    query.musica = mongoose.Types.ObjectId.isValid(musicaId)
      ? new mongoose.Types.ObjectId(musicaId)
      : musicaId
  }

  const favorita = await Favorita.findOne(query)
  return !!favorita
}

module.exports = {
  toggleCurtida,
  toggleCurtidaExterna,
  countCurtidas,
  getTodasCurtidas,
  getPlaylistsComMusica,  // ← ADICIONAR
  isFavorita              // ← ADICIONAR
}