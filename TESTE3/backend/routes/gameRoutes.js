const express = require('express')
const router = express.Router()
const gameController = require('../controllers/gameController')
const { requireAuth, optionalAuth } = require('../middleware/auth')

// ============================================
// 🎮 ROTAS PÚBLICAS (sem auth)
// ============================================

// Listar modos de jogo
router.get('/modes', gameController.getGameModes)

// Leaderboard público
router.get('/leaderboard', gameController.getLeaderboard)

// Atividades ao vivo
router.get('/activities/live', gameController.getLiveActivities)

// Loja - listar itens (público, mas retorna sem status de posse se não logado)
router.get('/shop', gameController.getShop)


// ============================================
// 🔒 ROTAS PROTEGIDAS (com auth)
// ============================================

// Dificuldades de um modo específico
router.get('/modes/:modo/difficulties', requireAuth, gameController.getDifficulties)

// Iniciar jogo
router.post('/start', requireAuth, gameController.startGame)

// Responder pergunta
router.post('/answer', requireAuth, gameController.answerQuestion)

// Recompensas diárias
router.get('/rewards/daily', requireAuth, gameController.getDailyRewards)
router.post('/rewards/daily/claim', requireAuth, gameController.claimDailyReward)

// Loja - comprar item
router.post('/shop/buy', requireAuth, gameController.buyItem)

// Conquistas
router.get('/achievements', requireAuth, gameController.getAchievements)
router.post('/achievements/claim', requireAuth, gameController.claimAchievement)

// Estatísticas do usuário
router.get('/stats', requireAuth, gameController.getStats)

module.exports = router