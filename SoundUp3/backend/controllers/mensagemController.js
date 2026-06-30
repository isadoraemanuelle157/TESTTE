const mensagemService = require('../services/mensagemService');
const Conversa = require('../models/Conversa');
const Mensagem = require('../models/Mensagem');

// POST /mensagens/enviar
const enviar = async (req, res) => {
  try {
    const { destinatarioId, tipo, conteudo, texto, metadata } = req.body;
    const remetenteId = req.user.id;
    
    // Validações
    if (!destinatarioId) {
      return res.status(400).json({ error: 'destinatarioId é obrigatório' });
    }
    if (!conteudo || conteudo.trim() === '') {
      return res.status(400).json({ error: 'conteudo é obrigatório' });
    }
    if (String(remetenteId) === String(destinatarioId)) {
      return res.status(400).json({ error: 'Não pode enviar mensagem para si mesmo' });
    }
    
 const mensagem = await mensagemService.enviarMensagem(
  remetenteId,
  destinatarioId,
  { 
    tipo: tipo || 'texto', 
    conteudo, 
    texto, 
    metadata,
    respostaA: req.body.respostaA  // ← ADICIONAR
  }
);
    
    res.status(201).json(mensagem);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    // ✅ Retornar 403 para bloqueio, 500 para outros erros
    const status = error.message.includes('bloqueou') ? 403 : 500;
    res.status(status).json({ error: error.message });
  }
};

