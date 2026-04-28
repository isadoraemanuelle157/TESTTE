const matchService = require('../services/matchService')

// Buscar sugestões de músicas
const getSugestoes = async (req, res) => {
  try {
    const { generos } = req.query
    const generosArray = generos ? generos.split(',') : []
    
    const sugestoes = await matchService.getSugestoes(req.user.id, generosArray)
    res.json(sugestoes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Curtir uma música
const curtirMusica = async (req, res) => {
  try {
    const { track, tipo = 'like' } = req.body
    
    if (!track || !track.id) {
      return res.status(400).json({ error: 'Dados da música são obrigatórios' })
    }
    
    const curtida = await matchService.curtirMusica(req.user.id, track, tipo)
    res.status(201).json({
      message: tipo === 'favorite' ? 'Adicionado aos favoritos!' : 'Música curtida!',
      curtida
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Remover curtida
const removerCurtida = async (req, res) => {
  try {
    const { deezerId } = req.params
    const result = await matchService.removerCurtida(req.user.id, parseInt(deezerId))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Buscar matches
const getMatches = async (req, res) => {
  try {
    const matches = await matchService.getMatches(req.user.id)
    res.json(matches)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Estatísticas musicais
const getEstatisticas = async (req, res) => {
  try {
    const stats = await matchService.getEstatisticasMusicais(req.user.id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Marcar match como visto
const marcarVisto = async (req, res) => {
  try {
    const match = await matchService.marcarVisto(req.params.id, req.user.id)
    if (!match) return res.status(404).json({ error: 'Match não encontrado' })
    res.json({ message: 'Match marcado como visto' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Responder match (aceitar/recusar)
const responderMatch = async (req, res) => {
  try {
    const { resposta } = req.body // 'aceito' ou 'recusado'
    const match = await matchService.responderMatch(req.params.id, req.user.id, resposta)
    res.json({ message: `Match ${resposta}`, match })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getSugestoes,
  curtirMusica,
  removerCurtida,
  getMatches,
  getEstatisticas,
  marcarVisto,
  responderMatch
}