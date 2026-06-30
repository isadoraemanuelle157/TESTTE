// ============================================
// favoritaRoutes.js — AJUSTADO E COMPLETO
// ============================================

const express = require('express')
const router = express.Router()
const { requireAuth, optionalAuth } = require('../middleware/auth')
const favoritaController = require('../controllers/favoritaController')

// ============================================
// ⭐ ROTAS PROTEGIDAS (requer login)
// ============================================

// Toggle favoritar/descurtir — SÓ COM LOGIN
// POST /favoritas/:id/favoritar
router.post('/:id/favoritar', requireAuth, favoritaController.toggle)

// Listar minhas favoritas — SÓ COM LOGIN
// GET /favoritas/
router.get('/', requireAuth, favoritaController.getMinhasFavoritas)

// ============================================
// 🔍 ROTA PÚBLICA (opcional, para verificar estado)
// ============================================

// Verificar se item está favoritado — funciona logado ou não
// GET /favoritas/:id/is-favorita?tipo=musica&source=spotify
router.get('/:id/is-favorita', optionalAuth, favoritaController.isFavorita)

module.exports = router