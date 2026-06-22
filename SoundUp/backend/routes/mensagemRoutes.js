const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const mensagemController = require('../controllers/mensagemController');

// Enviar mensagem
router.post('/enviar', requireAuth, mensagemController.enviar);

// Listar conversas
router.get('/conversas', requireAuth, mensagemController.listarConversas);

// Listar mensagens
router.get('/:conversaId', requireAuth, mensagemController.listarMensagens);

// Total não lidas
router.get('/nao-lidas/total', requireAuth, mensagemController.contarNaoLidas);

// ✅ NOVAS ROTAS:
// Denunciar usuário
router.post('/denunciar', requireAuth, mensagemController.denunciar);

// ✅ VERIFICAÇÃO DE ESTADO (novas rotas)
router.get('/bloqueio/:usuarioId', requireAuth, mensagemController.verificarBloqueio);
router.get('/silenciar/:conversaId', requireAuth, mensagemController.verificarSilencio);

// Silenciar chat
router.post('/silenciar', requireAuth, mensagemController.silenciarChat);
router.delete('/silenciar/:conversaId', requireAuth, mensagemController.desilenciarChat);

// Apagar conversa (limpar mensagens para o usuário)
router.delete('/conversa/:conversaId', requireAuth, mensagemController.apagarConversa);

// Status do usuário
router.get('/usuario/:userId/status', requireAuth, mensagemController.verificarStatus);

// Bloquear usuário
router.post('/bloquear', requireAuth, mensagemController.bloquearUsuario);
router.delete('/bloquear/:usuarioId', requireAuth, mensagemController.desbloquearUsuario);

// ✅ ADICIONAR ESTA ROTA
router.delete('/conversa/:conversaId/limpar', requireAuth, mensagemController.limparConversa);

module.exports = router;