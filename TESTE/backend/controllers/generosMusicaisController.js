const generoService = require('../services/GenerosMusicaisService')

// CRIAR
const create = async (req, res) => {
  try {
    const genero = await generoService.createGenero(req.body)
    res.status(201).json({ message: "Gênero criado", genero })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LISTAR
const list = async (req, res) => {
  try {
    const generos = await generoService.getGeneros()
    res.json(generos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const genero = await generoService.getGeneroById(req.params.id)

    if (!genero) {
      return res.status(404).json({ message: "Gênero não encontrado" })
    }

    res.json(genero)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ATUALIZAR
const update = async (req, res) => {
  try {
    const genero = await generoService.updateGenero(req.params.id, req.body)

    if (!genero) {
      return res.status(404).json({ message: "Gênero não encontrado" })
    }

    res.json({ message: "Gênero atualizado", genero })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETAR
const remove = async (req, res) => {
  try {
    const genero = await generoService.deleteGenero(req.params.id)

    if (!genero) {
      return res.status(404).json({ message: "Gênero não encontrado" })
    }

    res.json({ message: "Gênero removido" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove
}