const Chat = require('../models/Chat')
const MatchMusical = require('../models/MatchMusical')
const Bloqueio = require('../models/Bloqueio')
const ChatSilenciado = require('../models/ChatSilenciado')
const mongoose = require('mongoose')

// ============================================
// CHAT SERVICE
// ============================================
const getEntityId = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value._id) return String(value._id)
  if (value.id) return String(value.id)
  return String(value)
}

const getOtherParticipantId = (chat, userId) => {
  const other = (chat.participantes || []).find(
    p => getEntityId(p) !== String(userId)
  )
  return getEntityId(other)
}

const getBlockStatus = async (chat, userId) => {
  const outroUsuario = getOtherParticipantId(chat, userId)

  if (!outroUsuario) {
    return {
      bloqueado: false,
      bloqueadoPorMim: false,
      bloqueadoPorOutro: false,
      outroUsuario: null
    }
  }

  const [bloqueadoPorMimDoc, bloqueadoPorOutroDoc] = await Promise.all([
    Bloqueio.findOne({
      bloqueador: userId,
      bloqueado: outroUsuario
    }).lean(),
    Bloqueio.findOne({
      bloqueador: outroUsuario,
      bloqueado: userId
    }).lean()
  ])

  const bloqueadoPorMim = !!bloqueadoPorMimDoc
  const bloqueadoPorOutro = !!bloqueadoPorOutroDoc

  return {
    bloqueado: bloqueadoPorMim || bloqueadoPorOutro,
    bloqueadoPorMim,
    bloqueadoPorOutro,
    outroUsuario
  }
}

const getSilenciadoStatus = async (chatId, userId) => {
  const silenciado = await ChatSilenciado.findOne({
    chat: chatId,
    usuario: userId
  }).lean()

  return !!silenciado
}

const getOrCreateChat = async (matchId, userId) => {
  let chat = await Chat.findOne({ matchId }).populate('participantes', 'nome avatar')

  if (!chat) {
    const match = await MatchMusical.findById(matchId).populate('usuarios', 'nome avatar')
    if (!match) throw new Error('Match não encontrado')

    chat = new Chat({
      participantes: match.usuarios.map(u => u._id),
      matchId: match._id,
      mensagens: []
    })
    await chat.save()
    chat = await Chat.findById(chat._id).populate('participantes', 'nome avatar')
  }

  // Verificar se userId é participante
  const isParticipant = chat.participantes.some(p => String(p._id) === String(userId))
  if (!isParticipant) throw new Error('Acesso negado')

  return chat  // ← Já populado com participantes
}
const enviarMensagem = async (chatId, userId, conteudo, tipo = 'texto', musica = null, arquivo = null) => {
  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  const isParticipant = chat.participantes.some(p => String(p) === String(userId))
  if (!isParticipant) throw new Error('Acesso negado')

  const blockStatus = await getBlockStatus(chat, userId)

  if (blockStatus.bloqueadoPorMim) {
    throw new Error('Você bloqueou este usuário e não pode enviar mensagens')
  }

  if (blockStatus.bloqueadoPorOutro) {
    throw new Error('Você foi bloqueado por este usuário')
  }

  const mensagem = {
    remetente: userId,
    conteudo,
    tipo,
    musica: tipo === 'musica' ? musica : undefined,
    arquivo: (tipo === 'arquivo' || tipo === 'imagem' || tipo === 'audio') ? {
      nome: arquivo.nome,
      url: arquivo.url,
      tipo: arquivo.tipoMime || arquivo.tipo,
      tamanho: arquivo.tamanho,
      duracao: arquivo.duracao || 0
    } : undefined,
    duracao: tipo === 'audio' ? (arquivo?.duracao || 0) : undefined,
    lida: false,
    createdAt: new Date()
  }

  chat.mensagens.push(mensagem)

  const ultimaResumo = tipo === 'musica' ? '🎵 Música compartilhada'
    : tipo === 'audio' ? '🎵 Áudio'
    : tipo === 'imagem' ? '📷 Foto'
    : tipo === 'arquivo' ? '📎 Arquivo'
    : conteudo

  chat.ultimaMensagem = {
    conteudo: ultimaResumo,
    remetente: userId,
    data: new Date()
  }

  chat.updatedAt = new Date()
  await chat.save()

  const msgSalva = chat.mensagens[chat.mensagens.length - 1]

  return {
    id: msgSalva._id.toString(),
    remetente: msgSalva.remetente.toString(),
    conteudo: msgSalva.conteudo,
    tipo: msgSalva.tipo,
    musica: msgSalva.musica,
    arquivo: msgSalva.arquivo,
    duracao: msgSalva.duracao,
    lida: msgSalva.lida,
    createdAt: msgSalva.createdAt
  }
}

