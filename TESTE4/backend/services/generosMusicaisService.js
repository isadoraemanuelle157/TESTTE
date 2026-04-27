const Genero = require('../models/generosMusicais')

// CRIAR
const createGenero = async (data) => {
  const { nome, descricao, categoria, icon, color } = data

  const genero = new Genero({
    nome,
    descricao,
    categoria: categoria || 'outros',
    icon,
    color
  })

  return await genero.save()
}

// LISTAR TODOS
const getGeneros = async () => {
  const generos = await Genero.find()
    .populate('musicas', '_id nome')
    .populate('albuns', '_id nome')
    .populate('cantores', '_id nome') // 🔥 NOVO

     const agrupado = {
    popular: [],
    regional: [],
    electronic: [],
    outros: []
  }

  generos.forEach(g => {
    const generoFormatado = {
      ...g._doc,
  quantidade: g.musicas?.length || 0,
totalAlbuns: g.albuns?.length || 0,
totalCantores: g.cantores?.length || 0
    }

    if (!agrupado[g.categoria]) {
  agrupado[g.categoria] = []
}

agrupado[g.categoria].push(generoFormatado)
  })

  // ordenar por popularidade
  Object.keys(agrupado).forEach(cat => {
    agrupado[cat].sort((a, b) => b.popularidade - a.popularidade)
  })

  return agrupado
}

// BUSCAR POR ID
const getGeneroById = async (id) => {
  return await Genero.findById(id)
}

// ATUALIZAR
const updateGenero = async (id, data) => {
  return await Genero.findByIdAndUpdate(id, data, { new: true })
}

// DELETAR
const deleteGenero = async (id) => {
  return await Genero.findByIdAndDelete(id)
}

module.exports = {
  createGenero,
  getGeneros,
  getGeneroById,
  updateGenero,
  deleteGenero
}