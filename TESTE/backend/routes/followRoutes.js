const express = require('express')
const router = express.Router()

const followController = require('../controllers/followController')
const auth = require('../middleware/authMiddleware')

// 🔥 PROTEGIDAS
router.post('/seguir', auth, followController.seguir)
router.get('/seguindo/:id', followController.seguindoPorId)
router.delete('/desseguir', auth, followController.desseguir)

router.get('/seguidores/:id', followController.seguidores)
router.get('/usuario/seguindo', auth, followController.seguindo)
router.get('/verificar', auth, followController.verificar)

module.exports = router