const cantorService = require('../services/cantorService')

// CRIAR CANTOR
const create = async (req, res) => {
  try {
    const cantor = await cantorService.createCantor(req.body)
    res.status(201).json({ 
      message: 'Cantor criado com sucesso', 
      cantor 
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LISTAR TODOS
const list = async (req, res) => {
  try {
    const cantores = await cantorService.getCantores()
    res.json(cantores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const cantor = await cantorService.getCantorById(req.params.id)

    if (!cantor) {
      return res.status(404).json({ message: 'Cantor não encontrado' })
    }

    res.json(cantor)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR NOME
const getByNome = async (req, res) => {
  try {
    const { nome } = req.params
    const cantor = await cantorService.getCantorByNome(nome)

    if (!cantor) {
      return res.status(404).json({ message: 'Cantor não encontrado' })
    }

    res.json(cantor)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ATUALIZAR CANTOR
const update = async (req, res) => {
  try {
    const cantor = await cantorService.updateCantor(req.params.id, req.body)

    if (!cantor) {
      return res.status(404).json({ message: 'Cantor não encontrado' })
    }

    res.json({ 
      message: 'Cantor atualizado com sucesso', 
      cantor 
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// DELETAR CANTOR
const remove = async (req, res) => {
  try {
    const cantor = await cantorService.deleteCantor(req.params.id)

    if (!cantor) {
      return res.status(404).json({ message: 'Cantor não encontrado' })
    }

    res.json({ message: 'Cantor removido com sucesso' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const addAlbum = async (req, res) => {
  try {
    const cantor = await cantorService.addAlbumToCantor(
      req.params.id,
      req.body.albumId // 🔥 só o ID
    )

    res.json({ message: "Álbum adicionado", cantor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  create,
  list,
  getById,
  getByNome,
  update,
  remove,
  addAlbum
}