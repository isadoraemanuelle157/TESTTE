const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const notificacaoController = require('../controllers/notificacaoController')

router.get('/', authMiddleware, notificacaoController.listar)
router.patch('/:id/lida', authMiddleware, notificacaoController.marcar)
router.patch('/marcar-todas', authMiddleware, notificacaoController.marcarTodas)

// NOVAS ROTAS - Deletar:
router.delete('/:id', authMiddleware, notificacaoController.deletar)
router.delete('/', authMiddleware, notificacaoController.deletarTodas)

module.exports = router