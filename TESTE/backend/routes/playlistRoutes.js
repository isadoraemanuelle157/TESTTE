const express = require('express')
const router = express.Router()
const controller = require('../controllers/playlistController')
const authMiddleware = require('../middleware/authMiddleware')

// CRUD básico
router.get('/', authMiddleware, controller.getAll)
router.post('/', authMiddleware, controller.create)
router.get('/:id', authMiddleware, controller.getById)
router.put('/:id', authMiddleware, controller.update)
router.delete('/:id', authMiddleware, controller.remove)

// Músicas na playlist - POST e DELETE com body para source/dadosMusica
router.post('/:id/musicas/:musicaId', authMiddleware, controller.addMusica)
router.delete('/:id/musicas/:musicaId', authMiddleware, controller.removeMusica)

// Favoritar
router.post('/:id/favoritar', authMiddleware, controller.toggleFavorita)

module.exports = router