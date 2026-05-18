const express = require('express')
const router = express.Router()
const gameController = require('../controllers/gameController')
const { requireAuth } = require('../middleware/auth')

// 🎮 Modos de jogo
router.get('/modes', gameController.getGameModes)
router.get('/modes/:modo/difficulties', requireAuth, gameController.getDifficulties)

// 🚀 Jogar
router.post('/start', requireAuth, gameController.startGame)
router.post('/answer', requireAuth, gameController.answerQuestion)

// 📊 Leaderboard
router.get('/leaderboard', gameController.getLeaderboard)

// 🎁 Recompensas diárias
router.get('/rewards/daily', requireAuth, gameController.getDailyRewards)
router.post('/rewards/daily/claim', requireAuth, gameController.claimDailyReward)

// 🛒 Loja
router.get('/shop', requireAuth, gameController.getShop)
router.post('/shop/buy', requireAuth, gameController.buyItem)

// 🏆 Conquistas
router.get('/achievements', requireAuth, gameController.getAchievements)
router.post('/achievements/claim', requireAuth, gameController.claimAchievement)

// 📈 Estatísticas
router.get('/stats', requireAuth, gameController.getStats)

// 🔥 Atividades ao vivo
router.get('/activities/live', gameController.getLiveActivities)

module.exports = router