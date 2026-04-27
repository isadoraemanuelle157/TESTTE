const Vibe = require('../models/Vibe')

// criar
const createVibe = async (data) => {
  if (!data.nome) throw new Error("Nome da vibe é obrigatório")

  const vibe = new Vibe({
    nome: data.nome,
    emoji: data.emoji,
    descricao: data.descricao,
    gradient: data.gradient,
    tags: data.tags || []
  })

  return await vibe.save()
}

// listar
const getVibes = async () => {
  return await Vibe.find()
}

// buscar por id
const getVibeById = async (id) => {
  return await Vibe.findById(id)
}

// atualizar
const updateVibe = async (id, data) => {
  return await Vibe.findByIdAndUpdate(id, data, { new: true })
}

// deletar
const deleteVibe = async (id) => {
  return await Vibe.findByIdAndDelete(id)
}

module.exports = {
  createVibe,
  getVibes,
  getVibeById,
  updateVibe,
  deleteVibe
}