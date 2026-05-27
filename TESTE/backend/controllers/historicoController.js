const historicoService = require('../services/historicoService')

// ========== BUSCAS (existente) ==========

const getHistorico = async (req, res) => {
  try {
    const data = await historicoService.getHistoricoByUser(req.user.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addHistorico = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(200).json({ message: 'Histórico não salvo (usuário não logado)' })
    }

    const { termo } = req.body
    const data = await historicoService.addHistorico(req.user.id, termo)
    res.status(201).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const clearHistorico = async (req, res) => {
  try {
    await historicoService.clearHistorico(req.user.id)
    res.json({ message: "Histórico limpo" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ========== 🔥 REPRODUÇÕES (novo) ==========

const getReproducoes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const data = await historicoService.getReproducoesByUser(req.user.id, limit)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addReproducao = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(200).json({ message: 'Reprodução não salva (usuário não logado)' })
    }

    const dados = req.body
    const data = await historicoService.addReproducao(req.user.id, dados)
    res.status(201).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const clearReproducoes = async (req, res) => {
  try {
    await historicoService.clearReproducoes(req.user.id)
    res.json({ message: "Histórico de reproduções limpo" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteReproducao = async (req, res) => {
  try {
    const { id } = req.params
    await historicoService.deleteReproducaoById(req.user.id, id)
    res.json({ message: "Reprodução removida" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  // Buscas
  getHistorico,
  addHistorico,
  clearHistorico,
  // 🔥 Reproduções
  getReproducoes,
  addReproducao,
  clearReproducoes,
  deleteReproducao  // ← ADICIONAR
}