const Favorita = require('../models/Favorita')

const toggleFavorita = async (usuarioId, { musicaId, playlistId, albumId, cantorId }) => {
  const query = {
    usuario: usuarioId,
    ...(musicaId && { musica: musicaId }),
    ...(playlistId && { playlist: playlistId }),
    ...(albumId && { album: albumId }),
    ...(cantorId && { cantor: cantorId })
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
    .populate('musica')
    .populate('playlist')
    .populate('album')   // 🔥 novo
    .populate('cantor')  // 🔥 novo
}

module.exports = {
  toggleFavorita,
  getFavoritasByUser
}
