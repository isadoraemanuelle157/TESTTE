const Album = require('../models/Album')
const Cantor = require('../models/Cantor')
const Genero = require('../models/generosMusicais')
const Musica = require('../models/Musicas')

// CRIAR
const createAlbum = async (data) => {
  // Validação detalhada
  const erros = []
  
  if (!data.nome?.trim()) erros.push('Nome é obrigatório')
  if (!data.descricao?.trim()) erros.push('Descrição é obrigatória')
  if (!data.foto?.trim()) erros.push('Foto é obrigatória')
  if (!data.ano || isNaN(Number(data.ano))) erros.push('Ano deve ser um número válido')
  if (!data.cantor) erros.push('Cantor é obrigatório')
  if (!Array.isArray(data.musicas) || data.musicas.length === 0) erros.push('Selecione ao menos uma música')
  if (!Array.isArray(data.generos) || data.generos.length === 0) erros.push('Selecione ao menos um gênero')

  if (erros.length > 0) {
    throw new Error(erros.join(' | '))
  }

  // Normaliza cantor
  if (Array.isArray(data.cantor)) {
    data.cantor = data.cantor[0]
  }

  // Garante que ano é número
  data.ano = Number(data.ano)

  // Garante arrays
  if (!Array.isArray(data.generos)) data.generos = [data.generos].filter(Boolean)
  if (!Array.isArray(data.musicas)) data.musicas = [data.musicas].filter(Boolean)
      if (data.ano) {
    const inicio = Math.floor(Number(data.ano) / 10) * 10
    data.decada = `Anos ${inicio}`
  }

  const album = new Album(data)
  const savedAlbum = await album.save()

  // Atualiza cantor
  if (data.cantor) {
    await Cantor.findByIdAndUpdate(
      data.cantor,
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  // Atualiza generos
  if (data.generos?.length) {
    await Genero.updateMany(
      { _id: { $in: data.generos } },
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  // Atualiza músicas
  if (data.musicas?.length) {
    await Musica.updateMany(
      { _id: { $in: data.musicas } },
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  return savedAlbum
}

// SEARCH
const searchAlbuns = async (query) => {
  return await Album.find({
    nome: { $regex: query, $options: 'i' }
  })
  .populate('cantor', 'nome foto')
  .populate('musicas', 'nome')
}

// LISTAR
const getAlbuns = async (cantor) => {
  let filtro = {}

  if (cantor) {
    filtro = { cantor }
  }

  return await Album.find(filtro)
    .populate('cantor', '_id nome')
    .populate('musicas', '_id nome')
    .populate('generos', '_id nome')
}

// BUSCAR POR ID
const getAlbumById = async (id) => {
  return await Album.findById(id)
    .populate('cantor', '_id nome')
    .populate('musicas', '_id nome')
    .populate('generos', '_id nome')
}

// ATUALIZAR
const updateAlbum = async (id, data) => {
  const oldAlbum = await Album.findById(id)
  if (!oldAlbum) return null

  // Mesma validação do create
  const erros = []
  if (!data.nome?.trim()) erros.push('Nome é obrigatório')
  if (!data.descricao?.trim()) erros.push('Descrição é obrigatória')
  if (!data.foto?.trim()) erros.push('Foto é obrigatória')
  if (!data.ano || isNaN(Number(data.ano))) erros.push('Ano deve ser um número válido')
  if (!data.cantor) erros.push('Cantor é obrigatório')
  if (!Array.isArray(data.musicas) || data.musicas.length === 0) erros.push('Selecione ao menos uma música')
  if (!Array.isArray(data.generos) || data.generos.length === 0) erros.push('Selecione ao menos um gênero')

  if (erros.length > 0) {
    throw new Error(erros.join(' | '))
  }

  // Normaliza
  if (Array.isArray(data.cantor)) data.cantor = data.cantor[0]
  data.ano = Number(data.ano)
  if (!Array.isArray(data.generos)) data.generos = [data.generos].filter(Boolean)
  if (!Array.isArray(data.musicas)) data.musicas = [data.musicas].filter(Boolean)
     if (data.ano !== undefined) {
    const inicio = Math.floor(Number(data.ano) / 10) * 10
    data.decada = `Anos ${inicio}`
  }

  // validação obrigatória
  if (
    !data.nome?.trim() ||
    !data.descricao?.trim() ||
    !data.foto?.trim() ||
    !data.ano ||
    !data.cantor ||
    !data.musicas?.length ||
    !data.generos?.length
  ) {
    throw new Error(
      'Todos os campos são obrigatórios, incluindo músicas e gêneros'
    )
  }

  const oldGeneros = oldAlbum.generos || []
  const oldMusicas = oldAlbum.musicas || []

  // remove vínculos antigos
  if (oldAlbum.cantor) {
    await Cantor.findByIdAndUpdate(
      oldAlbum.cantor,
      { $pull: { albuns: id } }
    )
  }

  if (oldGeneros.length) {
    await Genero.updateMany(
      { _id: { $in: oldGeneros } },
      { $pull: { albuns: id } }
    )
  }

  if (oldMusicas.length) {
    await Musica.updateMany(
      { _id: { $in: oldMusicas } },
      { $pull: { albuns: id } }
    )
  }

  // atualiza com validações do mongoose
  const updated = await Album.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true
    }
  )
  .populate('cantor', '_id nome')
  .populate('musicas', '_id nome')
  .populate('generos', '_id nome')

  // recria vínculos
  await Cantor.findByIdAndUpdate(
    data.cantor,
    { $addToSet: { albuns: id } }
  )

  await Genero.updateMany(
    { _id: { $in: data.generos } },
    { $addToSet: { albuns: id } }
  )

  await Musica.updateMany(
    { _id: { $in: data.musicas } },
    { $addToSet: { albuns: id } }
  )

  return updated
}

// DELETAR
const deleteAlbum = async (id) => {
  const album = await Album.findById(id)
  if (!album) return null

  // remove do cantor
  if (album.cantor) {
    await Cantor.findByIdAndUpdate(
      album.cantor,
      { $pull: { albuns: id } }
    )
  }

  // remove dos gêneros
  await Genero.updateMany(
    { _id: { $in: album.generos } },
    { $pull: { albuns: id } }
  )

  // remove das músicas
  await Musica.updateMany(
    { _id: { $in: album.musicas } },
    { $pull: { albuns: id } }
  )

  return await Album.findByIdAndDelete(id)
}

module.exports = {
  createAlbum,
  getAlbuns,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  searchAlbuns 
}