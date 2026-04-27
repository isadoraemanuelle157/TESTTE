const Historico = require('../models/Historico')

// LISTAR
const getHistoricoByUser = async (userId) => {
  return await Historico.find({ usuario: userId })
    .sort({ createdAt: -1 })
    .limit(10)
}

// ADICIONAR
const addHistorico = async (userId, termo) => {
  if (!termo) {
    throw new Error("Termo obrigatório")
  }

  // remover duplicado recente
  await Historico.deleteMany({
    usuario: userId,
    termo
  })

  return await Historico.create({
    usuario: userId,
    termo
  })
}

// LIMPAR
const clearHistorico = async (userId) => {
  return await Historico.deleteMany({ usuario: userId })
}

module.exports = {
  getHistoricoByUser,
  addHistorico,
  clearHistorico
}
