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

// Rotas públicas (sem auth)
router.get('/:id/seguidores/publicos', async (req, res) => {
  try {
    const seguidores = await followService.getSeguidoresPublicos(req.params.id)
    res.json(seguidores.map(f => ({
      id: f.seguidor_id?._id || f.seguidor_id,
      nome: f.seguidor_id?.nome || 'Usuário',
      username: f.seguidor_id?.username || '',
      avatar: f.seguidor_id?.avatar || 'https://via.placeholder.com/150'
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id/seguindo/publicos', async (req, res) => {
  try {
    const seguindo = await followService.getSeguindoPublicos(req.params.id)
    res.json(seguindo.map(f => ({
      id: f.seguindo_id?._id || f.seguindo_id,
      nome: f.seguindo_id?.nome || 'Usuário',
      username: f.seguindo_id?.username || '',
      avatar: f.seguindo_id?.avatar || f.seguindo_id?.foto || 'https://via.placeholder.com/150'
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router