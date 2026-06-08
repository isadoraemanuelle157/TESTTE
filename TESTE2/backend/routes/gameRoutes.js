const express = require('express')
const router = express.Router()
const gameController = require('../controllers/gameController')
const { requireAuth, optionalAuth } = require('../middleware/auth')

router.get('/modes', gameController.getGameModes)
router.get('/leaderboard', gameController.getLeaderboard)
router.get('/activities/live', gameController.getLiveActivities)

// aqui precisa ser optionalAuth
router.get('/shop', optionalAuth, gameController.getShop)

router.get('/modes/:modo/difficulties', requireAuth, gameController.getDifficulties)
router.post('/start', optionalAuth, gameController.startGame)
router.post('/answer', optionalAuth, gameController.answerQuestion)

router.get('/rewards/daily', requireAuth, gameController.getDailyRewards)
router.post('/rewards/daily/claim', requireAuth, gameController.claimDailyReward)

router.post('/shop/buy', requireAuth, gameController.buyItem)
router.post('/shop/equip', requireAuth, gameController.equipItem)
router.post('/shop/unequip', requireAuth, gameController.unequipItem)
router.get('/inventory/active', requireAuth, gameController.getActiveInventory)

router.get('/inventory/equipped', requireAuth, gameController.getEquippedItems)

router.get('/achievements', requireAuth, gameController.getAchievements)
router.post('/achievements/claim', requireAuth, gameController.claimAchievement)

router.get('/stats', requireAuth, gameController.getStats)

module.exports = router
