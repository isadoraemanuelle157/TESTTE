const Cantor = require('../models/Cantor')

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
  return await Cantor.findById(id)
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

module.exports = {
  createCantor,
  getCantores,
  getCantorById,
  getCantorByNome,
  updateCantor,
  deleteCantor
}