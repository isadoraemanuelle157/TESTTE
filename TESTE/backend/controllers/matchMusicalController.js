const matchService = require('../services/matchMusicalService')

const sugestoes = async (req, res) => {
  try {
    const data = await matchService.getSuggestions(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listarCurtidas = async (req, res) => {
  try {
    const { tipo } = req.query
    const curtidas = await matchService.listCurtidas(req.user.id, tipo)
    res.json({ curtidas })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const curtir = async (req, res) => {
  try {
    const { track, tipo } = req.body

    if (!track) {
      return res.status(400).json({ error: 'Track é obrigatória' })
    }

    if (!['like', 'favorite'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' })
    }

    const curtida = await matchService.createCurtida(req.user.id, track, tipo)

    res.status(201).json({
      message: 'Interação salva com sucesso',
      curtida
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const removerCurtida = async (req, res) => {
  try {
    const { trackId } = req.params
    const { tipo } = req.query

    const curtida = await matchService.deleteCurtida(req.user.id, trackId, tipo)

    if (!curtida) {
      return res.status(404).json({ message: 'Interação não encontrada' })
    }

    res.json({
      message: 'Interação removida com sucesso',
      curtida
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listarMatches = async (req, res) => {
  try {
    const data = await matchService.listMatches(req.user.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const marcarVisto = async (req, res) => {
  try {
    const match = await matchService.markMatchAsSeen(req.params.id, req.user.id)

    if (!match) {
      return res.status(404).json({ message: 'Match não encontrado' })
    }

    res.json({ message: 'Match marcado como visto' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const responder = async (req, res) => {
  try {
    const { resposta } = req.body

    if (!['aceito', 'recusado'].includes(resposta)) {
      return res.status(400).json({ error: 'Resposta inválida' })
    }

    const match = await matchService.respondToMatch(req.params.id, req.user.id, resposta)

    if (!match) {
      return res.status(404).json({ message: 'Match não encontrado' })
    }

    res.json({
      message: 'Resposta registrada',
      match
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const removerMatch = async (req, res) => {
  try {
    const match = await matchService.hideMatch(req.params.id, req.user.id)

    if (!match) {
      return res.status(404).json({ message: 'Match não encontrado' })
    }

    res.json({ message: 'Match removido da sua lista' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  sugestoes,
  listarCurtidas,
  curtir,
  removerCurtida,
  listarMatches,
  marcarVisto,
  responder,
  removerMatch
}
