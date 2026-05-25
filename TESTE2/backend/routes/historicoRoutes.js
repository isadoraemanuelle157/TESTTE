const express = require('express')
const router = express.Router()
const { requireAuth, optionalAuth } = require('../middleware/auth') // ← MUDAR
const controller = require('../controllers/historicoController')

// ============================================
// 📜 HISTÓRICO — REQUER LOGIN (Spotify/Banco)
// ============================================

// Listar histórico — SÓ COM LOGIN
router.get('/', requireAuth, controller.getHistorico)

// Adicionar ao histórico — COM LOGIN (silencioso se deslogado)
router.post('/', optionalAuth, controller.addHistorico) // ← MUDAR: optionalAuth

// Limpar histórico — SÓ COM LOGIN
router.delete('/', requireAuth, controller.clearHistorico)

module.exports = router