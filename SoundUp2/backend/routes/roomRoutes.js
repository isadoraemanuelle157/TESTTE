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

// ========== ROTAS DE LISTENERS (apenas 1 vez!) ==========
router.post('/:id/listeners', optionalAuth, roomController.adicionarListener)
router.get('/:id/listeners', roomController.listarListeners)
router.delete('/:id/listeners', optionalAuth, roomController.removerListener)

// ✅ ROTA BEACON — usa optionalAuth para ter req.user disponível
router.post('/:id/listeners/beacon', optionalAuth, roomController.removerListenerBeacon)

// ========== ROTAS DE SINCRONIZAÇÃO E FILA ==========
router.post('/:id/sync', optionalAuth, roomController.sincronizarReproducao)
router.get('/:id/sync', roomController.obterSyncState)
router.post('/:id/queue', optionalAuth, roomController.adicionarNaFila)
router.get('/:id/queue', roomController.listarFila)
router.delete('/:id/queue', optionalAuth, roomController.removerDaFila)
router.post('/:id/queue/next', optionalAuth, roomController.proximaMusica)
router.post('/:id/track', optionalAuth, roomController.atualizarTrack)
router.get('/:id/track', roomController.obterTrackAtual)

// ================================================
router.get('/:id', roomController.buscarPorId)
router.post('/:id/join', optionalAuth, roomController.entrar)
router.get('/:id/acesso', optionalAuth, roomController.verificarAcesso)

router.put('/:id', requireAuth, roomController.atualizar)
router.delete('/:id', requireAuth, roomController.deletar)

// ========== MENSAGENS ==========
router.post('/:id/messages', roomController.enviarMensagem)
router.get('/:id/messages', roomController.listarMensagens)

module.exports = router