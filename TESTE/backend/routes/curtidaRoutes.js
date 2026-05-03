const express = require('express')
const router = express.Router()
const controller = require('../controllers/curtidaController')
const authMiddleware = require('../middleware/authMiddleware')

// Toggle curtida (local ou externa) - POST /curtidas/:id
// Body para externas: { source: "deezer", dadosMusica: {...} }
// Body para locais: {} ou { source: "local" }
router.post('/:id', authMiddleware, controller.toggle)

// Verificar se música está curtida
// Query para externas: ?source=deezer
// Query para locais: nada ou ?source=local
router.get('/:id/is-curtida', authMiddleware, controller.isCurtida)

// Listar minhas curtidas (locais + externas)
router.get('/', authMiddleware, controller.getMinhasCurtidas)

// Listar curtidas públicas de um usuário
router.get('/usuario/:id', authMiddleware, controller.listarCurtidasPublicas)

module.exports = router