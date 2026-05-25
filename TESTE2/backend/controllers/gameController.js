const gameService = require('../services/gameService')

// ============================================
// 🎮 MODOS DE JOGO
// ============================================

const getGameModes = async (req, res) => {
  try {
    const modes = Object.entries(gameService.GAME_CONFIG).map(([id, config]) => ({
      id,
      ...config,
      players: Math.floor(Math.random() * 5000) + 1000, // Simulado
      difficultyClass: 'medium'
    }))
    
    res.json({ modes })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getDifficulties = async (req, res) => {
  try {
    const { modo } = req.params
    const stats = await gameService.getUserGameStats(req.user.id)
    
    const difficulties = Object.entries(gameService.DIFICULTIES).map(([level, config]) => ({
      level,
      ...config,
      completed: stats.progresso[modo]?.[level]?.completado || false,
      locked: level !== 'easy' && (stats.progresso[modo]?.[level]?.bloqueado ?? true),
      bestScore: stats.progresso[modo]?.[level]?.melhorPontuacao || 0
    }))
    
    res.json({ difficulties })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// 🚀 INICIAR JOGO
// ============================================

const startGame = async (req, res) => {
  try {
    const { modo, dificuldade } = req.body
    
    if (!modo || !dificuldade) {
      return res.status(400).json({ error: 'Modo e dificuldade são obrigatórios' })
    }
    
    const result = await gameService.iniciarSessao(req.user.id, modo, dificuldade)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ============================================
// ✅ RESPONDER
// ============================================

const answerQuestion = async (req, res) => {
  try {
    const { sessionId, respostaIndex, tempoResposta } = req.body
    
    if (sessionId === undefined || respostaIndex === undefined) {
      return res.status(400).json({ error: 'sessionId e respostaIndex são obrigatórios' })
    }
    
    const result = await gameService.responderPergunta(
      sessionId,
      parseInt(respostaIndex),
      parseInt(tempoResposta) || 0
    )
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ============================================
// 📊 LEADERBOARD
// ============================================

const getLeaderboard = async (req, res) => {
  try {
    const { periodo = 'semana', limite = 50 } = req.query
    const leaderboard = await gameService.getLeaderboard(periodo, parseInt(limite))
    
    res.json({ leaderboard })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// 🎁 RECOMPENSAS
// ============================================

const getDailyRewards = async (req, res) => {
  try {
    const rewards = await gameService.getDailyRewards(req.user.id)
    res.json(rewards)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const claimDailyReward = async (req, res) => {
  try {
    const { dia } = req.body
    const result = await gameService.claimDailyReward(req.user.id, parseInt(dia))
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ============================================
// 🛒 LOJA
// ============================================

const getShop = async (req, res) => {
  try {
    // Se não tiver usuário autenticado, retorna itens sem status de "possuído"
    const userId = req.user?.id
    
    let items
    if (userId) {
      items = await gameService.getShopItems(userId)
    } else {
      // Retorna itens sem informação de posse
      const { LOJA_ITENS } = require('../services/gameService')
      items = LOJA_ITENS.map(item => ({
        ...item,
        possuido: false,
        podeComprar: false // Não pode comprar sem login
      }))
    }
    
    res.json({ items })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const buyItem = async (req, res) => {
  try {
    const { itemId } = req.body
    const result = await gameService.buyItem(req.user.id, itemId)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ============================================
// 🏆 CONQUISTAS
// ============================================

const getAchievements = async (req, res) => {
  try {
    const achievements = await gameService.getAchievements(req.user.id)
    res.json({ achievements })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const claimAchievement = async (req, res) => {
  try {
    const { conquistaId } = req.body
    const result = await gameService.claimAchievement(req.user.id, conquistaId)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ============================================
// 📈 STATS
// ============================================

const getStats = async (req, res) => {
  try {
    const stats = await gameService.getUserGameStats(req.user.id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// 🔥 ATIVIDADES AO VIVO
// ============================================

const getLiveActivities = async (req, res) => {
  try {
    const activities = await gameService.getLiveActivities()
    res.json({ activities })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getGameModes,
  getDifficulties,
  startGame,
  answerQuestion,
  getLeaderboard,
  getDailyRewards,
  claimDailyReward,
  getShop,
  buyItem,
  getAchievements,
  claimAchievement,
  getStats,
  getLiveActivities
}