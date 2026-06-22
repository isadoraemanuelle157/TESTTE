const Mensagem = require('../models/Mensagem');
const Conversa = require('../models/Conversa');
const ChatSilenciado = require('../models/ChatSilenciado');
 const Bloqueio = require('../models/Bloqueio');
const Notificacao = require('../models/Notificacao');
const mongoose = require('mongoose');

// Buscar ou criar conversa entre 2 usuários
const getOrCreateConversa = async (userId1, userId2) => {
  const conversa = await Conversa.findOne({
    participantes: { $all: [userId1, userId2] }
  });
  
  if (conversa) return conversa;
  
  const novaConversa = new Conversa({
    participantes: [userId1, userId2],
    naoLidas: [
      { usuario: userId1, quantidade: 0 },
      { usuario: userId2, quantidade: 0 }
    ]
  });
  
  return await novaConversa.save();
};

// Enviar mensagem
const enviarMensagem = async (remetenteId, destinatarioId, dados) => {
    const bloqueado = await Bloqueio.findOne({
    $or: [
      { bloqueador: remetenteId, bloqueado: destinatarioId },
      { bloqueador: destinatarioId, bloqueado: remetenteId }
    ]
  });
  
  if (bloqueado) {
    const quemBloqueou = String(bloqueado.bloqueador) === String(remetenteId) 
      ? 'você bloqueou' 
      : 'você foi bloqueado';
    throw new Error(`Não é possível enviar mensagem. ${quemBloqueou} este usuário.`);
  }
  const conversa = await getOrCreateConversa(remetenteId, destinatarioId);
  
  const mensagem = new Mensagem({
    conversa: conversa._id,
    remetente: remetenteId,
    destinatario: destinatarioId,
    tipo: dados.tipo || 'texto',
    conteudo: dados.conteudo,
    texto: dados.texto || dados.conteudo,
    metadata: dados.metadata || {},
    lida: false,
    respostaA: dados.respostaA || null  // ← ADICIONAR
  });
  
  await mensagem.save();
  
  // ← ADICIONAR: Popular a referência antes de retornar
  if (dados.respostaA) {
    await mensagem.populate('respostaA');
  }
  
  // Atualizar conversa
  conversa.ultimaMensagem = mensagem._id;
  conversa.ultimaAtividade = new Date();
  
  // Incrementar não lidas para destinatário
  const naoLidaIndex = conversa.naoLidas.findIndex(
    n => String(n.usuario) === String(destinatarioId)
  );
  if (naoLidaIndex >= 0) {
    conversa.naoLidas[naoLidaIndex].quantidade += 1;
  }
  
  await conversa.save();
  
const silenciado = await ChatSilenciado.findOne({ 
  chat: conversa._id, 
  usuario: destinatarioId 
});

// Só cria notificação se NÃO estiver silenciado
// Só cria notificação se NÃO estiver silenciado
if (!silenciado) {
  // Buscar nome do remetente para a notificação
  const Usuario = require('../models/Usuario');
  const remetente = await Usuario.findById(remetenteId).select('nome avatar');
  
  await Notificacao.create({
    usuarioDestino: destinatarioId,
    usuarioOrigem: remetenteId,
    tipo: 'nova_mensagem',
    mensagem: `Nova mensagem de ${remetente?.nome || 'Alguém'}`,  // ← ✅ Nome correto
    meta: { 
      conversaId: conversa._id,
      mensagemId: mensagem._id,
      remetenteNome: remetente?.nome  // ← ✅ Nome correto
    }
  });
}

// Popular e retornar
return await Mensagem.findById(mensagem._id)
  .populate('remetente', 'nome username avatar')
  .populate('destinatario', 'nome username avatar')
  .populate({
    path: 'respostaA',
    populate: { path: 'remetente', select: 'nome username avatar' }
  });
};

// Listar conversas do usuário (estilo Instagram DM inbox)
const listarConversas = async (userId) => {
  const conversas = await Conversa.find({
    participantes: userId,
   apagadaPara: { $nin: [userId] } 
  })
  .populate('participantes', 'nome username avatar avatarDourado perfilPrivado')
  .populate({
    path: 'ultimaMensagem',
    populate: { path: 'remetente', select: 'nome username avatar' }
  })
  .sort({ ultimaAtividade: -1 });
  
  return conversas.map(conv => {
    const outroParticipante = conv.participantes.find(
      p => String(p._id) !== String(userId)
    );
    const minhasNaoLidas = conv.naoLidas.find(
      n => String(n.usuario) === String(userId)
    );
    
    return {
      id: conv._id,
      participante: outroParticipante,
      ultimaMensagem: conv.ultimaMensagem,
      naoLidas: minhasNaoLidas?.quantidade || 0,
      ultimaAtividade: conv.ultimaAtividade,
      bloqueado: conv.bloqueado || false
    };
  });
};

// Listar mensagens de uma conversa
const listarMensagens = async (conversaId, userId, pagina = 1, limite = 50) => {
  const conversa = await Conversa.findOne({
    _id: conversaId,
    participantes: userId
  });
  
  if (!conversa) throw new Error('Conversa não encontrada');
  
  const skip = (pagina - 1) * limite;
  
const mensagens = await Mensagem.find({ conversa: conversaId })
  .populate('remetente', 'nome username avatar')
  .populate('destinatario', 'nome username avatar')
  .populate({
    path: 'respostaA',
    populate: { path: 'remetente', select: 'nome username avatar' }
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limite);
  
  // Marcar como lidas as mensagens recebidas
  await Mensagem.updateMany(
    {
      conversa: conversaId,
      destinatario: userId,
      lida: false
    },
    {
      lida: true,
      dataLida: new Date()
    }
  );
  
const Usuario = require('../models/Usuario');
  await Usuario.findByIdAndUpdate(userId, {
    ultimaAtividade: new Date()
  });
  
  // Resetar contador de não lidas
  await Conversa.updateOne(
    { _id: conversaId, 'naoLidas.usuario': userId },
    { $set: { 'naoLidas.$.quantidade': 0 } }
  );
  
  return mensagens.reverse();
};

// Contar total de não lidas
const contarNaoLidas = async (userId) => {
  const conversas = await Conversa.find({ participantes: userId });
  const total = conversas.reduce((sum, conv) => {
    const minhas = conv.naoLidas.find(n => String(n.usuario) === String(userId));
    return sum + (minhas?.quantidade || 0);
  }, 0);
  return total;
};

module.exports = {
  enviarMensagem,
  listarConversas,
  listarMensagens,
  getOrCreateConversa,
  contarNaoLidas
};