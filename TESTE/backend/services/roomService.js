const bcrypt = require('bcrypt')
const Room = require('../models/Room')

const normalizeName = (name = '') => name.trim().replace(/\s+/g, ' ')

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
    // Permissões padrão
    permissions: {
      addMusic: dados.permissions?.addMusic || 'everyone',
      invitePeople: dados.permissions?.invitePeople || 'moderators'
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
  return Room.find({ createdBy: userId, active: true })
    .sort({ createdAt: -1 })
    .select('name description isPublic hasPassword source gradient listeners permissions moderators createdAt')
    .populate('moderators', 'nome username avatar')
}

const listarPublicas = async () => {
  return Room.find({ isPublic: true, active: true })
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

const entrar = async (roomId, userId, password) => {
  const room = await Room.findById(roomId)
    .select('+passwordHash')
    .populate('createdBy', 'nome username avatar')
    .populate('moderators', 'nome username avatar')
    .populate('invitedUsers', 'nome username avatar')

  if (!room) throw new Error('Sala não encontrada')

  if (room.isPublic) return room

  if (userId && String(room.createdBy._id || room.createdBy) === String(userId)) {
    return room
  }

  const convidado = room.invitedUsers.some(user => {
    const id = user?._id || user
    return String(id) === String(userId)
  })

  if (convidado) return room

  if (room.hasPassword && room.passwordHash) {
    const senhaOk = await bcrypt.compare(String(password || ''), room.passwordHash)
    if (senhaOk) return room
  }

  throw new Error('Senha inválida ou acesso não autorizado')
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

const deletar = async (id, userId) => {
  const room = await Room.findOneAndDelete({ _id: id, createdBy: userId })
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

// ========== NOVAS FUNÇÕES DE PERMISSÕES ==========

const verificarAcesso = async (roomId, userId) => {
  const room = await Room.findById(roomId)
    .populate('moderators', '_id')
  if (!room) throw new Error('Sala não encontrada')

  if (room.isPublic) return true
  if (userId && String(room.createdBy) === String(userId)) return true

  const convidado = room.invitedUsers.some(id => String(id) === String(userId))
  if (convidado) return true

  return false
}

const verificarPermissao = async (roomId, userId, acao) => {
  const room = await Room.findById(roomId)
    .populate('moderators', '_id')
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
  const room = await Room.findById(roomId)
    .populate('moderators', '_id')
  if (!room) throw new Error('Sala não encontrada')

  if (String(room.createdBy) === String(userId)) return 'owner'
  if (room.moderators.some(m => String(m._id || m) === String(userId))) return 'moderator'
  return 'participant'
}

const adicionarModerador = async (roomId, userId, novoModeradorId) => {
  const room = await Room.findOneAndUpdate(
    { _id: roomId, createdBy: userId },
    { $addToSet: { moderators: novoModeradorId } },
    { new: true }
  )
    .populate('moderators', 'nome username avatar')

  if (!room) throw new Error('Sala não encontrada ou sem permissão')
  return room
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

// ================================================

const atualizarTrack = async (roomId, userId, track) => {
  const room = await Room.findOneAndUpdate(
    { _id: roomId, createdBy: userId },
    { $set: { currentTrack: track } },
    { new: true }
  )
  if (!room) throw new Error('Sala não encontrada ou sem permissão')
  return room
}

const adicionarNaFila = async (roomId, userId, track) => {
  const room = await Room.findOneAndUpdate(
    { _id: roomId, createdBy: userId },
    { $push: { queue: track } },
    { new: true }
  )
  if (!room) throw new Error('Sala não encontrada ou sem permissão')
  return room
}

const enviarMensagem = async (roomId, mensagem) => {
  const room = await Room.findByIdAndUpdate(
    roomId,
    { $push: { messages: mensagem } },
    { new: true }
  )
  if (!room) throw new Error('Sala não encontrada')
  return room
}

module.exports = {
  criar,
  listarMinhas,
  listarPublicas,
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
  atualizarTrack,
  adicionarNaFila,
  enviarMensagem
}