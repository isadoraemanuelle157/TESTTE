const bcrypt = require('bcrypt')
  const Room = require('../models/Room')
  const mongoose = require('mongoose')

  const normalizeName = (name = '') => name.trim().replace(/\\s+/g, ' ')

  const criar = async (dados, userId) => {
    const normalizedName = normalizeName(dados.name)

    const roomComMesmoNome = await Room.findOne({
      name: normalizedName,
      active: true
    }).collation({ locale: 'pt', strength: 2 })

    if (roomComMesmoNome) {
      throw new Error('Já existe uma sala com esse nome')
    }

    const payload = {
      ...dados,
      name: normalizedName,
      createdBy: userId,
       source: dados.source || 'spotify', 
      permissions: {
        addMusic: dados.permissions?.addMusic || 'everyone',
        invitePeople: dados.permissions?.invitePeople || 'moderators',
        promoteModerators: dados.permissions?.promoteModerators || 'owner'
      }
    }

    if (!dados.isPublic) {
      if (!dados.password || String(dados.password).trim().length < 4) {
        throw new Error('Sala privada precisa de senha com pelo menos 4 caracteres')
      }
      payload.passwordHash = await bcrypt.hash(String(dados.password).trim(), 10)
      payload.hasPassword = true
    } else {
      payload.passwordHash = null
      payload.hasPassword = false
    }

    delete payload.password

    const room = await Room.create(payload)

    return Room.findById(room._id)
      .populate('createdBy', 'nome username avatar')
      .populate('moderators', 'nome username avatar')
      .populate('invitedUsers', 'nome username avatar')
  }

  const listarMinhas = async (userId) => {
  return Room.find({ createdBy: userId, active: true })  // ✅ ADICIONAR active: true
    .sort({ createdAt: -1 })
      .select('name description isPublic hasPassword source gradient listeners permissions moderators createdAt')
      .populate('moderators', 'nome username avatar')
  }

 const listarPublicas = async () => {
  return Room.find({ isPublic: true, active: true })  // ✅ ADICIONAR active: true
    .sort({ createdAt: -1 })
    .populate('createdBy', 'nome username avatar')
    .populate('moderators', 'nome username avatar')
    .select('name description isPublic hasPassword source gradient listeners createdBy createdAt')
}

 const buscarPorId = async (id) => {
  return Room.findById(id)
    .populate('createdBy', 'nome username avatar')
    .populate('moderators', 'nome username avatar')
    .populate('invitedUsers', 'nome username avatar')
}
  // ========== ENTRAR NA SALA — CORRIGIDO (SENHA) ==========
  const entrar = async (roomId, userId, password) => {
    const room = await Room.findById(roomId)
      .select('+passwordHash')
      .populate('createdBy', 'nome username avatar')
      .populate('moderators', 'nome username avatar')
      .populate('invitedUsers', 'nome username avatar')

    if (!room) throw new Error('Sala não encontrada')

    // Sala pública = entra direto
    if (room.isPublic) return room

    // Dono entra sem senha
    if (userId && String(room.createdBy._id || room.createdBy) === String(userId)) {
      return room
    }

    // ✅ VERIFICAÇÃO RIGOROSA DA SENHA — CORRIGIDA
    
    // 1. Verifica se a sala realmente tem senha configurada
    if (!room.hasPassword || !room.passwordHash || room.passwordHash.trim() === '') {
      throw new Error('Acesso não autorizado. Esta sala é restrita a convidados.')
    }

    const senhaFornecida = String(password || '').trim()
    
    // 2. Se não forneceu senha
    if (!senhaFornecida) {
      throw new Error('Senha obrigatória para esta sala')
    }

    // 3. Se forneceu senha vazia
    if (senhaFornecida.length < 1) {
      throw new Error('Senha obrigatória para esta sala')
    }

    // ✅ bcrypt.compare com tratamento de erro e validação do resultado
    let senhaOk = false
    try {
      senhaOk = await bcrypt.compare(senhaFornecida, room.passwordHash)
    } catch (err) {
      console.error('Erro no bcrypt.compare:', err)
      throw new Error('Erro ao verificar senha')
    }

    if (!senhaOk) {
      throw new Error('Senha inválida')
    }

    return room
  }

  const atualizar = async (id, userId, dados) => {
    const updateData = { ...dados }

    if (updateData.name) {
      const normalizedName = normalizeName(updateData.name)
      const roomComMesmoNome = await Room.findOne({
        _id: { $ne: id },
        name: normalizedName,
        active: true
      }).collation({ locale: 'pt', strength: 2 })

      if (roomComMesmoNome) {
        throw new Error('Já existe uma sala com esse nome')
      }
      updateData.name = normalizedName
    }

    if (updateData.isPublic === false && updateData.password) {
      updateData.passwordHash = await bcrypt.hash(String(updateData.password).trim(), 10)
      updateData.hasPassword = true
    }

    if (updateData.isPublic === true) {
      updateData.passwordHash = null
      updateData.hasPassword = false
    }

    delete updateData.password

    const room = await Room.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: updateData },
      { new: true }
    )
      .populate('createdBy', 'nome username avatar')
      .populate('moderators', 'nome username avatar')
      .populate('invitedUsers', 'nome username avatar')

    if (!room) throw new Error('Sala não encontrada ou sem permissão')
    return room
  }

  const deletar = async (id, userId, userRole) => {
    // ✅ Admin pode deletar qualquer sala
    const query = userRole === 'admin' 
      ? { _id: id }
      : { _id: id, createdBy: userId }
      
    const room = await Room.findOneAndDelete(query)
    if (!room) throw new Error('Sala não encontrada ou sem permissão')
    return room
  }

  const convidar = async (roomId, userId, convidadoId) => {
    const room = await Room.findOneAndUpdate(
      { _id: roomId, createdBy: userId },
      { $addToSet: { invitedUsers: convidadoId } },
      { new: true }
    )
      .populate('createdBy', 'nome username avatar')
      .populate('moderators', 'nome username avatar')
      .populate('invitedUsers', 'nome username avatar')

    if (!room) throw new Error('Sala não encontrada ou sem permissão')
    return room
  }

  // ========== PERMISSÕES ==========
  const verificarAcesso = async (roomId, userId) => {
    const room = await Room.findById(roomId).populate('moderators', '_id')
    if (!room) throw new Error('Sala não encontrada')

    if (room.isPublic) return true
    if (userId && String(room.createdBy) === String(userId)) return true

    const convidado = room.invitedUsers.some(id => String(id) === String(userId))
    if (convidado) return true

    return false
  }

  const verificarPermissao = async (roomId, userId, acao) => {
    const room = await Room.findById(roomId).populate('moderators', '_id')
    if (!room) throw new Error('Sala não encontrada')

    const isOwner = String(room.createdBy) === String(userId)
    const isModerator = room.moderators.some(m => String(m._id || m) === String(userId))

    const perm = room.permissions[acao]

    if (perm === 'everyone') return true
    if (perm === 'moderators' && (isOwner || isModerator)) return true
    if (perm === 'owner' && isOwner) return true

    return false
  }

  const getUserRole = async (roomId, userId) => {
    const room = await Room.findById(roomId).populate('moderators', '_id')
    if (!room) throw new Error('Sala não encontrada')

    if (String(room.createdBy) === String(userId)) return 'owner'
    if (room.moderators.some(m => String(m._id || m) === String(userId))) return 'moderator'
    return 'participant'
  }

  const adicionarModerador = async (roomId, userId, novoModeradorId) => {
    const room = await Room.findById(roomId).populate('moderators', '_id')
    if (!room) throw new Error('Sala não encontrada')

    const isOwner = String(room.createdBy) === String(userId)
    const isModerator = room.moderators.some(m => String(m._id || m) === String(userId))

    const perm = room.permissions?.promoteModerators || 'owner'
    let canPromote = false
    if (perm === 'owner' && isOwner) canPromote = true
    if (perm === 'moderators' && (isOwner || isModerator)) canPromote = true
    if (perm === 'everyone') canPromote = true

    if (!canPromote) {
      throw new Error('Sem permissão para promover moderadores')
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { moderators: novoModeradorId } },
      { new: true }
    ).populate('moderators', 'nome username avatar')

    return updatedRoom
  }

  const removerModerador = async (roomId, userId, moderadorId) => {
    const room = await Room.findOneAndUpdate(
      { _id: roomId, createdBy: userId },
      { $pull: { moderators: moderadorId } },
      { new: true }
    )
      .populate('moderators', 'nome username avatar')

    if (!room) throw new Error('Sala não encontrada ou sem permissão')
    return room
  }

  const atualizarPermissoes = async (roomId, userId, permissoes) => {
    const room = await Room.findOneAndUpdate(
      { _id: roomId, createdBy: userId },
      { $set: { permissions: permissoes } },
      { new: true }
    )

    if (!room) throw new Error('Sala não encontrada ou sem permissão')
    return room
  }

  // ========== SINCRONIZAÇÃO DE REPRODUÇÃO ==========
  const sincronizarReproducao = async (roomId, syncData) => {
    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $set: {
          syncState: {
            isPlaying: syncData.isPlaying,
            currentTime: syncData.currentTime,
            trackId: syncData.trackId,
            lastUpdated: new Date()
          }
        }
      },
      { new: true }
    )

    if (!room) throw new Error('Sala não encontrada')
    return room.syncState
  }

  const obterSyncState = async (roomId) => {
    const room = await Room.findById(roomId).select('syncState currentTrack')
    if (!room) throw new Error('Sala não encontrada')
    return {
      syncState: room.syncState,
      currentTrack: room.currentTrack
    }
  }

  // ========== MÚSICA ATUAL ==========
  const atualizarTrack = async (roomId, track) => {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $set: { currentTrack: track } },
      { new: true }
    )
    if (!room) throw new Error('Sala não encontrada')
    return room
  }

  const obterTrackAtual = async (roomId) => {
    const room = await Room.findById(roomId).select('currentTrack syncState')
    if (!room) throw new Error('Sala não encontrada')
    return {
      currentTrack: room.currentTrack,
      syncState: room.syncState
    }
  }

  // ========== FILA DE REPRODUÇÃO ==========
  const adicionarNaFila = async (roomId, track) => {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $push: { queue: track } },
      { new: true }
    )
    if (!room) throw new Error('Sala não encontrada')
    return room
  }

  const listarFila = async (roomId) => {
    const room = await Room.findById(roomId).select('queue')
    if (!room) throw new Error('Sala não encontrada')
    return room.queue || []
  }

  const removerDaFila = async (roomId, trackIndex) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Sala não encontrada')

    if (trackIndex >= 0 && trackIndex < room.queue.length) {
      room.queue.splice(trackIndex, 1)
      await room.save()
    }
    return room.queue
  }

  const proximaMusica = async (roomId) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Sala não encontrada')

    // Se tem música na fila, pega a primeira
    if (room.queue && room.queue.length > 0) {
      const nextTrack = room.queue.shift()
      room.currentTrack = nextTrack
      room.syncState = {
        isPlaying: true,
        currentTime: 0,
        trackId: nextTrack.id,
        lastUpdated: new Date()
      }
      await room.save()
      return {
        currentTrack: room.currentTrack,
        queue: room.queue,
        syncState: room.syncState
      }
    }

    // Se não tem mais músicas, para
    room.syncState = {
      isPlaying: false,
      currentTime: 0,
      trackId: null,
      lastUpdated: new Date()
    }
    await room.save()
    return {
      currentTrack: null,
      queue: room.queue,
      syncState: room.syncState
    }
  }

  // ========== MENSAGENS ==========
  const enviarMensagem = async (roomId, mensagem) => {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $push: { messages: mensagem } },
      { new: true }
    )
    if (!room) throw new Error('Sala não encontrada')
    return room
  }

  // ========== LISTAR TODAS ==========
  const listarTodas = async (userId) => {
     const rooms = await Room.find({ active: true })  // ✅ ADICIONAR active: true
    .sort({ createdAt: -1 })
      .populate('createdBy', 'nome username avatar')
      .populate('moderators', 'nome username avatar')
      .select('name description isPublic hasPassword source gradient listeners createdBy moderators createdAt')

    return rooms.map(room => {
      const isOwner = userId && String(room.createdBy?._id || room.createdBy) === String(userId)
      const isModerator = room.moderators?.some(m =>
        userId && String(m?._id || m) === String(userId)
      )
      return {
        ...room.toObject(),
        userHasAccess: isOwner || isModerator || room.isPublic
      }
    })
  }

  // ========== LISTENERS — CORRIGIDO ==========
