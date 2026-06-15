const roomService = require('../services/roomService')
const Room = require('../models/Room')

const criar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { name, description, isPublic, invitedUsers, moderators, password, permissions } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da sala é obrigatório' })
    }

    const isPublicBool = isPublic === false || isPublic === 'false' ? false : true

    if (isPublicBool === false) {
      const senhaLimpa = String(password || '').trim()
      if (senhaLimpa.length < 4) {
        return res.status(400).json({ error: 'Senha é obrigatória (mínimo 4 caracteres) para sala privada' })
      }
    }

    const roomData = {
      name: name.trim(),
      description: description || '',
      isPublic: isPublicBool,
      invitedUsers: invitedUsers || [],
      moderators: moderators || [],
      password: isPublicBool === false ? String(password || '').trim() : undefined,
      source: 'spotify',
      permissions: permissions || { addMusic: 'everyone', invitePeople: 'moderators', promoteModerators: 'owner' }
    }

    const room = await roomService.criar(roomData, req.user.id)
    res.status(201).json(room)
  } catch (error) {
    console.error('ERRO CRIAR SALA:', error)
    if (error.message.includes('Já existe uma sala')) {
      return res.status(409).json({ error: error.message })
    }
    res.status(400).json({ error: error.message })
  }
}

const listarMinhas = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const rooms = await roomService.listarMinhas(req.user.id)
    res.json(rooms)
  } catch (error) {
    console.error('ERRO LISTAR SALAS:', error)
    res.status(500).json({ error: error.message })
  }
}

