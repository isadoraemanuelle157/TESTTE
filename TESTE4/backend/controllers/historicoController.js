const historicoService = require('../services/historicoService')

// GET
const getHistorico = async (req, res) => {
  try {
    const data = await historicoService.getHistoricoByUser(req.user.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST
const addHistorico = async (req, res) => {
  try {
    const { termo } = req.body

    const data = await historicoService.addHistorico(req.user.id, termo)
    res.status(201).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// DELETE
const clearHistorico = async (req, res) => {
  try {
    await historicoService.clearHistorico(req.user.id)
    res.json({ message: "Histórico limpo" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getHistorico,
  addHistorico,
  clearHistorico
}
