const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')
const { requireAuth } = require('../middleware/auth')

// ✅ Rota pública: listar salas públicas
router.get('/publicas', roomController.listarPublicas)

// ✅ Rotas autenticadas
router.post('/', requireAuth, roomController.criar)
router.get('/my', requireAuth, roomController.listarMinhas)
router.get('/:id', roomController.buscarPorId)
router.put('/:id', requireAuth, roomController.atualizar)
router.delete('/:id', requireAuth, roomController.deletar)
router.post('/invite', requireAuth, roomController.convidar)
router.get('/:id/acesso', roomController.verificarAcesso)
router.post('/:id/track', requireAuth, roomController.atualizarTrack)
router.post('/:id/queue', requireAuth, roomController.adicionarNaFila)
router.post('/:id/messages', roomController.enviarMensagem)

module.exports = router