// GET /mensagens/conversas
const listarConversas = async (req, res) => {
  try {
    const conversas = await mensagemService.listarConversas(req.user.id);
    res.json(conversas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mensagens/:conversaId
const listarMensagens = async (req, res) => {
  try {
    const { conversaId } = req.params;
    const { pagina = 1 } = req.query;
    
    const mensagens = await mensagemService.listarMensagens(
      conversaId,
      req.user.id,
      parseInt(pagina)
    );
    
    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mensagens/nao-lidas/total
const contarNaoLidas = async (req, res) => {
  try {
    const total = await mensagemService.contarNaoLidas(req.user.id);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /mensagens/denunciar
const denunciar = async (req, res) => {
  try {
    const { usuarioId, motivo, categoria, conversaId } = req.body;
    const denuncianteId = req.user.id;
    
    // ✅ Salvar no banco de dados
    const Denuncia = require('../models/Denuncia');
    
    await Denuncia.create({
      denunciante: denuncianteId,
      denunciado: usuarioId,
      chat: conversaId || null,
      motivo: motivo,
      categoria: categoria || 'outro',
      status: 'pendente'
    });
    
    console.log(`🚨 Denúncia: ${denuncianteId} denunciou ${usuarioId} - Motivo: ${motivo}`);
    
    res.json({ message: 'Denúncia registrada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /mensagens/silenciar
const silenciarChat = async (req, res) => {
  try {
    const { conversaId } = req.body;
    const usuarioId = req.user.id;
    
    // Implementar com model ChatSilenciado que você já tem
    const ChatSilenciado = require('../models/ChatSilenciado');
    
    await ChatSilenciado.findOneAndUpdate(
      { chat: conversaId, usuario: usuarioId },
      { chat: conversaId, usuario: usuarioId },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Chat silenciado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /mensagens/silenciar/:conversaId
const desilenciarChat = async (req, res) => {
  try {
    const { conversaId } = req.params;
    const usuarioId = req.user.id;
    
    const ChatSilenciado = require('../models/ChatSilenciado');
    await ChatSilenciado.deleteOne({ chat: conversaId, usuario: usuarioId });
    
    res.json({ message: 'Notificações ativadas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /mensagens/conversa/:conversaId
const apagarConversa = async (req, res) => {
  try {
    const { conversaId } = req.params;
    const usuarioId = req.user.id;
    
    // Soft delete - marca como apagada para o usuário
    await Conversa.findByIdAndUpdate(conversaId, {
      $addToSet: { apagadaPara: usuarioId }
    });
    
    // Limpar mensagens não lidas para o usuário que apagou
    await Conversa.updateOne(
      { _id: conversaId },
      { $set: { 'naoLidas.$[elem].quantidade': 0 } },
      { arrayFilters: [{ 'elem.usuario': usuarioId }] }
    );
    
    res.json({ message: 'Conversa apagada para você' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mensagens/usuario/:userId/status
const verificarStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const Usuario = require('../models/Usuario');
    
    const usuario = await Usuario.findById(userId).select('ultimaAtividade');
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const ultimaAtividade = new Date(usuario.ultimaAtividade);
    const agora = new Date();
    const diffMinutos = (agora - ultimaAtividade) / 1000 / 60;
    
    // Online se ativo nos últimos 2 minutos
    const online = diffMinutos < 2;
    
    res.json({ 
      online, 
      ultimaAtividade: usuario.ultimaAtividade,
      ultimaVez: diffMinutos < 1 ? 'Agora' : 
                  diffMinutos < 60 ? `${Math.floor(diffMinutos)}min` :
                  `${Math.floor(diffMinutos/60)}h`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /mensagens/bloquear
const bloquearUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    const bloqueadorId = req.user.id;
    
    const Bloqueio = require('../models/Bloqueio');
    
    await Bloqueio.findOneAndUpdate(
      { bloqueador: bloqueadorId, bloqueado: usuarioId },
      { bloqueador: bloqueadorId, bloqueado: usuarioId },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Usuário bloqueado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /mensagens/bloquear/:usuarioId
const desbloquearUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const bloqueadorId = req.user.id;
    
    const Bloqueio = require('../models/Bloqueio');
    await Bloqueio.deleteOne({ bloqueador: bloqueadorId, bloqueado: usuarioId });
    
    res.json({ message: 'Usuário desbloqueado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mensagens/bloqueio/:usuarioId
const verificarBloqueio = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const meuId = req.user.id;
    
    const Bloqueio = require('../models/Bloqueio');
    
    // Verificar se EU bloqueei ELE
    const euBloqueei = await Bloqueio.findOne({
      bloqueador: meuId,
      bloqueado: usuarioId
    });
    
    // Verificar se ELE bloqueou EU
    const eleBloqueou = await Bloqueio.findOne({
      bloqueador: usuarioId,
      bloqueado: meuId
    });
    
    if (euBloqueei) {
      return res.json({ bloqueado: true, bloqueadoPor: 'eu' });
    }
    if (eleBloqueou) {
      return res.json({ bloqueado: true, bloqueadoPor: 'ele' });
    }
    
    res.json({ bloqueado: false, bloqueadoPor: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mensagens/silenciar/:conversaId
const verificarSilencio = async (req, res) => {
  try {
    const { conversaId } = req.params;
    const usuarioId = req.user.id;
    
    const ChatSilenciado = require('../models/ChatSilenciado');
    const silenciado = await ChatSilenciado.findOne({
      chat: conversaId,
      usuario: usuarioId
    });
    
    res.json({ silenciado: !!silenciado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADICIONAR ESTE CONTROLLER
const limparConversa = async (req, res) => {
  try {
    const { conversaId } = req.params;
    const usuarioId = req.user.id;
    
    // Validar ObjectId
    if (!conversaId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de conversa inválido' });
    }
    
    // Verificar se conversa existe e usuário é participante
    const conversa = await Conversa.findOne({
      _id: conversaId,
      participantes: usuarioId
    });
    
    if (!conversa) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    // Apagar mensagens da conversa (físico)
    await Mensagem.deleteMany({ conversa: conversaId });
    
    // Resetar última mensagem e atividade da conversa
    await Conversa.findByIdAndUpdate(conversaId, {
      ultimaMensagem: null,
      ultimaAtividade: new Date()
    });
    
    res.json({ message: 'Conversa limpa' });
  } catch (error) {
    console.error('Erro ao limpar conversa:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  enviar,
  listarConversas,
  listarMensagens,
  contarNaoLidas,
  denunciar,
  silenciarChat,
  desilenciarChat,
  apagarConversa,
  limparConversa, 
  verificarStatus,
  bloquearUsuario,      // ← ADICIONAR
  desbloquearUsuario,
  verificarBloqueio,    // ✅ ADICIONAR
  verificarSilencio   // ← ADICIONAR
};