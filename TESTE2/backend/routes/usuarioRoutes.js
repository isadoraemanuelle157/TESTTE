const express = require('express')
const router = express.Router()

const userController = require('../controllers/usuarioController')
const authMiddleware = require('../middleware/authMiddleware')
// AUTH
router.post('/registrar', userController.create)
router.post('/login', userController.login)

// CRUD
router.get('/', userController.list)
router.get('/search', userController.search) // ← ADICIONAR AQUI (antes do /:id)
router.get('/:id', userController.getById)
router.put('/:id', userController.update)   // 👈 EDITAR
router.delete('/:id', userController.remove)

module.exports = router