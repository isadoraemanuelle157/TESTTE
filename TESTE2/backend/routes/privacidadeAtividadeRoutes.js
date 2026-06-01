const express = require('express')
const router = express.Router()

const { requireAuth } = require('../middleware/auth')
const controller = require('../controllers/privacidadeAtividadeController')

router.get('/atividade/opcoes', requireAuth, controller.listarOpcoes)
router.get('/atividade', requireAuth, controller.listarRestricoes)
router.post('/atividade', requireAuth, controller.salvarRestricao)
router.put('/atividade/lote', requireAuth, controller.salvarEmLote)
router.delete('/atividade/:usuarioBloqueadoId', requireAuth, controller.removerRestricao)

module.exports = router