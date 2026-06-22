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

// ========== 🔥 ESTATÍSTICAS MENSAIS ==========

const getHorasOuvidasEsteMes = async (userId) => {
  const agora = new Date()
  const inicioDoMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  
  const reproducoes = await Historico.find({
    usuario: userId,
    tipo: 'reproducao',
    createdAt: { $gte: inicioDoMes }
  })
  
  // Soma tempoOuvido (em ms) e converte para horas
  const totalMs = reproducoes.reduce((sum, r) => sum + (r.tempoOuvido || 0), 0)
  return Math.round(totalMs / (1000 * 60 * 60)) // horas arredondadas
}

// ========== 🔥 SEQUÊNCIA (STREAK) ==========

const getSequenciaAtual = async (userId) => {
  const reproducoes = await Historico.find({
    usuario: userId,
    tipo: 'reproducao'
  })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .lean()

  if (reproducoes.length === 0) return 0

  // Extrair datas únicas (apenas dia/mês/ano)
  const diasComReproducao = new Set()
  reproducoes.forEach(r => {
    const data = new Date(r.createdAt)
    const chave = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`
    diasComReproducao.add(chave)
  })

  const diasArray = Array.from(diasComReproducao).sort().reverse()
  
  if (diasArray.length === 0) return 0

  let sequencia = 0
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  const hojeStr = `${hoje.getFullYear()}-${hoje.getMonth()}-${hoje.getDate()}`
  const ontemStr = `${ontem.getFullYear()}-${ontem.getMonth()}-${ontem.getDate()}`

  // Verifica se ouviu hoje ou ontem (streak só conta se ouviu recentemente)
  const ultimoDia = diasArray[0]
  if (ultimoDia !== hojeStr && ultimoDia !== ontemStr) {
    return 0 // Streak quebrado
  }

  // Conta dias consecutivos
  for (let i = 0; i < diasArray.length; i++) {
    if (i === 0) {
      sequencia = 1
      continue
    }

    const dataAtual = diasArray[i - 1].split('-').map(Number)
    const dataAnterior = diasArray[i].split('-').map(Number)

    const dAtual = new Date(dataAtual[0], dataAtual[1], dataAtual[2])
    const dAnterior = new Date(dataAnterior[0], dataAnterior[1], dataAnterior[2])

    const diffMs = dAtual - dAnterior
    const diffDias = diffMs / (1000 * 60 * 60 * 24)

    if (diffDias === 1) {
      sequencia++
    } else {
      break
    }
  }

  return sequencia
}

module.exports = {
  // Buscas
  getHistoricoByUser,
  addHistorico,
  clearHistorico,
  // Reproduções
  getReproducoesByUser,
  addReproducao,
  clearReproducoes,
  deleteReproducaoById,
  // Estatísticas
  getHorasOuvidasEsteMes,
  getSequenciaAtual  // ← ADICIONAR
}