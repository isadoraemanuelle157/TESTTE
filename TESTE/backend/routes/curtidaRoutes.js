const express = require('express')
const router = express.Router()
const controller = require('../controllers/curtidaController')
const authMiddleware = require('../middleware/authMiddleware')


// 🔥 listar playlists curtidas do usuário
router.get('/', authMiddleware, controller.getMinhasCurtidas)

module.exports = router
