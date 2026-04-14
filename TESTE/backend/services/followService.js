const Follow = require('../models/Follow')
const Usuario = require('../models/Usuario')
const Cantor = require('../models/Cantor')
const mongoose = require('mongoose')

// SEGUIR (GENÉRICO)
const seguir = async (seguidor_id, seguindo_id, tipo) => {
  const tipoFormatado = tipo.toLowerCase()
  const tipoRef = tipoFormatado === 'cantor' ? 'Cantor' : 'Usuario'

  const existe = await Follow.findOne({
    seguidor_id,
    seguindo_id,
    tipo: tipoFormatado
  })

  if (existe) return existe

  const follow = await Follow.create({
    seguidor_id,
    seguindo_id,
    tipo: tipoFormatado,
    tipoRef
  })

  // 🔥 ATUALIZA USUARIO
  if (tipoFormatado === 'cantor') {
    await Usuario.findByIdAndUpdate(seguidor_id, {
      $addToSet: { seguindo: seguindo_id }
    })

    // 🔥 ATUALIZA CANTOR
    await Cantor.findByIdAndUpdate(seguindo_id, {
      $addToSet: { seguidores: seguidor_id }
    })
  }

  return follow
}
// DESSEGUIR
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
// QUEM SEGUE ALGUÉM
const getSeguidores = async (seguindo_id, tipo) => {
  return await Follow.find({ seguindo_id, tipo })
    .populate('seguidor_id', 'nome username avatar')
}

// QUEM O USUÁRIO SEGUE
// followService
const getSeguindo = async (seguidor_id, tipo = null) => {
  const filtro = { seguidor_id }

  if (tipo) {
    filtro.tipo = tipo.toLowerCase()
  }

  return await Follow.find(filtro)
    .populate('seguindo_id', 'nome username avatar foto generos')
    .sort({ createdAt: -1 })
}

// CONTADOR
const contarSeguidores = async (seguindo_id, tipo) => {
  return await Follow.countDocuments({ seguindo_id, tipo })
}

// VERIFICAR
const verificar = async (seguidor_id, seguindo_id, tipo) => {
  const existe = await Follow.findOne({ seguidor_id, seguindo_id, tipo })
  return !!existe
}

module.exports = {
  seguir,
  desseguir,
  getSeguidores,
  getSeguindo,
  contarSeguidores,
  verificar
}