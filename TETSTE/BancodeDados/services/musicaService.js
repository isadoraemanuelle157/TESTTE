const Musica = require('../models/Musicas')

// CRIAR
const createMusica = async (data) => {
  return await Musica.create(data)
}

// LISTAR
const getMusicas = async () => {
  return await Musica.find()
    .populate('generoId', 'nome _id') // 🔥 traz nome do gênero
}

// BUSCAR POR ID
const getMusicaById = async (id) => {
  return await Musica.findById(id)
}

// ATUALIZAR
const updateMusica = async (id, data) => {
  return await Musica.findByIdAndUpdate(id, data, { new: true })
}

// DELETAR
const deleteMusica = async (id) => {
  return await Musica.findByIdAndDelete(id)
}

module.exports = {
  createMusica,
  getMusicas,
  getMusicaById,
  updateMusica,
  deleteMusica
}