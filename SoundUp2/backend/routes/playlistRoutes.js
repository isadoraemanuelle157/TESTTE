const express = require('express')
const router = express.Router()
const controller = require('../controllers/playlistController')
const { requireAuth } = require('../middleware/auth')

// CRUD básico
router.get('/', requireAuth, controller.getAll)
router.post('/', requireAuth, controller.create)
router.get('/:id', requireAuth, controller.getById)
router.put('/:id', requireAuth, controller.update)
router.delete('/:id', requireAuth, controller.remove)

// músicas
router.post('/:id/musicas/:musicaId', requireAuth, controller.addMusica)
router.delete('/:id/musicas/:musicaId', requireAuth, controller.removeMusica)

// favoritar
router.post('/:id/favoritar', requireAuth, controller.toggleFavorita)

module.exports = router