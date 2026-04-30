const express = require('express')
const router = express.Router()
const controller = require('../controllers/curtidaController')
const authMiddleware = require('../middleware/authMiddleware')

// Toggle curtida (local ou externa) - POST com body { source, dadosMusica }
router.post('/:id', authMiddleware, controller.toggle)

// Verificar se música está curtida (query: ?source=spotify)
router.get('/:id/is-curtida', authMiddleware, controller.isCurtida)

// Listar minhas curtidas (locais + externas)
router.get('/', authMiddleware, controller.getMinhasCurtidas)

// Listar curtidas públicas de um usuário
router.get('/usuario/:id', authMiddleware, controller.listarCurtidasPublicas)

module.exports = router