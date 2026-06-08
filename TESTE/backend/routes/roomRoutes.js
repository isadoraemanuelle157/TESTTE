const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')
const { requireAuth, optionalAuth } = require('../middleware/auth')

router.get('/publicas', roomController.listarPublicas)
router.get('/todas', optionalAuth, roomController.listarTodas)

router.post('/', requireAuth, roomController.criar)
router.get('/my', requireAuth, roomController.listarMinhas)
router.post('/invite', requireAuth, roomController.convidar)

// ========== NOVAS ROTAS DE PERMISSÕES ==========
router.get('/:id/role', optionalAuth, roomController.getUserRole)
router.get('/:id/permissao/:acao', requireAuth, roomController.verificarPermissao)
router.post('/:id/moderadores', requireAuth, roomController.adicionarModerador)
router.delete('/:id/moderadores', requireAuth, roomController.removerModerador)
router.put('/:id/permissoes', requireAuth, roomController.atualizarPermissoes)
// ========== ROTAS DE LISTENERS ==========
router.post('/:id/listeners', optionalAuth, roomController.adicionarListener)
router.get('/:id/listeners', roomController.listarListeners)
router.delete('/:id/listeners', requireAuth, roomController.removerListener)
// ======================================
// ================================================

router.get('/:id', roomController.buscarPorId)
router.post('/:id/join', optionalAuth, roomController.entrar)
router.get('/:id/acesso', optionalAuth, roomController.verificarAcesso)

router.put('/:id', requireAuth, roomController.atualizar)
router.delete('/:id', requireAuth, roomController.deletar)
router.post('/:id/track', requireAuth, roomController.atualizarTrack)
router.post('/:id/queue', requireAuth, roomController.adicionarNaFila)
router.post('/:id/messages', roomController.enviarMensagem)

module.exports = router