const Favorita = require('../models/Favorita')

const toggleFavorita = async (usuarioId, { musicaId, playlistId }) => {
  const query = {
    usuario: usuarioId,
    ...(musicaId && { musica: musicaId }),
    ...(playlistId && { playlist: playlistId })
  }

  const existing = await Favorita.findOne(query)

  if (existing) {
    await existing.deleteOne()
    return { favorited: false }
  }

  await Favorita.create(query)

  return { favorited: true }
}

const getFavoritasByUser = async (usuarioId) => {
  return Favorita.find({ usuario: usuarioId })
    .populate('playlist')
    .populate('musica')
}


module.exports = {
  toggleFavorita,
  getFavoritasByUser
}
