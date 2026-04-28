const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const matchController = require('../controllers/matchController')

// Sugestões de músicas do Deezer
router.get('/sugestoes', authMiddleware, matchController.getSugestoes)

// Curtir/descurtir música
router.post('/curtidas', authMiddleware, matchController.curtirMusica)
router.delete('/curtidas/:deezerId', authMiddleware, matchController.removerCurtida)

// Matches
router.get('/matches', authMiddleware, matchController.getMatches)
router.put('/matches/:id/visto', authMiddleware, matchController.marcarVisto)
router.put('/matches/:id/responder', authMiddleware, matchController.responderMatch)

// Estatísticas musicais
router.get('/estatisticas/musicais', authMiddleware, matchController.getEstatisticas)

module.exports = router