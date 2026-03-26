const Cantor = require('../models/Cantor')
const Album = require('../models/Album')

// CRIAR
const createCantor = async (data) => {
  const cantor = new Cantor(data)
  return await cantor.save()
}

// LISTAR
const getCantores = async () => {
  return await Cantor.find().sort({ _id: -1 })
}


// BUSCAR POR ID
const getCantorById = async (id) => {
  const cantor = await Cantor.findById(id)

  if (!cantor) return null

  const albuns = await Album.find({ cantores: id })

  return {
    ...cantor.toObject(),
    albuns,
    totalAlbuns: albuns.length
  }
}

// BUSCAR POR NOME
const getCantorByNome = async (nome) => {
  return await Cantor.findOne({ nome })
}

// ATUALIZAR
const updateCantor = async (id, data) => {
  return await Cantor.findByIdAndUpdate(id, data, { new: true })
}

// DELETAR
const deleteCantor = async (id) => {
  return await Cantor.findByIdAndDelete(id)
}
const addAlbumToCantor = async (cantorId, albumData) => {
  return await Cantor.findByIdAndUpdate(
    cantorId,
    {
      $push: { albuns: albumData }
    },
    { new: true }
  )
}

module.exports = {
  createCantor,
  getCantores,
  getCantorById,
  getCantorByNome,
  updateCantor,
  deleteCantor
}