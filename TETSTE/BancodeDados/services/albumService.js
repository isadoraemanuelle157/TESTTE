const Album = require('../models/Album')

// CRIAR
const createAlbum = async (data) => {
  return await Album.create(data)
}

// LISTAR
const getAlbuns = async () => {
  return await Album.find()
}

// BUSCAR POR ID
const getAlbumById = async (id) => {
  return await Album.findById(id)
}

// ATUALIZAR
const updateAlbum = async (id, data) => {
  return await Album.findByIdAndUpdate(id, data, { new: true })
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