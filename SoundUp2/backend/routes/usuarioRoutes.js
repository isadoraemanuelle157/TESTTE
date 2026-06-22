const express = require('express')
const router = express.Router()

const userController = require('../controllers/usuarioController')
const { requireAuth } = require('../middleware/auth')  // ← ÚNICA importação de auth

// AUTH (público — sem auth)
router.post('/registrar', userController.create)
router.post('/login', userController.login)

// 🔥 RECUPERAR SENHA (público — sem auth)
router.put('/recuperar-senha', userController.recuperarSenha)
router.get('/verificar-email', userController.verificarEmail)

router.get('/buscar', userController.buscarPorNome)
// SEARCH
router.get('/search', requireAuth, userController.search)

// 🎯 FEITO PARA VOCÊ - Mixes Personalizados
router.get('/:id/mixes', requireAuth, userController.getMixes)
router.get('/:id/recomendacoes', requireAuth, userController.getRecomendacoes)

// DADOS PÚBLICOS / CONTROLADOS
router.get('/:id/playlists/publicas', requireAuth, userController.getPublicPlaylists)
router.get('/:id/curtidas/publicas', requireAuth, userController.getPublicCurtidas)
router.get('/:id/estatisticas', requireAuth, userController.getEstatisticas)

router.get('/:id/seguidores/publicos', requireAuth, userController.getPublicSeguidores)
router.get('/:id/seguindo/publicos', requireAuth, userController.getPublicSeguindo)

router.get('/:id/bloqueio-status', requireAuth, userController.getBlockStatus)
router.post('/:id/bloquear', requireAuth, userController.blockUser)
router.delete('/:id/bloquear', requireAuth, userController.unblockUser)

router.post('/:id/denunciar', requireAuth, userController.reportUser)

// CRUD
router.get('/', requireAuth, userController.list)
router.get('/:id', requireAuth, userController.getById)
router.put('/:id', requireAuth, userController.update)
router.delete('/:id', requireAuth, userController.remove)

// Seguir um usuário
router.post('/:id/seguir', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const followerId = req.user.id
    
    if (String(id) === String(followerId)) {
      return res.status(400).json({ error: 'Não pode seguir a si mesmo' })
    }
    
    const Follow = require('../models/Follow')
    
    // Verificar se já segue
    const existing = await Follow.findOne({
      seguidor_id: followerId,
      seguindo_id: id,
      tipo: 'usuario'
    })
    
    if (existing) {
      return res.status(400).json({ error: 'Você já segue este usuário' })
    }
    
    await Follow.create({
      seguidor_id: followerId,
      seguindo_id: id,
      tipo: 'usuario'
    })
    
    res.json({ message: 'Seguindo com sucesso', isFollowing: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Deixar de seguir
router.delete('/:id/seguir', requireAuth, async (req, res) => {
  try {
    const Follow = require('../models/Follow')
    await Follow.deleteOne({
      seguidor_id: req.user.id,
      seguindo_id: req.params.id,
      tipo: 'usuario'
    })
    res.json({ message: 'Deixou de seguir', isFollowing: false })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verificar se segue (usado pelo RoomEntryView)
router.get('/:id/seguidores/verificar', requireAuth, async (req, res) => {
  try {
    const Follow = require('../models/Follow')
    const follow = await Follow.findOne({
      seguidor_id: req.user.id,
      seguindo_id: req.params.id,
      tipo: 'usuario'
    })
    res.json({ isFollowing: !!follow })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router