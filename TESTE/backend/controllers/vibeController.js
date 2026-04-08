const vibeService = require('../services/vibeService')

// criar
const create = async (req, res) => {
  try {
    const vibe = await vibeService.createVibe(req.body)
    res.status(201).json(vibe)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// listar
const list = async (req, res) => {
  try {
    const vibes = await vibeService.getVibes()
    res.json(vibes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// buscar por id
const getById = async (req, res) => {
  try {
    const vibe = await vibeService.getVibeById(req.params.id)
    if (!vibe) return res.status(404).json({ message: "Vibe não encontrada" })
    res.json(vibe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// atualizar
const update = async (req, res) => {
  try {
    const vibe = await vibeService.updateVibe(req.params.id, req.body)
    res.json(vibe)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// deletar
const remove = async (req, res) => {
  try {
    await vibeService.deleteVibe(req.params.id)
    res.json({ message: "Vibe removida" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove
}