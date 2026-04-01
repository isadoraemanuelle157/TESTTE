const express = require('express')
const router = express.Router()
const controller = require('../controllers/playlistController')

// CRUD
router.post('/', controller.create)
router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

// MÚSICAS
router.post('/:id/musicas/:musicaId', controller.addMusica)
router.delete('/:id/musicas/:musicaId', controller.removeMusica)

// FAVORITAR
router.post('/:id/favoritar', controller.toggleFavorita)

module.exports = router