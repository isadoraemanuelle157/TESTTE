const express = require('express')
const router = express.Router()

const followController = require('../controllers/followController')
const auth = require('../middleware/authMiddleware')

// 🔥 PROTEGIDAS
router.post('/seguir', auth, followController.seguir)
router.delete('/desseguir', auth, followController.desseguir)

router.get('/usuario/seguindo', auth, followController.seguindo)
router.get('/verificar', auth, followController.verificar)

// 🔓 PÚBLICAS
router.get('/cantor/:id/seguidores', followController.seguidores)
router.get('/cantor/:id/total', followController.total)

module.exports = router