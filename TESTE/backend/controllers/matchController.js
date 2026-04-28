const matchService = require('../services/matchService')

const getSugestoes = async (req, res) => {
  try {
    const { generos } = req.query
    const generosArray = generos ? generos.split(',') : []

    const sugestoes = await matchService.getSugestoes(req.user.id, generosArray)

    res.json({
      cards: sugestoes,
      total: sugestoes.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const curtirMusica = async (req, res) => {
  try {
    const { track, tipo = 'like' } = req.body

    if (!track || !(track.id || track.deezerId)) {
      return res.status(400).json({ error: 'Dados da música são obrigatórios' })
    }

    const resultado = await matchService.curtirMusica(req.user.id, track, tipo)

    res.status(201).json({
      message: tipo === 'favorite' ? 'Adicionado aos favoritos!' : 'Música curtida!',
      curtida: resultado.curtida,
      matchesGerados: resultado.matchesGerados?.length || 0
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCurtidas = async (req, res) => {
  try {
    const { tipo } = req.query
    const curtidas = await matchService.getCurtidas(req.user.id, tipo)

    res.json({
      curtidas,
      total: curtidas.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const removerCurtida = async (req, res) => {
  try {
    const { deezerId } = req.params
    const result = await matchService.removerCurtida(req.user.id, Number(deezerId))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getMatches = async (req, res) => {
  try {
    const matches = await matchService.getMatches(req.user.id)

    res.json({
      matches,
      total: matches.length,
      naoVistos: matches.filter(m => m.unread).length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getEstatisticas = async (req, res) => {
  try {
    const stats = await matchService.getEstatisticasMusicais(req.user.id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const marcarVisto = async (req, res) => {
  try {
    const match = await matchService.marcarVisto(req.params.id, req.user.id)
    if (!match) return res.status(404).json({ error: 'Match não encontrado' })

    res.json({ message: 'Match marcado como visto' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const responderMatch = async (req, res) => {
  try {
    const { resposta } = req.body
    const match = await matchService.responderMatch(req.params.id, req.user.id, resposta)

    res.json({
      message: `Match ${resposta}`,
      match
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getSugestoes,
  curtirMusica,
  getCurtidas,
  removerCurtida,
  getMatches,
  getEstatisticas,
  marcarVisto,
  responderMatch
}
