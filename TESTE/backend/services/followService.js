const Follow = require('../models/Follow')

// SEGUIR
const seguirCantor = async (usuario_id, cantor_id) => {
  return await Follow.create({ usuario_id, cantor_id })
}

// DESSEGUIR
const desseguirCantor = async (usuario_id, cantor_id) => {
  return await Follow.findOneAndDelete({ usuario_id, cantor_id })
}

// SEGUIDORES DO CANTOR
const getSeguidores = async (cantor_id) => {
  return await Follow.find({ cantor_id })
    .populate('usuario_id', 'nome username avatar')
}

// QUEM O USUÁRIO SEGUE
const getSeguindo = async (usuario_id) => {
  return await Follow.find({ usuario_id })
    .populate('cantor_id', 'nome foto')
}

// CONTADOR
const contarSeguidores = async (cantor_id) => {
  return await Follow.countDocuments({ cantor_id })
}

// VERIFICAR SE SEGUE
const verificar = async (usuario_id, cantor_id) => {
  const existe = await Follow.findOne({ usuario_id, cantor_id })
  return !!existe
}

module.exports = {
  seguirCantor,
  desseguirCantor,
  getSeguidores,
  getSeguindo,
  contarSeguidores,
  verificar
}