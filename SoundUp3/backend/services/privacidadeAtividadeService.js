const PrivacidadeAtividade = require('../models/PrivacidadeAtividade')
const Follow = require('../models/Follow')

const RECURSOS_VALIDOS = [
  'curtidas',
  'playlists',
  'atividades',
  'seguidores',
  'seguindo',
  'estatisticas',
  'tudo'
]

const normalizarRecursos = (recursos = []) => {
  const lista = Array.isArray(recursos) ? recursos : [recursos]

  return [...new Set(
    lista
      .map(r => String(r).toLowerCase().trim())
      .filter(r => RECURSOS_VALIDOS.includes(r))
  )]
}

const listarPessoasRelacionadas = async (usuarioId) => {
  const [seguidores, seguindo] = await Promise.all([
    Follow.find({ seguindo_id: usuarioId, tipo: 'usuario' })
      .populate('seguidor_id', 'nome username avatar'),
    Follow.find({ seguidor_id: usuarioId, tipo: 'usuario' })
      .populate('seguindo_id', 'nome username avatar')
  ])

  const mapa = new Map()

  seguidores.forEach(item => {
    const user = item.seguidor_id
    if (!user) return

    const id = user._id.toString()

    if (!mapa.has(id)) {
      mapa.set(id, {
        id,
        nome: user.nome,
        username: user.username,
        avatar: user.avatar || null,
        origens: ['seguidor']
      })
    } else {
      mapa.get(id).origens.push('seguidor')
    }
  })

  seguindo.forEach(item => {
    const user = item.seguindo_id
    if (!user) return

    const id = user._id.toString()

    if (!mapa.has(id)) {
      mapa.set(id, {
        id,
        nome: user.nome,
        username: user.username,
        avatar: user.avatar || null,
        origens: ['seguindo']
      })
    } else {
      mapa.get(id).origens.push('seguindo')
    }
  })

  return Array.from(mapa.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  )
}

const listarRestricoes = async (usuarioId) => {
  return PrivacidadeAtividade.find({ usuarioDono: usuarioId })
    .populate('usuarioBloqueado', 'nome username avatar')
    .sort({ createdAt: -1 })
}

const validarRelacionamento = async (usuarioDonoId, usuarioBloqueadoId) => {
  const existe = await Follow.findOne({
    tipo: 'usuario',
    $or: [
      { seguidor_id: usuarioBloqueadoId, seguindo_id: usuarioDonoId },
      { seguidor_id: usuarioDonoId, seguindo_id: usuarioBloqueadoId }
    ]
  })

  return !!existe
}

const salvarRestricao = async (usuarioDonoId, usuarioBloqueadoId, recursos) => {
  if (String(usuarioDonoId) === String(usuarioBloqueadoId)) {
    throw new Error('Você não pode bloquear a si mesmo')
  }

  const relacionado = await validarRelacionamento(usuarioDonoId, usuarioBloqueadoId)
  if (!relacionado) {
    throw new Error('Só é possível configurar restrições para seguidores ou seguindo')
  }

  const recursosNormalizados = normalizarRecursos(recursos)

  if (recursosNormalizados.length === 0) {
    await PrivacidadeAtividade.findOneAndDelete({
      usuarioDono: usuarioDonoId,
      usuarioBloqueado: usuarioBloqueadoId
    })
    return null
  }

  const restricao = await PrivacidadeAtividade.findOneAndUpdate(
    {
      usuarioDono: usuarioDonoId,
      usuarioBloqueado: usuarioBloqueadoId
    },
    {
      recursos: recursosNormalizados
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).populate('usuarioBloqueado', 'nome username avatar')

  return restricao
}

const salvarRestricoesEmLote = async (usuarioDonoId, items = []) => {
  const resultados = []

  for (const item of items) {
    const salvo = await salvarRestricao(
      usuarioDonoId,
      item.usuarioBloqueadoId,
      item.recursos || []
    )

    if (salvo) resultados.push(salvo)
  }

  return resultados
}

const removerRestricao = async (usuarioDonoId, usuarioBloqueadoId) => {
  return PrivacidadeAtividade.findOneAndDelete({
    usuarioDono: usuarioDonoId,
    usuarioBloqueado: usuarioBloqueadoId
  })
}

const estaBloqueado = async (usuarioDonoId, viewerId, recurso) => {
  if (!viewerId) return false
  if (String(usuarioDonoId) === String(viewerId)) return false

  const restricao = await PrivacidadeAtividade.findOne({
    usuarioDono: usuarioDonoId,
    usuarioBloqueado: viewerId
  }).lean()

  if (!restricao) return false

  return (
    restricao.recursos.includes('tudo') ||
    restricao.recursos.includes(recurso)
  )
}

module.exports = {
  listarPessoasRelacionadas,
  listarRestricoes,
  salvarRestricao,
  salvarRestricoesEmLote,
  removerRestricao,
  estaBloqueado
}
