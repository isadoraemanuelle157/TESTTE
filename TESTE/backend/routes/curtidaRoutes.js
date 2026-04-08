const express = require('express')
const router = express.Router()
const controller = require('../controllers/curtidaController')
const authMiddleware = require('../middleware/authMiddleware')


// 🔥 listar playlists curtidas do usuário
router.post('/:id', authMiddleware, controller.toggle)
router.get('/', authMiddleware, controller.getMinhasCurtidas)

module.exports = router
