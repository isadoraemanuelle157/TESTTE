const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const matchController = require('../controllers/matchMusicalController')

// Sugestões
router.get('/sugestoes', authMiddleware, matchController.sugestoes)

// Curtidas
router.get('/curtidas', authMiddleware, matchController.listarCurtidas)
router.post('/curtidas', authMiddleware, matchController.curtir)
router.delete('/curtidas/:trackId', authMiddleware, matchController.removerCurtida)

// Matches (CORRIGIDO)
router.get('/', authMiddleware, matchController.listarMatches)
router.put('/:id/visto', authMiddleware, matchController.marcarVisto)
router.put('/:id/responder', authMiddleware, matchController.responder)
router.delete('/:id', authMiddleware, matchController.removerMatch)

module.exports = router