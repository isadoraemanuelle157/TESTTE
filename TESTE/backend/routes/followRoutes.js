const express = require('express')
const router = express.Router()

const followController = require('../controllers/followController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/seguir', authMiddleware, followController.seguir)
router.get('/seguindo/:id', followController.seguindoPorId)
router.delete('/desseguir', authMiddleware, followController.desseguir)

router.get('/seguidores/:id', followController.seguidores)
router.get('/usuario/seguindo', authMiddleware, followController.seguindo)
router.get('/verificar', authMiddleware, followController.verificar)

router.post('/aceitar', authMiddleware, followController.aceitarSolicitacao)

module.exports = router
