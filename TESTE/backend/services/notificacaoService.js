const Notificacao = require('../models/Notificacao')

const criar = async ({ usuarioDestino, usuarioOrigem, tipo, mensagem }) => {
  return Notificacao.create({
    usuarioDestino,
    usuarioOrigem,
    tipo,
    mensagem
  })
}

const listar = async (userId) => {
  return Notificacao.find({ usuarioDestino: userId })
    .populate('usuarioOrigem', 'nome username avatar')
    .sort({ createdAt: -1 })
}

const marcarComoLida = async (id, userId) => {
  return Notificacao.findOneAndUpdate(
    { _id: id, usuarioDestino: userId },
    { lida: true },
    { new: true }
  )
}

const marcarTodas = async (userId) => {
  return Notificacao.updateMany(
    { usuarioDestino: userId, lida: false },
    { lida: true }
  )
}

// NOVO: Deletar uma notificação específica
const deletar = async (id, userId) => {
  return Notificacao.findOneAndDelete({
    _id: id,
    usuarioDestino: userId
  })
}

// NOVO: Deletar todas as notificações do usuário
const deletarTodas = async (userId) => {
  return Notificacao.deleteMany({ usuarioDestino: userId })
}

module.exports = {
  criar,
  listar,
  marcarComoLida,
  marcarTodas,
  deletar,
  deletarTodas
}