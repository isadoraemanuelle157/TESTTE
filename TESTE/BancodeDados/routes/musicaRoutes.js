const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const musicaController = require('../controllers/musicaController')
const curtidaController = require('../controllers/curtidaController')

// 🔥 BUSCA (ANTES do :id)
router.get('/search', musicaController.search)

// CRUD
router.post('/', musicaController.create)
router.get('/', musicaController.list)
router.get('/:id', musicaController.getById)
router.put('/:id', musicaController.update)
router.delete('/:id', musicaController.remove)
router.post('/:id/curtir', authMiddleware, curtidaController.toggle)

module.exports = router