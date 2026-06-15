const express = require('express')
const router = express.Router()

const { requireAuth } = require('../middleware/auth')
const contatoController = require('../controllers/contatoController')

router.post('/mensagens', requireAuth, contatoController.criar)
router.get('/minhas', requireAuth, contatoController.minhas)
router.get('/todas', requireAuth, contatoController.todas)     // admin
router.post('/:id/responder', requireAuth, contatoController.responder)
router.delete('/:id', requireAuth, contatoController.excluir)

module.exports = router