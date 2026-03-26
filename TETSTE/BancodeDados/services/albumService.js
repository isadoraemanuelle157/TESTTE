const Album = require('../models/Album')
const Cantor = require('../models/Cantor')

// CRIAR
const createAlbum = async (data) => {
  const album = new Album(data)
  const savedAlbum = await album.save()
  // 🔥 Atualiza cantor
  if (data.cantores && data.cantores.length > 0) {
    await Cantor.updateMany(
      { _id: { $in: data.cantores } },
      { $push: { albuns: savedAlbum._id } }
    )
  }

  return savedAlbum
}

// LISTAR
const getAlbuns = async (cantor) => {
  let filtro = {}

  if (cantor) {
    filtro = { cantores: cantor }
  }

  return await Album.find(filtro)
    .populate('cantores', 'nome foto')
}

// BUSCAR POR ID
const getAlbumById = async (id) => {
  return await Album.findById(id)
    .populate('cantores', 'nome _id')
}

// ATUALIZAR
const updateAlbum = async (id, data) => {
  return await Album.findByIdAndUpdate(id, data, { new: true })
    .populate('cantores', 'nome _id')
}

// DELETAR
const deleteAlbum = async (id) => {
  return await Album.findByIdAndDelete(id)
}

module.exports = {
  createAlbum,
  getAlbuns,
  getAlbumById,
  updateAlbum,
  deleteAlbum
}