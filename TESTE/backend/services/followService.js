const Follow = require('../models/Follow')

// SEGUIR (GENÉRICO)
const seguir = async (seguidor_id, seguindo_id, tipo) => {
  return await Follow.create({ seguidor_id, seguindo_id, tipo })
}

// DESSEGUIR
const desseguir = async (seguidor_id, seguindo_id, tipo) => {
  return await Follow.findOneAndDelete({ seguidor_id, seguindo_id, tipo })
}

// QUEM SEGUE ALGUÉM
const getSeguidores = async (seguindo_id, tipo) => {
  return await Follow.find({ seguindo_id, tipo })
    .populate('seguidor_id', 'nome username avatar')
}

// QUEM O USUÁRIO SEGUE
// followService
const getSeguindo = async (seguidor_id) => {
  return await Follow.find({ seguidor_id })
    .populate('seguindo_id', 'nome username avatar')
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