const listarChats = async (userId) => {
  const chats = await Chat.find({
    participantes: userId,
    arquivado: false
  })
    .populate('participantes', 'nome avatar')
    .populate('ultimaMensagem.remetente', 'nome')
    .sort({ updatedAt: -1 })
    .lean()

  const chatsComStatus = await Promise.all(
    chats.map(async (chat) => {
      const otherUser = chat.participantes.find(p => String(p._id) !== String(userId))
      const blockStatus = await getBlockStatus(chat, userId)
      const silenciado = await getSilenciadoStatus(chat._id, userId)

      const unreadCount = blockStatus.bloqueado
        ? 0
        : chat.mensagens.filter(m =>
            String(m.remetente) !== String(userId) && !m.lida
          ).length

      return {
        id: chat._id.toString(),
        matchId: chat.matchId.toString(),
        user: {
          id: otherUser?._id?.toString(),
          name: otherUser?.nome || 'Usuário',
          avatar: otherUser?.avatar || ''
        },
        ultimaMensagem: blockStatus.bloqueado
          ? 'Usuário bloqueado'
          : (chat.ultimaMensagem?.conteudo || ''),
        ultimaData: chat.ultimaMensagem?.data || chat.updatedAt,
        unreadCount,
        silenciado,
        bloqueado: blockStatus.bloqueado,
        bloqueadoPorMim: blockStatus.bloqueadoPorMim,
        bloqueadoPorOutro: blockStatus.bloqueadoPorOutro,
        mensagens: blockStatus.bloqueado ? [] : chat.mensagens.map(m => ({
          id: m._id.toString(),
          remetente: m.remetente.toString(),
          conteudo: m.conteudo,
          tipo: m.tipo,
          musica: m.musica,
          arquivo: m.arquivo,
          duracao: m.duracao,
          lida: m.lida,
          createdAt: m.createdAt
        }))
      }
    })
  )

  return chatsComStatus
}

const getChatMessages = async (chatId, userId, page = 1, limit = 50) => {
  const chat = await Chat.findById(chatId).populate('participantes', 'nome avatar')
  if (!chat) throw new Error('Chat não encontrado')

  const isParticipant = chat.participantes.some(p => String(p._id) === String(userId))
  if (!isParticipant) throw new Error('Acesso negado')

  const blockStatus = await getBlockStatus(chat, userId)
  const silenciado = await getSilenciadoStatus(chatId, userId)
  const otherUser = chat.participantes.find(p => String(p._id) !== String(userId))

  if (blockStatus.bloqueado) {
    return {
      chatId: chat._id.toString(),
      matchId: chat.matchId.toString(),
      silenciado,
      bloqueado: true,
      bloqueadoPorMim: blockStatus.bloqueadoPorMim,
      bloqueadoPorOutro: blockStatus.bloqueadoPorOutro,
      user: {
        id: otherUser?._id?.toString(),
        name: otherUser?.nome || 'Usuário',
        avatar: otherUser?.avatar || ''
      },
      mensagens: []
    }
  }

  chat.mensagens.forEach(m => {
    if (String(m.remetente) !== String(userId) && !m.lida) {
      m.lida = true
    }
  })

  await chat.save()

  const skip = (page - 1) * limit
  const mensagens = chat.mensagens
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(skip, skip + limit)

  return {
    chatId: chat._id.toString(),
    matchId: chat.matchId.toString(),
    silenciado,
    bloqueado: false,
    bloqueadoPorMim: false,
    bloqueadoPorOutro: false,
    user: {
      id: otherUser?._id?.toString(),
      name: otherUser?.nome || 'Usuário',
      avatar: otherUser?.avatar || ''
    },
    mensagens: mensagens.map(m => ({
      id: m._id.toString(),
      remetente: m.remetente.toString(),
      conteudo: m.conteudo,
      tipo: m.tipo,
      musica: m.musica,
      arquivo: m.arquivo,
      duracao: m.duracao,
      lida: m.lida,
      createdAt: m.createdAt
    }))
  }
}

const marcarComoLida = async (chatId, userId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  let modified = false
  chat.mensagens.forEach(m => {
    if (String(m.remetente) !== String(userId) && !m.lida) {
      m.lida = true
      modified = true
    }
  })

  if (modified) await chat.save()
  return { success: true }
}

