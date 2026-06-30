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
// LISTAR
const getAlbuns = async (cantor) => {
  let filtro = {}

  if (cantor) {
    filtro = { cantor }
  }

  const albuns = await Album.find(filtro)
    .populate('cantor', '_id nome')
    .populate('musicas', '_id nome')
    .populate('generos', '_id nome')

  // 🔥 GARANTE QUE musicas E generos SEMPRE SEJAM ARRAYS
  return albuns.map(album => ({
    ...album.toObject(),
    musicas: album.musicas || [],
    generos: album.generos || []
  }))
}

// BUSCAR POR ID
// BUSCAR POR ID
const getAlbumById = async (id) => {
  const album = await Album.findById(id)
    .populate('cantor', '_id nome')
    .populate('musicas', '_id nome')
    .populate('generos', '_id nome')
  
  if (!album) return null
  
  // 🔥 GARANTE ARRAYS
  album.musicas = album.musicas || []
  album.generos = album.generos || []
  
  return album
}
// ATUALIZAR
const updateAlbum = async (id, data) => {
  const oldAlbum = await Album.findById(id)
  if (!oldAlbum) return null

  // Monta payload apenas com campos enviados (flexível para update parcial)
  const payload = {}

  if (data.nome !== undefined) payload.nome = data.nome?.trim?.() || data.nome
  if (data.descricao !== undefined) payload.descricao = data.descricao?.trim?.() || data.descricao
  if (data.foto !== undefined) payload.foto = data.foto?.trim?.() || data.foto || ''
  if (data.ano !== undefined) {
    payload.ano = Number(data.ano) || null
    if (payload.ano) {
      const inicio = Math.floor(payload.ano / 10) * 10
      payload.decada = `Anos ${inicio}`
    }
  }
  if (data.cantor !== undefined) payload.cantor = Array.isArray(data.cantor) ? data.cantor[0] : data.cantor
  if (data.generos !== undefined) payload.generos = Array.isArray(data.generos) ? data.generos : [data.generos].filter(Boolean)
  if (data.musicas !== undefined) payload.musicas = Array.isArray(data.musicas) ? data.musicas : [data.musicas].filter(Boolean)

 // Validação mais robusta para UPDATE
const camposEnviados = Object.keys(payload).length > 0

// Se está enviando arrays, garante que não estão vazios
if (payload.generos !== undefined && payload.generos.length === 0) {
  throw new Error('Selecione ao menos um gênero')
}
if (payload.musicas !== undefined && payload.musicas.length === 0) {
  throw new Error('Selecione ao menos uma música')
}

  // Se não enviou generos/musicas, mantém os antigos
  if (payload.generos === undefined && oldAlbum.generos) payload.generos = oldAlbum.generos
  if (payload.musicas === undefined && oldAlbum.musicas) payload.musicas = oldAlbum.musicas

  const oldGeneros = (oldAlbum.generos || []).map(g => g.toString())
  const oldMusicas = (oldAlbum.musicas || []).map(m => m.toString())
  const newGeneros = (payload.generos || []).map(g => g.toString())
  const newMusicas = (payload.musicas || []).map(m => m.toString())

  // Remove vínculos antigos
  if (oldAlbum.cantor && payload.cantor && String(oldAlbum.cantor) !== String(payload.cantor)) {
    await Cantor.findByIdAndUpdate(oldAlbum.cantor, { $pull: { albuns: id } })
  }

  if (oldGeneros.length) {
    await Genero.updateMany(
      { _id: { $in: oldGeneros.filter(g => !newGeneros.includes(g)) } },
      { $pull: { albuns: id } }
    )
  }

  if (oldMusicas.length) {
    await Musica.updateMany(
      { _id: { $in: oldMusicas.filter(m => !newMusicas.includes(m)) } },
      { $pull: { albuns: id } }
    )
  }

  // Atualiza álbum
  const updated = await Album.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate('cantor', '_id nome')
    .populate('musicas', '_id nome')
    .populate('generos', '_id nome')

  // Recria vínculos
  if (payload.cantor) {
    await Cantor.findByIdAndUpdate(payload.cantor, { $addToSet: { albuns: id } })
  }

  if (newGeneros.length) {
    await Genero.updateMany(
      { _id: { $in: newGeneros } },
      { $addToSet: { albuns: id } }
    )
  }

  if (newMusicas.length) {
    await Musica.updateMany(
      { _id: { $in: newMusicas } },
      { $addToSet: { albuns: id } }
    )
  }

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