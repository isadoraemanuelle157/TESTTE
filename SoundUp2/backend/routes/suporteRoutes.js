// ✅ CORRIGIDO (suporteRoutes.js)
const express = require('express')
const router = express.Router()

const { requireAuth } = require('../middleware/auth')
const suporteController = require('../controllers/suporteController')

router.post('/mensagens', requireAuth, suporteController.criar)
router.get('/minhas', requireAuth, suporteController.minhas)
router.get('/todas', requireAuth, suporteController.todas)      // ← ADICIONAR ESTA LINHA
router.post('/:id/responder', requireAuth, suporteController.responder)
router.delete('/:id', requireAuth, suporteController.excluir)

module.exports = router