const listarPublicas = async (req, res) => {
  try {
    const rooms = await roomService.listarPublicas()
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const buscarPorId = async (req, res) => {
  try {
    const room = await roomService.buscarPorId(req.params.id)
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' })
    res.json(room)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const entrar = async (req, res) => {
  try {
    const room = await roomService.entrar(
      req.params.id,
      req.user?.id || null,
      req.body?.password || ''
    )
    res.json(room)
  } catch (error) {
    res.status(403).json({ error: error.message })
  }
}

const atualizar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const room = await roomService.atualizar(req.params.id, req.user.id, req.body)
    res.json(room)
  } catch (error) {
    if (error.message.includes('Já existe uma sala')) {
      return res.status(409).json({ error: error.message })
    }
    res.status(400).json({ error: error.message })
  }
}

const deletar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    await roomService.deletar(req.params.id, req.user.id)
    res.json({ message: 'Sala deletada com sucesso' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const convidar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { roomId, userId } = req.body
    if (!roomId || !userId) {
      return res.status(400).json({ error: 'roomId e userId são obrigatórios' })
    }
    const room = await roomService.convidar(roomId, req.user.id, userId)
    res.json({ message: 'Convite enviado', room })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const verificarAcesso = async (req, res) => {
  try {
    const temAcesso = await roomService.verificarAcesso(
      req.params.id,
      req.user?.id || null
    )
    res.json({ acesso: temAcesso })
  } catch (error) {
    res.status(403).json({ error: error.message, acesso: false })
  }
}

// ========== PERMISSÕES ==========
const verificarPermissao = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { acao } = req.params
    const temPermissao = await roomService.verificarPermissao(req.params.id, req.user.id, acao)
    res.json({ permissao: temPermissao })
  } catch (error) {
    res.status(400).json({ error: error.message, permissao: false })
  }
}

const getUserRole = async (req, res) => {
  try {
    const role = await roomService.getUserRole(req.params.id, req.user?.id || null)
    res.json({ role })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const adicionarModerador = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { moderadorId } = req.body
    if (!moderadorId) {
      return res.status(400).json({ error: 'moderadorId é obrigatório' })
    }
    const room = await roomService.adicionarModerador(req.params.id, req.user.id, moderadorId)
    res.json({ message: 'Moderador adicionado', room })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const removerModerador = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { moderadorId } = req.body
    if (!moderadorId) {
      return res.status(400).json({ error: 'moderadorId é obrigatório' })
    }
    const room = await roomService.removerModerador(req.params.id, req.user.id, moderadorId)
    res.json({ message: 'Moderador removido', room })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const atualizarPermissoes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { permissions } = req.body
    if (!permissions) {
      return res.status(400).json({ error: 'permissions é obrigatório' })
    }
    const room = await roomService.atualizarPermissoes(req.params.id, req.user.id, permissions)
    res.json({ message: 'Permissões atualizadas', room })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ========== SINCRONIZAÇÃO DE REPRODUÇÃO ==========
const sincronizarReproducao = async (req, res) => {
  try {
    const { isPlaying, currentTime, trackId } = req.body

    const syncState = await roomService.sincronizarReproducao(req.params.id, {
      isPlaying,
      currentTime,
      trackId
    })

    res.json({ success: true, syncState })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const obterSyncState = async (req, res) => {
  try {
    const data = await roomService.obterSyncState(req.params.id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ========== MÚSICA ATUAL ==========
const atualizarTrack = async (req, res) => {
  try {
    const room = await roomService.atualizarTrack(req.params.id, req.body)
    res.json({ success: true, currentTrack: room.currentTrack })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const obterTrackAtual = async (req, res) => {
  try {
    const data = await roomService.obterTrackAtual(req.params.id)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ========== FILA DE REPRODUÇÃO ==========
const adicionarNaFila = async (req, res) => {
  try {
    const room = await roomService.adicionarNaFila(req.params.id, req.body)
    res.json({ success: true, queue: room.queue })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const listarFila = async (req, res) => {
  try {
    const queue = await roomService.listarFila(req.params.id)
    res.json({ queue })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const removerDaFila = async (req, res) => {
  try {
    const { index } = req.body
    const queue = await roomService.removerDaFila(req.params.id, index)
    res.json({ success: true, queue })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const proximaMusica = async (req, res) => {
  try {
    const result = await roomService.proximaMusica(req.params.id)
    res.json({
      success: true,
      currentTrack: result.currentTrack,
      queue: result.queue,
      syncState: result.syncState
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ========== MENSAGENS ==========
const enviarMensagem = async (req, res) => {
  try {
    const room = await roomService.enviarMensagem(req.params.id, req.body)
    res.json({ success: true, messages: room.messages })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const listarMensagens = async (req, res) => {
  try {
    const room = await roomService.buscarPorId(req.params.id)
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' })

    const mensagens = (room.messages || []).slice(-100).map((msg, i) => ({
      id: msg._id || `msg_${i}_${Date.now()}`,
      userId: msg.userId,
      userName: msg.userName,
      avatar: msg.avatar,
      text: msg.text,
      timestamp: msg.timestamp
    }))

    res.json({ messages: mensagens })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listarTodas = async (req, res) => {
  try {
    const rooms = await roomService.listarTodas(req.user?.id || null)
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ========== LISTENERS ==========
const adicionarListener = async (req, res) => {
  try {
    const roomId = req.params.id
    const userData = {
      userId: req.user?.id || req.body.guestId || `guest_${Date.now()}`,
      name: req.body.name || req.user?.nome || 'Visitante',
      avatar: req.body.avatar || req.user?.avatar || 'https://via.placeholder.com/150',
      role: req.body.role || 'participant'
    }

    const room = await roomService.adicionarListener(roomId, userData)

    await roomService.enviarMensagem(roomId, {
      userId: 'system',
      userName: 'Sistema',
      avatar: 'https://via.placeholder.com/150',
      text: `${userData.name} entrou na sala!`,
      timestamp: new Date()
    })

    res.json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const removerListener = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { userIdToRemove } = req.body
    if (!userIdToRemove) {
      return res.status(400).json({ error: 'userIdToRemove é obrigatório' })
    }

    const room = await roomService.removerListener(
      req.params.id,
      userIdToRemove,
      req.user.id
    )

    await roomService.enviarMensagem(req.params.id, {
      userId: 'system',
      userName: 'Sistema',
      avatar: 'https://via.placeholder.com/150',
      text: `Um usuário foi removido da sala.`,
      timestamp: new Date()
    })

    res.json({ message: 'Usuário removido da sala', room })
  } catch (error) {
    res.status(403).json({ error: error.message })
  }
}

const listarListeners = async (req, res) => {
  try {
    const listeners = await roomService.listarListeners(req.params.id)
    res.json(listeners)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  criar,
  listarMinhas,
  listarPublicas,
  listarTodas,
  buscarPorId,
  entrar,
  atualizar,
  deletar,
  convidar,
  verificarAcesso,
  verificarPermissao,
  getUserRole,
  adicionarModerador,
  removerModerador,
  atualizarPermissoes,
  adicionarListener,
  removerListener,
  listarListeners,
  // Sincronização
  sincronizarReproducao,
  obterSyncState,
  // Track
  atualizarTrack,
  obterTrackAtual,
  // Fila
  adicionarNaFila,
  listarFila,
  removerDaFila,
  proximaMusica,
  // Mensagens
  enviarMensagem,
  listarMensagens
}