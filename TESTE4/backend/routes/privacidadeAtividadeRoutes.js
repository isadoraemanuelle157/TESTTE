const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const controller = require('../controllers/privacidadeAtividadeController')

router.get('/atividade/opcoes', authMiddleware, controller.listarOpcoes)
router.get('/atividade', authMiddleware, controller.listarRestricoes)
router.post('/atividade', authMiddleware, controller.salvarRestricao)
router.put('/atividade/lote', authMiddleware, controller.salvarEmLote)
router.delete('/atividade/:usuarioBloqueadoId', authMiddleware, controller.removerRestricao)

module.exports = router