const deletarMensagem = async (chatId, msgId, userId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  const isParticipant = chat.participantes.some(p => String(p) === String(userId))
  if (!isParticipant) throw new Error('Acesso negado')

  const msgIndex = chat.mensagens.findIndex(m => String(m._id) === String(msgId))
  if (msgIndex === -1) throw new Error('Mensagem não encontrada')

  const msg = chat.mensagens[msgIndex]
  if (String(msg.remetente) !== String(userId)) {
    throw new Error('Acesso negado: você só pode deletar suas próprias mensagens')
  }

  chat.mensagens.splice(msgIndex, 1)
  
  // Atualizar última mensagem se necessário
  if (chat.mensagens.length > 0) {
    const last = chat.mensagens[chat.mensagens.length - 1]
    chat.ultimaMensagem = {
      conteudo: last.tipo === 'musica' ? '🎵 Música compartilhada' 
        : last.tipo === 'audio' ? '🎵 Áudio' 
        : last.tipo === 'imagem' ? '📷 Foto' 
        : last.tipo === 'arquivo' ? '📎 Arquivo' 
        : last.conteudo,
      remetente: last.remetente,
      data: last.createdAt
    }
  } else {
    chat.ultimaMensagem = null
  }

  await chat.save()
  return { success: true }
}

const limparMensagens = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participantes: userId
  })

  if (!chat) throw new Error('Chat não encontrado ou acesso negado')

  chat.mensagens = []
  chat.ultimaMensagem = null
  await chat.save()
  return chat
}

const toggleSilenciar = async (chatId, userId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  const isParticipant = chat.participantes.some(p => String(p) === String(userId))
  if (!isParticipant) throw new Error('Acesso negado')

  const existente = await ChatSilenciado.findOne({ chat: chatId, usuario: userId })

  if (existente) {
    await ChatSilenciado.deleteOne({ _id: existente._id })
    return { silenciado: false }
  }

  await ChatSilenciado.create({ chat: chatId, usuario: userId })
  return { silenciado: true }
}

const bloquearUsuario = async (chatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error('ID do chat inválido')
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID do usuário inválido')
  }

  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  const userIdStr = String(userId)
  const participantesStr = chat.participantes.map(p => String(p))

  if (!participantesStr.includes(userIdStr)) {
    throw new Error('Você não participa deste chat')
  }

  const outroUsuario = participantesStr.find(p => p !== userIdStr)
  if (!outroUsuario) throw new Error('Usuário não encontrado no chat')

  const jaBloqueado = await Bloqueio.findOne({
    bloqueador: userId,
    bloqueado: outroUsuario
  })

  if (jaBloqueado) {
    throw new Error('Usuário já está bloqueado')
  }

  await Bloqueio.create({
    bloqueador: userId,
    bloqueado: outroUsuario,
    chat: chatId
  })

  return {
    bloqueado: true,
    usuarioId: outroUsuario,
    mensagensOcultas: true,
    envioBloqueado: true
  }
}

const criarDenuncia = async (chatId, userId, motivo) => {
  const Denuncia = require('../models/Denuncia') // ou criar model
  
  const chat = await Chat.findById(chatId)
  const outroUsuario = chat.participantes.find(p => String(p) !== String(userId))

  await Denuncia.create({
    denunciante: userId,
    denunciado: outroUsuario,
    chat: chatId,
    motivo,
    status: 'pendente',
    createdAt: new Date()
  })

  return true
}

const excluirChat = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participantes: userId
  })

  if (!chat) {
    throw new Error('Chat não encontrado ou acesso negado')
  }

  await ChatSilenciado.deleteMany({ chat: chatId })
  await Chat.deleteOne({ _id: chatId })

  return { success: true }
}
const desbloquearUsuario = async (chatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error('ID do chat inválido')
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID do usuário inválido')
  }

  const chat = await Chat.findById(chatId)
  if (!chat) throw new Error('Chat não encontrado')

  const userIdStr = String(userId)
  const participantesStr = chat.participantes.map(p => String(p))

  if (!participantesStr.includes(userIdStr)) {
    throw new Error('Você não participa deste chat')
  }

  const outroUsuario = participantesStr.find(p => p !== userIdStr)
  if (!outroUsuario) throw new Error('Usuário não encontrado no chat')

  const bloqueio = await Bloqueio.findOne({
    bloqueador: userId,
    bloqueado: outroUsuario
  })

  if (!bloqueio) {
    throw new Error('Usuário não está bloqueado')
  }

  await Bloqueio.deleteOne({ _id: bloqueio._id })

  return {
    bloqueado: false,
    usuarioId: outroUsuario,
    mensagensOcultas: false,
    envioBloqueado: false
  }
}

module.exports = {
  getOrCreateChat,
  enviarMensagem,
  listarChats,
  getChatMessages,
  marcarComoLida,
  deletarMensagem,
  limparMensagens,
  excluirChat,
  toggleSilenciar,
  bloquearUsuario,
  criarDenuncia,
  desbloquearUsuario
}
