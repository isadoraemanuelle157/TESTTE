const Notificacao = require('../models/Notificacao')

const criar = async ({ usuarioDestino, usuarioOrigem, tipo, mensagem, meta = {} }) => {
  return Notificacao.create({
    usuarioDestino,
    usuarioOrigem,
    tipo,
    mensagem,
    meta
  })
}

const criarMuitas = async (notificacoes = []) => {
  if (!notificacoes.length) return []
  return Notificacao.insertMany(notificacoes)
}

const listar = async (userId) => {
  return Notificacao.find({ usuarioDestino: userId })
    .populate('usuarioOrigem', 'nome username avatar email role')
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

const deletar = async (id, userId) => {
  return Notificacao.findOneAndDelete({
    _id: id,
    usuarioDestino: userId
  })
}

const deletarTodas = async (userId) => {
  return Notificacao.deleteMany({ usuarioDestino: userId })
}

module.exports = {
  criar,
  criarMuitas,
  listar,
  marcarComoLida,
  marcarTodas,
  deletar,
  deletarTodas
}
