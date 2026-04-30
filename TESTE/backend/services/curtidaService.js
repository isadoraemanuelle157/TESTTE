const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')

// ========== CURTIDAS LOCAIS (existente) ==========
const toggleCurtida = async (usuarioId, musicaId) => {
  const existing = await Curtida.findOne({
    usuario: usuarioId,
    musica: musicaId
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false, source: 'local' }
  }

  await Curtida.create({
    usuario: usuarioId,
    musica: musicaId
  })

  return { liked: true, source: 'local' }
}

const countCurtidas = async (playlistId) => {
  return Curtida.countDocuments({ playlist: playlistId })
}

// ========== CURTIDAS EXTERNAS (Spotify/Deezer) ==========
const toggleCurtidaExterna = async (usuarioId, musicaId, source, dadosMusica) => {
  const existing = await CurtidaExterna.findOne({
    usuario: usuarioId,
    musicaId: musicaId,
    source: source
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false, source: source }
  }

  await CurtidaExterna.create({
    usuario: usuarioId,
    musicaId: musicaId,
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
  const [locais, externas] = await Promise.all([
    Curtida.find({ usuario: usuarioId })
      .populate({
        path: 'musica',
        populate: { path: 'cantores', select: 'nome' }
      })
      .sort({ createdAt: -1 }),
    CurtidaExterna.find({ usuario: usuarioId }).sort({ createdAt: -1 })
  ])

  return {
    locais,
    externas
  }
}

module.exports = {
  toggleCurtida,
  toggleCurtidaExterna,
  countCurtidas,
  getTodasCurtidas
}