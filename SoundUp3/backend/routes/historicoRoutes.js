const express = require('express')
const router = express.Router()
const { requireAuth, optionalAuth } = require('../middleware/auth')
const controller = require('../controllers/historicoController')

// ============================================
// 📜 HISTÓRICO DE BUSCAS
// ============================================

router.get('/', requireAuth, controller.getHistorico)
router.post('/', optionalAuth, controller.addHistorico)
router.delete('/', requireAuth, controller.clearHistorico)

// ============================================
// 🎵 HISTÓRICO DE REPRODUÇÕES (novo)
// ============================================

router.get('/reproducao', requireAuth, controller.getReproducoes)
router.post('/reproducao', optionalAuth, controller.addReproducao)
router.delete('/reproducao', requireAuth, controller.clearReproducoes)
router.delete('/reproducao/:id', requireAuth, controller.deleteReproducao) 

// ============================================
// 📊 ESTATÍSTICAS MENSAIS
// ============================================

router.get('/estatisticas/mensal', requireAuth, controller.getEstatisticasMensais)
// ============================================
// 🔥 SEQUÊNCIA (STREAK)
// ============================================

router.get('/estatisticas/sequencia', requireAuth, controller.getSequencia)
module.exports = router