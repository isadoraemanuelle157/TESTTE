const notificacaoService = require('../services/notificacaoService')

const criar = async (req, res) => {
  try {
    const { destinatarioId, tipo, mensagem = '', meta = {} } = req.body

    if (!destinatarioId || !tipo) {
      return res.status(400).json({
        error: 'destinatarioId e tipo são obrigatórios'
      })
    }

    const notificacao = await notificacaoService.criar({
      usuarioDestino: destinatarioId,
      usuarioOrigem: req.user.id,
      tipo,
      mensagem,
      meta
    })

    res.status(201).json(notificacao)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

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

const deletar = async (req, res) => {
  try {
    await notificacaoService.deletar(req.params.id, req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deletarTodas = async (req, res) => {
  try {
    await notificacaoService.deletarTodas(req.user.id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  criar, // NOVO
  listar,
  marcar,
  marcarTodas,
  deletar,
  deletarTodas
}
