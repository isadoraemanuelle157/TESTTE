const Historico = require('../models/Historico')

// ========== BUSCAS (existente) ==========

const getHistoricoByUser = async (userId) => {
  return await Historico.find({ usuario: userId, tipo: 'busca' })
    .sort({ createdAt: -1 })
    .limit(10)
}

const addHistorico = async (userId, termo) => {
  if (!termo) {
    throw new Error("Termo obrigatório")
  }

  await Historico.deleteMany({
    usuario: userId,
    termo,
    tipo: 'busca'
  })

  return await Historico.create({
    usuario: userId,
    tipo: 'busca',
    termo
  })
}

const clearHistorico = async (userId) => {
  return await Historico.deleteMany({ usuario: userId, tipo: 'busca' })
}

// ========== 🔥 REPRODUÇÕES (novo) ==========

const getReproducoesByUser = async (userId, limit = 50) => {
  return await Historico.find({ usuario: userId, tipo: 'reproducao' })
    .sort({ createdAt: -1 })
    .limit(limit)
}

const addReproducao = async (userId, dados) => {
  const { musicaId, titulo, artista, capa, source, tempoOuvido, reproduzidaAteOFim } = dados

  if (!musicaId || !titulo) {
    throw new Error("musicaId e titulo são obrigatórios")
  }

  // 🔥 Remove duplicado recente (mesma música nas últimas 24h)
  const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000)
  await Historico.deleteMany({
    usuario: userId,
    musicaId,
    tipo: 'reproducao',
    createdAt: { $gte: umDiaAtras }
  })

  return await Historico.create({
    usuario: userId,
    tipo: 'reproducao',
    musicaId,
    titulo,
    artista: artista || 'Desconhecido',
    capa: capa || '',
    source: source || 'local',
    tempoOuvido: tempoOuvido || 0,
    reproduzidaAteOFim: reproduzidaAteOFim || false
  })
}

const clearReproducoes = async (userId) => {
  return await Historico.deleteMany({ usuario: userId, tipo: 'reproducao' })
}

const deleteReproducaoById = async (userId, musicaId) => {
  return await Historico.deleteOne({
    usuario: userId,
    musicaId,
    tipo: 'reproducao'
  })
}

module.exports = {
  // Buscas
  getHistoricoByUser,
  addHistorico,
  clearHistorico,
  // 🔥 Reproduções
  getReproducoesByUser,
  addReproducao,
  clearReproducoes,
  deleteReproducaoById  // ← ADICIONAR
}