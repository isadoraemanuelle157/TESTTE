const Album = require('../models/Album')
const Cantor = require('../models/Cantor')

// CRIAR
const createAlbum = async (data) => {
  // 🔥 GARANTE ARRAY
  if (data.cantores && !Array.isArray(data.cantores)) {
    data.cantores = [data.cantores]
  }

  const album = new Album(data)
  const savedAlbum = await album.save()

  // 🔥 Atualiza cantor
  if (data.cantores && data.cantores.length > 0) {
    await Cantor.updateMany(
      { _id: { $in: data.cantores } },
      { $addToSet: { albuns: savedAlbum._id } } // evita duplicado
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