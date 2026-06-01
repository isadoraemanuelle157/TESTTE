const Room = require('../models/Room')

const criar = async (dados, userId) => {
  const room = await Room.create({
    ...dados,
    createdBy: userId
  })
  return room
}

const listarMinhas = async (userId) => {
  return Room.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('name description isPublic source gradient listeners createdAt')
}

const listarPublicas = async () => {
  return Room.find({ isPublic: true, active: true })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'nome username avatar')
    .select('name description isPublic source gradient listeners createdBy createdAt')
}

const buscarPorId = async (id) => {
  return Room.findById(id)
    .populate('createdBy', 'nome username avatar')
    .populate('invitedUsers', 'nome username avatar')
}

const atualizar = async (id, userId, dados) => {
  const room = await Room.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { $set: dados },
    { new: true }
  )
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
  if (!room) throw new Error('Sala não encontrada ou sem permissão')
  return room
}

const verificarAcesso = async (roomId, userId) => {
  const room = await Room.findById(roomId)
  if (!room) throw new Error('Sala não encontrada')
  
  // Sala pública = acesso livre
  if (room.isPublic) return true
  
  // Dono sempre tem acesso
  if (String(room.createdBy) === String(userId)) return true
  
  // Verifica se está na lista de convidados
  const convidado = room.invitedUsers.some(id => String(id) === String(userId))
  if (convidado) return true
  
  throw new Error('Você não tem acesso a esta sala privada')
}

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
  atualizar,
  deletar,
  convidar,
  verificarAcesso,
  atualizarTrack,
  adicionarNaFila,
  enviarMensagem
}