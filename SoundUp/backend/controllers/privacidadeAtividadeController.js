const privacidadeAtividadeService = require('../services/privacidadeAtividadeService')

const listarOpcoes = async (req, res) => {
  try {
    const data = await privacidadeAtividadeService.listarPessoasRelacionadas(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listarRestricoes = async (req, res) => {
  try {
    const data = await privacidadeAtividadeService.listarRestricoes(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const salvarRestricao = async (req, res) => {
  try {
    const { usuarioBloqueadoId, recursos } = req.body

    const data = await privacidadeAtividadeService.salvarRestricao(
      req.user.id,
      usuarioBloqueadoId,
      recursos
    )

    res.json({
      message: data ? 'Restrição salva com sucesso' : 'Restrição removida com sucesso',
      data
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const salvarEmLote = async (req, res) => {
  try {
    const { items } = req.body

    const data = await privacidadeAtividadeService.salvarRestricoesEmLote(
      req.user.id,
      items || []
    )

    res.json({
      message: 'Restrições salvas com sucesso',
      data
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const removerRestricao = async (req, res) => {
  try {
    const data = await privacidadeAtividadeService.removerRestricao(
      req.user.id,
      req.params.usuarioBloqueadoId
    )

    res.json({
      message: 'Restrição removida com sucesso',
      data
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  listarOpcoes,
  listarRestricoes,
  salvarRestricao,
  salvarEmLote,
  removerRestricao
}
