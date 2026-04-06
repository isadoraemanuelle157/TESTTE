const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')

const favoritaController = require('../controllers/favoritaController')

// ⭐ FAVORITAS
router.post('/:id/favoritar', auth, favoritaController.toggle)
router.get('/', auth, favoritaController.getMinhasFavoritas)

module.exports = router