const adicionarListener = async (roomId, userData) => {
  const { userId, name, avatar, role = 'participant' } = userData
  const room = await Room.findById(roomId)
  if (!room) throw new Error('Sala não encontrada')

  // ✅ CORREÇÃO: Limpa listeners inativos (mais de 5 minutos) antes de adicionar
  const FIVE_MINUTES = 5 * 60 * 1000
  const now = Date.now()
  room.activeListeners = room.activeListeners.filter(l => {
    const joinedTime = new Date(l.joinedAt).getTime()
    return (now - joinedTime) < FIVE_MINUTES
  })

  const existingIndex = room.activeListeners.findIndex(l =>
    String(l.userId) === String(userId)
  )

  if (existingIndex !== -1) {
    // Atualiza timestamp para manter ativo
    room.activeListeners[existingIndex] = { 
      userId, name, avatar, role, joinedAt: new Date() 
    }
  } else {
    room.activeListeners.push({ userId, name, avatar, role, joinedAt: new Date() })
  }

  room.listeners = room.activeListeners.length
  await room.save()

  return Room.findById(roomId)
    .populate('activeListeners.userId', 'nome username avatar')
    .populate('createdBy', 'nome username avatar')
}

const removerListener = async (roomId, userIdToRemove, requesterId) => {
  const room = await Room.findById(roomId)
    .populate('createdBy', '_id')
    .populate('moderators', '_id')
  if (!room) throw new Error('Sala não encontrada')

  // ✅ CORREÇÃO: Normaliza TODOS os IDs para string e trim
  const normalizeId = (id) => {
    if (!id) return ''
    // Converte ObjectId para string se necessário
    return String(id).trim()
  }
  
  const reqId = normalizeId(requesterId)
  const targetId = normalizeId(userIdToRemove)
  const ownerId = normalizeId(room.createdBy._id || room.createdBy)

  const isOwner = ownerId === reqId
  const isModerator = room.moderators.some(m => 
    normalizeId(m._id || m) === reqId
  )
  const isSelfRemoving = targetId === reqId

  // ✅ LOG para debug (pode remover em produção)
  console.log(`[removerListener] reqId=${reqId}, targetId=${targetId}, ownerId=${ownerId}, isOwner=${isOwner}, isSelfRemoving=${isSelfRemoving}`)

  // ✅ CORREÇÃO: Permissões mais claras
  // - Dono pode remover qualquer um (inclusive si mesmo)
  // - Moderador pode remover participants (mas não dono nem outros moderadores)
  // - Qualquer um pode se remover (self-removal)
  
  if (!isOwner && !isModerator && !isSelfRemoving) {
    throw new Error('Sem permissão para remover usuários')
  }

  // Moderador não-dono não pode remover dono
  if (isModerator && !isOwner && targetId === ownerId) {
    throw new Error('Apenas o dono pode ser removido por si mesmo')
  }

  // Moderador não-dono não pode remover outro moderador
  if (isModerator && !isOwner) {
    const targetIsModerator = room.moderators.some(m => 
      normalizeId(m._id || m) === targetId
    )
    if (targetIsModerator) {
      throw new Error('Apenas o dono pode expulsar moderadores')
    }
  }

  // ✅ CORREÇÃO: Procura o listener com comparação flexível
  const existingIndex = room.activeListeners.findIndex(l => {
    const listenerId = normalizeId(l.userId?._id || l.userId)
    return listenerId === targetId
  })
  
  if (existingIndex === -1) {
    // Já saiu, considera sucesso (idempotente)
    console.log(`[removerListener] Usuário ${targetId} não encontrado, retornando sucesso`)
    return room
  }

  const removedListener = room.activeListeners[existingIndex]
  
  // ✅ CORREÇÃO CRÍTICA: Verifica se quem está saindo É o dono
  const removedId = normalizeId(removedListener.userId?._id || removedListener.userId)
  const wasOwner = removedId === ownerId

  console.log(`[removerListener] Removendo: ${removedListener.name}, wasOwner=${wasOwner}`)

  // Remove o listener
  room.activeListeners.splice(existingIndex, 1)
  
  // ✅ CORREÇÃO CRÍTICA: Se o dono saiu, limpa TUDO
  if (wasOwner) {
    console.log(`[removerListener] 🚨 DONO SAIU! Limpando sala ${roomId}`)
    room.activeListeners = []
    room.listeners = 0
    room.currentTrack = null
    room.syncState = {
      isPlaying: false,
      currentTime: 0,
      trackId: null,
      lastUpdated: new Date()
    }
     room.active = false
  } else {
    // Atualiza contagem normalmente
    room.listeners = Math.max(0, room.activeListeners.length)
  }
  
  await room.save()

  return room
}

