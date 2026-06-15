const express = require('express')
const router = express.Router()

const { requireAuth } = require('../middleware/auth')
const matchController = require('../controllers/matchMusicalController')

// Sugestões
router.get('/sugestoes', requireAuth, matchController.sugestoes)

// Curtidas
router.get('/curtidas', requireAuth, matchController.listarCurtidas)
router.post('/curtidas', requireAuth, matchController.curtir)
router.delete('/curtidas/:trackId', requireAuth, matchController.removerCurtida)

// Matches (CORRIGIDO)
router.get('/', requireAuth, matchController.listarMatches)
router.put('/:id/visto', requireAuth, matchController.marcarVisto)
router.put('/:id/responder', requireAuth, matchController.responder)
router.delete('/:id', requireAuth, matchController.removerMatch)
// Excluir conta do usuário
router.delete('/conta', requireAuth, matchController.excluirConta)

module.exports = router