const Vibe = require('../models/Vibe')

// validação reutilizável
const validarCampos = (data) => {
  if (!data.nome?.trim()) {
    throw new Error("Nome é obrigatório")
  }

  if (!data.emoji?.trim()) {
    throw new Error("Emoji é obrigatório")
  }

  if (!data.descricao?.trim()) {
    throw new Error("Descrição é obrigatória")
  }

  if (!data.gradient?.trim()) {
    throw new Error("Gradiente é obrigatório")
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    throw new Error("Adicione pelo menos uma tag")
  }
}

// criar
const createVibe = async (data) => {
  validarCampos(data)

  const vibe = new Vibe({
    nome: data.nome,
    emoji: data.emoji,
    descricao: data.descricao,
    gradient: data.gradient,
    tags: data.tags
  })

  return await vibe.save()
}

// listar
const getVibes = async () => {
  return await Vibe.find()
}

const getVibeById = async (id) => {
  return await Vibe.findById(id)
}

// atualizar
const updateVibe = async (id, data) => {

  validarCampos(data)

  return await Vibe.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true
    }
  )
}

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
