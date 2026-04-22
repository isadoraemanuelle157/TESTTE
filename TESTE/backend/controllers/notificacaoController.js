const notificacaoService = require('../services/notificacaoService')

const listar = async (req, res) => {
  try {
    const data = await notificacaoService.listar(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const marcar = async (req, res) => {
  try {
    await notificacaoService.marcarComoLida(req.params.id, req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const marcarTodas = async (req, res) => {
  try {
    await notificacaoService.marcarTodas(req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// NOVO: Deletar uma notificação
const deletar = async (req, res) => {
  try {
    await notificacaoService.deletar(req.params.id, req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// NOVO: Deletar todas as notificações do usuário
const deletarTodas = async (req, res) => {
  try {
    await notificacaoService.deletarTodas(req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  listar,
  marcar,
  marcarTodas,
  deletar,
  deletarTodas
}