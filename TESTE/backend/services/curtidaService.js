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
  // Garante que musicaId seja string
  const idExterno = String(musicaId)

  const existing = await CurtidaExterna.findOne({
    usuario: usuarioId,
    musicaId: idExterno,
    source: source
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false, source: source }
  }

  await CurtidaExterna.create({
    usuario: usuarioId,
    musicaId: idExterno,  // <-- Sempre string
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
    Curtida.find({ usuario: usuarioId })
      .populate({
        path: 'musica',
        populate: { path: 'cantores', select: 'nome' }
      })
      .sort({ createdAt: -1 }),
    CurtidaExterna.find({ usuario: usuarioId }).sort({ createdAt: -1 })
  ])

  return { locais, externas }
}

module.exports = {
  toggleCurtida,
  toggleCurtidaExterna,
  countCurtidas,
  getTodasCurtidas
}