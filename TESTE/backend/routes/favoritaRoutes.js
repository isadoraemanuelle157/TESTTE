const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const favoritaController = require('../controllers/favoritaController')

// ⭐ FAVORITAS
// Body: { tipo: 'album'|'cantor'|'musica'|'playlist', source: 'local'|'deezer', dadosItem: {...} }
router.post('/:id/favoritar', auth, favoritaController.toggle)

// Listar minhas favoritas (locais + externas formatadas)
router.get('/', auth, favoritaController.getMinhasFavoritas)

module.exports = router