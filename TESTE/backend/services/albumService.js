const Album = require('../models/Album')
const Cantor = require('../models/Cantor')
const Genero = require('../models/generosMusicais')
const Musica = require('../models/Musicas')

// CRIAR
const createAlbum = async (data) => {

  // 🔥 garante que cantor é único (não array)
  if (Array.isArray(data.cantor)) {
    data.cantor = data.cantor[0]
  }

  // 🔥 garante arrays
  if (data.generos && !Array.isArray(data.generos)) {
    data.generos = [data.generos]
  }

  if (data.musicas && !Array.isArray(data.musicas)) {
    data.musicas = [data.musicas]
  }

  const album = new Album(data)
  const savedAlbum = await album.save()

  // 🔥 Atualiza cantor
  if (data.cantor) {
    await Cantor.findByIdAndUpdate(
      data.cantor,
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  // 🔥 Atualiza generos
  if (data.generos?.length) {
    await Genero.updateMany(
      { _id: { $in: data.generos } },
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  // 🔥 Atualiza músicas
  if (data.musicas?.length) {
    await Musica.updateMany(
      { _id: { $in: data.musicas } },
      { $addToSet: { albuns: savedAlbum._id } }
    )
  }

  return savedAlbum
}

// LISTAR
const getAlbuns = async (cantor) => {
  let filtro = {}

  if (cantor) {
    filtro = { cantor }
  }

  return await Album.find(filtro)
    .populate('cantor', '_id nome') // 🔥 singular
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

  // garante cantor único
  if (Array.isArray(data.cantor)) {
    data.cantor = data.cantor[0]
  }

  if (!data.cantor) {
    data.cantor = oldAlbum.cantor
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

  // atualiza
  const updated = await Album.findByIdAndUpdate(id, data, { new: true })

  // adiciona novos vínculos
  if (data.cantor) {
    await Cantor.findByIdAndUpdate(
      data.cantor,
      { $addToSet: { albuns: id } }
    )
  }

  if (data.generos?.length) {
    await Genero.updateMany(
      { _id: { $in: data.generos } },
      { $addToSet: { albuns: id } }
    )
  }

  if (data.musicas?.length) {
    await Musica.updateMany(
      { _id: { $in: data.musicas } },
      { $addToSet: { albuns: id } }
    )
  }

  return updated
}
// DELETAR
const deleteAlbum = async (id) => {
  const album = await Album.findById(id)
  if (!album) return null

  // 🔥 remove do cantor
  if (album.cantor) {
    await Cantor.findByIdAndUpdate(
      album.cantor,
      { $pull: { albuns: id } }
    )
  }

  // 🔥 remove dos gêneros
  await Genero.updateMany(
    { _id: { $in: album.generos } },
    { $pull: { albuns: id } }
  )

  // 🔥 remove das músicas
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
  deleteAlbum
}