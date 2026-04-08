const express = require('express')
const router = express.Router()
const controller = require('../controllers/playlistController')
const authMiddleware = require('../middleware/authMiddleware')

// ✅ SEM repetir /playlists
router.get('/', authMiddleware, controller.getAll)
router.post('/', authMiddleware, controller.create)

router.post('/:id/musicas/:musicaId', authMiddleware, controller.addMusica)
router.delete('/:id/musicas/:musicaId', authMiddleware, controller.removeMusica)

router.post('/:id/favoritar', authMiddleware, controller.toggleFavorita)

router.put('/:id', authMiddleware, controller.update)
router.delete('/:id', authMiddleware, controller.remove)

module.exports = router
