const express = require('express')
const router = express.Router()

const userController = require('../controllers/usuarioController')
const authMiddleware = require('../middleware/authMiddleware')

// AUTH
router.post('/registrar', userController.create)
router.post('/login', userController.login)

// 🔥 RECUPERAR SENHA
router.put('/recuperar-senha', userController.recuperarSenha)

// SEARCH
router.get('/search', authMiddleware, userController.search)

// 🎯 FEITO PARA VOCÊ - Mixes Personalizados
router.get('/:id/mixes', authMiddleware, userController.getMixes)

// DADOS PÚBLICOS / CONTROLADOS
router.get('/:id/playlists/publicas', authMiddleware, userController.getPublicPlaylists)
router.get('/:id/curtidas/publicas', authMiddleware, userController.getPublicCurtidas)
router.get('/:id/estatisticas', authMiddleware, userController.getEstatisticas)

// CRUD
router.get('/', authMiddleware, userController.list)
router.get('/:id', authMiddleware, userController.getById)
router.put('/:id', authMiddleware, userController.update)
router.delete('/:id', authMiddleware, userController.remove)

module.exports = router 
