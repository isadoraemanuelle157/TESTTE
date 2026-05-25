const Follow = require('../models/Follow')
const Usuario = require('../models/Usuario')
const Cantor = require('../models/Cantor')
const notificacaoService = require('./notificacaoService')

// SEGUIR
const seguir = async (seguidor_id, seguindo_id, tipo) => {
  const tipoFormatado = tipo.toLowerCase()
  const tipoRef = tipoFormatado === 'cantor' ? 'Cantor' : 'Usuario'

  if (String(seguidor_id) === String(seguindo_id)) {
    throw new Error('Não pode seguir a si mesmo')
  }

  if (tipoFormatado === 'cantor') {
    const existe = await Follow.findOne({ seguidor_id, seguindo_id, tipo: tipoFormatado })
    if (existe) return { follow: existe, direto: true, solicitado: false }

    const follow = await Follow.create({
      seguidor_id,
      seguindo_id,
      tipo: tipoFormatado,
      tipoRef
    })

    await Usuario.findByIdAndUpdate(seguidor_id, {
      $addToSet: { seguindo: seguindo_id }
    })

    await Cantor.findByIdAndUpdate(seguindo_id, {
      $addToSet: { seguidores: seguidor_id }
    })

    return { follow, direto: true, solicitado: false }
  }

  const usuario = await Usuario.findById(seguindo_id)
  if (!usuario) throw new Error('Usuário não encontrado')

  const jaSegue = await Follow.findOne({
    seguidor_id,
    seguindo_id,
    tipo: 'usuario'
  })

  if (jaSegue) {
    return { follow: jaSegue, direto: true, solicitado: false }
  }

  // PERFIL PRIVADO => SOLICITAÇÃO
  if (usuario.perfilPrivado) {
    const jaSolicitou = usuario.solicitacoesSeguir?.find(
      s => String(s.usuario) === String(seguidor_id) && s.status === 'pendente'
    )

    if (jaSolicitou) {
      throw new Error('Solicitação já enviada')
    }

    usuario.solicitacoesSeguir.push({
      usuario: seguidor_id,
      status: 'pendente'
    })

    await usuario.save()

    await notificacaoService.criar({
      usuarioDestino: seguindo_id,
      usuarioOrigem: seguidor_id,
      tipo: 'follow_request',
      mensagem: 'quer seguir você e pediu acesso ao seu perfil privado'
    })

    return {
      solicitado: true,
      direto: false
    }
  }

  const follow = await Follow.create({
    seguidor_id,
    seguindo_id,
    tipo: 'usuario',
    tipoRef
  })

  return { follow, direto: true, solicitado: false }
}

const desseguir = async (seguidor_id, seguindo_id, tipo) => {
  const deleted = await Follow.findOneAndDelete({
    seguidor_id,
    seguindo_id,
    tipo: tipo.toLowerCase()
  })

  if (tipo.toLowerCase() === 'cantor') {
    await Usuario.findByIdAndUpdate(seguidor_id, {
      $pull: { seguindo: seguindo_id }
    })

    await Cantor.findByIdAndUpdate(seguindo_id, {
      $pull: { seguidores: seguidor_id }
    })
  }

  return deleted
}

const getSeguidores = async (seguindo_id, tipo) => {
  return Follow.find({ seguindo_id, tipo })
    .populate('seguidor_id', 'nome username avatar')
}

const getSeguindo = async (seguidor_id, tipo = null) => {
  const filtro = { seguidor_id }

  if (tipo) filtro.tipo = tipo.toLowerCase()

  return Follow.find(filtro)
    .populate('seguindo_id', 'nome username avatar foto generos')
    .sort({ createdAt: -1 })
}

const contarSeguidores = async (seguindo_id, tipo) => {
  return Follow.countDocuments({ seguindo_id, tipo })
}

const verificar = async (seguidor_id, seguindo_id, tipo) => {
  const existe = await Follow.findOne({ seguidor_id, seguindo_id, tipo })
  return !!existe
}

const aceitarSolicitacao = async (usuarioLogadoId, solicitanteId) => {
  const user = await Usuario.findById(usuarioLogadoId)
  if (!user) throw new Error('Usuário não encontrado')

  const solicitacao = user.solicitacoesSeguir.find(
    s => String(s.usuario) === String(solicitanteId) && s.status === 'pendente'
  )

  if (!solicitacao) throw new Error('Solicitação não encontrada')

  solicitacao.status = 'aceito'

  let follow = await Follow.findOne({
    seguidor_id: solicitanteId,
    seguindo_id: usuarioLogadoId,
    tipo: 'usuario'
  })

  if (!follow) {
    follow = await Follow.create({
      seguidor_id: solicitanteId,
      seguindo_id: usuarioLogadoId,
      tipo: 'usuario',
      tipoRef: 'Usuario'
    })
  }

  await user.save()

  await notificacaoService.criar({
    usuarioDestino: solicitanteId,
    usuarioOrigem: usuarioLogadoId,
    tipo: 'follow_accept',
    mensagem: 'aceitou sua solicitação e liberou acesso ao perfil'
  })

  return follow
}

module.exports = {
  seguir,
  desseguir,
  getSeguidores,
  getSeguindo,
  contarSeguidores,
  verificar,
  aceitarSolicitacao
}