const listarListeners = async (roomId) => {
  const room = await Room.findById(roomId)
    .populate('activeListeners.userId', 'nome username avatar')
    .populate('createdBy', 'nome username avatar')
    .populate('moderators', 'nome username avatar')
  if (!room) throw new Error('Sala não encontrada')

  const TWO_MINUTES = 2 * 60 * 1000
  const now = Date.now()
  const originalLength = room.activeListeners.length

  room.activeListeners = room.activeListeners.filter(listener => {
    const joinedTime = new Date(listener.joinedAt).getTime()
    return (now - joinedTime) < TWO_MINUTES
  })

  if (room.activeListeners.length !== originalLength) {
    room.listeners = room.activeListeners.length
    await room.save()
  }

  return room.activeListeners.map(listener => {
    const userId = String(listener.userId?._id || listener.userId)
    const isOwner = String(room.createdBy._id || room.createdBy) === userId
    const isModerator = room.moderators.some(m => String(m._id || m) === userId)
    return {
      id: userId,
      name: listener.name || listener.userId?.nome || 'Usuário',
      avatar: listener.avatar || listener.userId?.avatar || 'https://via.placeholder.com/150',
      role: isOwner ? 'owner' : (isModerator ? 'moderator' : 'participant'),
      joinedAt: listener.joinedAt
    }
  })
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
    enviarMensagem
  }