const Curtida = require('../models/Curtida')

const toggleCurtida = async (usuarioId, musicaId) => {
  const existing = await Curtida.findOne({
    usuario: usuarioId,
    musica: musicaId
  })

  if (existing) {
    await existing.deleteOne()
    return { liked: false }
  }

  await Curtida.create({
    usuario: usuarioId,
    musica: musicaId
  })

  return { liked: true }
}

const countCurtidas = async (playlistId) => {
  return Curtida.countDocuments({ playlist: playlistId })
}

module.exports = {
  toggleCurtida,
  countCurtidas
}
