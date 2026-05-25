const express = require('express')
const router = express.Router()

const followController = require('../controllers/followController')
const { requireAuth } = require('../middleware/auth')  // ← já importa aqui

// ❌ MUDAR DE:
// router.post('/seguir', authMiddleware, followController.seguir)
// ✅ PARA:
router.post('/seguir', requireAuth, followController.seguir)

// ❌ MUDAR DE:
// router.delete('/desseguir', authMiddleware, followController.desseguir)
// ✅ PARA:
router.delete('/desseguir', requireAuth, followController.desseguir)

router.get('/seguindo/:id', followController.seguindoPorId)
router.get('/seguidores/:id', followController.seguidores)

// ❌ MUDAR DE:
// router.get('/usuario/seguindo', authMiddleware, followController.seguindo)
// ✅ PARA:
router.get('/usuario/seguindo', requireAuth, followController.seguindo)

// ❌ MUDAR DE:
// router.get('/verificar', authMiddleware, followController.verificar)
// ✅ PARA:
router.get('/verificar', requireAuth, followController.verificar)

// ❌ MUDAR DE:
// router.post('/aceitar', authMiddleware, followController.aceitarSolicitacao)
// ✅ PARA:
router.post('/aceitar', requireAuth, followController.aceitarSolicitacao)

module.exports = router