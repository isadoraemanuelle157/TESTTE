const express = require('express')
const router = express.Router()
const controller = require('../controllers/curtidaController')
const { optionalAuth, requireAuth } = require('../middleware/auth') // ← MUDAR: importar ambos

// ============================================
// ❤️ CURTIDAS — REQUER LOGIN (Spotify/Banco)
// ============================================

// Toggle curtida — SÓ COM LOGIN
router.post('/:id', requireAuth, controller.toggle)
// Listar curtidas públicas de um usuário — PÚBLICO (sem auth)
router.get('/usuario/:id', controller.listarCurtidasPublicas)
// Verificar se está curtida — COM LOGIN (retorna false se deslogado)
router.get('/:id/is-curtida', optionalAuth, controller.isCurtida)

// Listar minhas curtidas — SÓ COM LOGIN
router.get('/', requireAuth, controller.getMinhasCurtidas)

module.exports = router