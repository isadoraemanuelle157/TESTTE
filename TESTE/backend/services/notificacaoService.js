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

module.exports = {
  criar,
  listar,
  marcarComoLida,
  marcarTodas
}
