const express = require('express')
const router = express.Router()
const { requireAuth, optionalAuth } = require('../middleware/auth') // ← MUDAR
const favoritaController = require('../controllers/favoritaController')

// ============================================
// ⭐ FAVORITAS — REQUER LOGIN (Spotify/Banco)
// ============================================

// Toggle favoritar — SÓ COM LOGIN
router.post('/:id/favoritar', requireAuth, favoritaController.toggle)

// Listar minhas favoritas — SÓ COM LOGIN
router.get('/', requireAuth, favoritaController.getMinhasFavoritas)

// Verificar se item está favoritado — COM LOGIN (retorna false se deslogado)
router.get('/:id/is-favorita', optionalAuth, favoritaController.isFavorita) // ← ADICIONAR

module.exports = router