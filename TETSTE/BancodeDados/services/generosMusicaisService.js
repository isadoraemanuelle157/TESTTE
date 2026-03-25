const Genero = require('../models/generosMusicais')

// CRIAR
const createGenero = async (data) => {
  const { nome, descricao } = data

  const genero = new Genero({
    nome,
    descricao
  })

  return await genero.save()
}

// LISTAR TODOS
const getGeneros = async () => {
  const generos = await Genero.find()
    .populate('musicas', '_id nome') // traz músicas completas

  return generos.map(g => ({
    ...g._doc,
    quantidade: g.musicas.length // 🔥 quantidade automática
  }))
}

// BUSCAR POR ID
const getGeneroById = async (id) => {
  return await Genero.findById(id)
}

// ATUALIZAR
const updateGenero = async (id, data) => {
  return await Genero.findByIdAndUpdate(id, data, { new: true })
}

// DELETAR
const deleteGenero = async (id) => {
  return await Genero.findByIdAndDelete(id)
}

module.exports = {
  createGenero,
  getGeneros,
  getGeneroById,
  updateGenero,
  deleteGenero
}