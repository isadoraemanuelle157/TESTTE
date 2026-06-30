const express = require('express')
const router = express.Router()

const { requireAuth } = require('../middleware/auth')
const notificacaoController = require('../controllers/notificacaoController')

router.post('/', requireAuth, notificacaoController.criar) // NOVO
router.get('/', requireAuth, notificacaoController.listar)
router.patch('/:id/lida', requireAuth, notificacaoController.marcar)
router.patch('/marcar-todas', requireAuth, notificacaoController.marcarTodas)
router.delete('/:id', requireAuth, notificacaoController.deletar)
router.delete('/', requireAuth, notificacaoController.deletarTodas)

module.exports = router
