const express = require('express')
const router = express.Router()

const userController = require('../controllers/usuarioController')

// AUTH
router.post('/registrar', userController.create)
router.post('/login', userController.login)

// CRUD
router.get('/', userController.list)
router.get('/:id', userController.getById)
router.put('/:id', userController.update)   // 👈 EDITAR
router.delete('/:id', userController.remove)

module.exports = router