const express = require('express')
const router = express.Router()

const userController = require('../controllers/usuarioController')
const { requireAuth } = require('../middleware/auth')  // ← ÚNICA importação de auth

// AUTH (público — sem auth)
router.post('/registrar', userController.create)
router.post('/login', userController.login)

// 🔥 RECUPERAR SENHA (público — sem auth)
router.put('/recuperar-senha', userController.recuperarSenha)

// SEARCH
router.get('/search', requireAuth, userController.search)

// 🎯 FEITO PARA VOCÊ - Mixes Personalizados
router.get('/:id/mixes', requireAuth, userController.getMixes)

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

module.exports = router