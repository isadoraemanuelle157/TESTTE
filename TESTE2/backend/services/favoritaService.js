const Favorita = require('../models/Favorita')

const toggleFavorita = async (usuarioId, { musicaId, playlistId, albumId, cantorId }) => {
  // Verifica se pelo menos um ID válido foi enviado
  const hasValidId = musicaId || playlistId || albumId || cantorId
  
  if (!hasValidId) {
    throw new Error('Nenhum item válido foi enviado para favoritar')
  }

  // Constrói a query dinamicamente apenas com os campos que existem
  const query = { usuario: usuarioId }
  
  if (musicaId) query.musica = musicaId
  if (playlistId) query.playlist = playlistId
  if (albumId) query.album = albumId
  if (cantorId) query.cantor = cantorId

  // Verifica se já existe favorito com esses critérios
  const existing = await Favorita.findOne(query)

  if (existing) {
    await existing.deleteOne()
    return { favorited: false }
  }

  // Cria o documento apenas com os campos necessários
  const newFavoritaData = { usuario: usuarioId }
  if (musicaId) newFavoritaData.musica = musicaId
  if (playlistId) newFavoritaData.playlist = playlistId
  if (albumId) newFavoritaData.album = albumId
  if (cantorId) newFavoritaData.cantor = cantorId

  await Favorita.create(newFavoritaData)

  return { favorited: true }
}

const getFavoritasByUser = async (usuarioId) => {
  return Favorita.find({ usuario: usuarioId })
    .populate({
      path: 'musica',
      populate: {
        path: 'cantores',
        select: 'nome foto'
      }
    })
    .populate('playlist')
    .populate({
      path: 'album',
      populate: {
        path: 'cantor',
        select: 'nome foto'
      }
    })
    .populate('cantor')
    .sort({ createdAt: -1 })
}

module.exports = {
  toggleFavorita,
  getFavoritasByUser
}