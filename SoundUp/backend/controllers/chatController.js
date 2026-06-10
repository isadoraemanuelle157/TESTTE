    const chatService = require('../services/chatService')

    const iniciarChat = async (req, res) => {
    try {
        const { matchId } = req.body
        const userId = req.user.id

        if (!matchId) {
        return res.status(400).json({ error: 'matchId é obrigatório' })
        }

        const chat = await chatService.getOrCreateChat(matchId, userId)
        
        // Retornar no formato que o frontend espera
        res.json({
        _id: chat._id,
        id: chat._id, // ← compatibilidade
        participantes: chat.participantes,
        matchId: chat.matchId,
        mensagens: chat.mensagens,
        ultimaMensagem: chat.ultimaMensagem,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
        })
    } catch (error) {
        res.status(error.message.includes('Acesso negado') ? 403 : 500)
        .json({ error: error.message })
    }
    }

 const enviarMensagem = async (req, res) => {
  try {
    const { chatId } = req.params
    const { conteudo, tipo, musica } = req.body
    const userId = req.user.id

    if (!conteudo?.trim()) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' })
    }

    const mensagem = await chatService.enviarMensagem(
      chatId,
      userId,
      conteudo.trim(),
      tipo,
      musica
    )

    res.status(201).json(mensagem)
  } catch (error) {
    const statusCode =
      error.message.includes('bloqueou') || error.message.includes('bloqueado')
        ? 403
        : error.message.includes('Acesso negado')
        ? 403
        : error.message.includes('não encontrado')
        ? 404
        : 500

    res.status(statusCode).json({ error: error.message })
  }
}

const excluirChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    await chatService.excluirChat(chatId, userId)

    res.json({ message: 'Chat excluído com sucesso' })
  } catch (error) {
    const statusCode =
      error.message.includes('Acesso negado') ? 403 :
      error.message.includes('não encontrado') ? 404 :
      500

    res.status(statusCode).json({ error: error.message })
  }
}

    const listarChats = async (req, res) => {
    try {
        const chats = await chatService.listarChats(req.user.id)
        res.json({ chats, total: chats.length })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    }

    const getMensagens = async (req, res) => {
    try {
        const { chatId } = req.params
        const { page = 1, limit = 50 } = req.query

        const data = await chatService.getChatMessages(chatId, req.user.id, parseInt(page), parseInt(limit))
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    }

    const marcarLida = async (req, res) => {
    try {
        const { chatId } = req.params
        await chatService.marcarComoLida(chatId, req.user.id)
        res.json({ message: 'Mensagens marcadas como lidas' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    }

const enviarMidia = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id
    
    // ✅ ADICIONAR LOG para debug
    console.log('📎 enviarMidia - req.file:', req.file)
    console.log('📎 enviarMidia - req.body:', req.body)

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado ou tipo não suportado' })
    }

    let tipo = 'arquivo'
    if (req.file.mimetype.startsWith('image/')) tipo = 'imagem'
    else if (req.file.mimetype.startsWith('audio/')) tipo = 'audio'

   const host = req.get('host') || 'localhost:3002'
const protocol = req.protocol === 'https' ? 'https' : 'http'
const fileUrl = `${protocol}://${host}/uploads/chat/${req.file.filename}`

    const arquivo = {
      nome: req.file.originalname,
      url: fileUrl,
      tipoMime: req.file.mimetype,
      tamanho: req.file.size,
      duracao: req.body.duracao || 0
    }

    const mensagem = await chatService.enviarMensagem(
      chatId,
      userId,
      tipo === 'imagem' ? '📷 Foto' : tipo === 'audio' ? '🎵 Áudio' : '📎 Arquivo',
      tipo,
      null,
      arquivo
    )

    res.status(201).json({
      ...mensagem,
      arquivo
    })
  } catch (error) {
    console.error('❌ Erro enviarMidia:', error)
    res.status(500).json({ error: error.message })
  }
}

    const deletarMensagem = async (req, res) => {
    try {
        const { chatId, msgId } = req.params
        const userId = req.user.id

        await chatService.deletarMensagem(chatId, msgId, userId)
        res.json({ message: 'Mensagem deletada' })
    } catch (error) {
        res.status(error.message.includes('Acesso negado') ? 403 : 500)
        .json({ error: error.message })
    }
    }

    const limparChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    await chatService.limparMensagens(chatId, userId)
    res.json({ message: 'Conversa limpa' })
  } catch (error) {
    res.status(error.message.includes('Acesso negado') ? 403 : 500)
      .json({ error: error.message })
  }
}

const silenciarChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const resultado = await chatService.toggleSilenciar(chatId, userId)
    res.json({ 
      message: resultado.silenciado ? 'Chat silenciado' : 'Chat dessilenciado',
      silenciado: resultado.silenciado 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const bloquearUsuario = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const resultado = await chatService.bloquearUsuario(chatId, userId)

    res.json({
      message: 'Usuário bloqueado com sucesso',
      ...resultado,
      mensagensOcultas: true,
      envioBloqueado: true
    })
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)

    const statusCode =
      error.message.includes('inválido') ? 400 :
      error.message.includes('não encontrado') ? 404 :
      error.message.includes('não participa') ? 403 :
      error.message.includes('já está bloqueado') ? 409 :
      500

    res.status(statusCode).json({
      error: error.message,
      code: statusCode
    })
  }
}

const denunciarChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const { motivo } = req.body
    const userId = req.user.id

    if (!motivo?.trim()) {
      return res.status(400).json({ error: 'Motivo é obrigatório' })
    }

    await chatService.criarDenuncia(chatId, userId, motivo.trim())
    res.json({ message: 'Denúncia enviada com sucesso' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const desbloquearUsuario = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const resultado = await chatService.desbloquearUsuario(chatId, userId)

    res.json({
      message: 'Usuário desbloqueado com sucesso',
      ...resultado
    })
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error)

    const statusCode =
      error.message.includes('inválido') ? 400 :
      error.message.includes('não encontrado') ? 404 :
      error.message.includes('não participa') ? 403 :
      error.message.includes('não está bloqueado') ? 409 :
      500

    res.status(statusCode).json({
      error: error.message,
      code: statusCode
    })
  }
}

module.exports = {
  iniciarChat,
  enviarMensagem,
  listarChats,
  getMensagens,
  marcarLida,
  enviarMidia,
  deletarMensagem,
  limparChat,
  excluirChat,
  silenciarChat,
  bloquearUsuario,
  denunciarChat,
   desbloquearUsuario
}
