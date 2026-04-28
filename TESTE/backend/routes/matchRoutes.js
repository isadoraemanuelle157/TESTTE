const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const matchController = require('../controllers/matchController')

router.get('/sugestoes', authMiddleware, matchController.getSugestoes)

router.get('/curtidas', authMiddleware, matchController.getCurtidas)
router.post('/curtidas', authMiddleware, matchController.curtirMusica)
router.delete('/curtidas/:deezerId', authMiddleware, matchController.removerCurtida)

router.get('/matches', authMiddleware, matchController.getMatches)
router.put('/matches/:id/visto', authMiddleware, matchController.marcarVisto)
router.put('/matches/:id/responder', authMiddleware, matchController.responderMatch)

router.get('/estatisticas/musicais', authMiddleware, matchController.getEstatisticas)

module.exports = router
