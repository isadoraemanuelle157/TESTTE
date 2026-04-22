const Cantor = require('../models/Cantor')
const Album = require('../models/Album')
const Genero = require('../models/generosMusicais')
const Musica = require('../models/Musicas')
const Usuario = require('../models/Usuario')

const normalizeIds = (value) => {
  if (!value) return []

  const arr = Array.isArray(value) ? value : [value]

  return arr
    .map(item => {
      if (!item) return null
      if (typeof item === 'object') return item._id || null
      return item
    })
    .filter(Boolean)
}


const parseSeguidores = (value) => {
  if (value === undefined || value === null || value === '') return 0

  if (typeof value === 'number') {
    return Math.max(0, Math.floor(value))
  }

  const raw = String(value).trim().toLowerCase().replace(/\s/g, '')
  const normalized = raw.replace(/\./g, '').replace(',', '.')

  if (normalized.endsWith('k')) {
    const num = parseFloat(normalized.slice(0, -1))
    return Number.isNaN(num) ? 0 : Math.round(num * 1000)
  }

  if (normalized.endsWith('m')) {
    const num = parseFloat(normalized.slice(0, -1))
    return Number.isNaN(num) ? 0 : Math.round(num * 1000000)
  }

  const num = Number(normalized)
  return Number.isNaN(num) ? 0 : Math.max(0, Math.floor(num))
}

const searchCantores = async (query) => {
  return await Cantor.find({
    nome: { $regex: query, $options: 'i' }
  })
  .populate('albuns', 'nome foto')
  .populate('musicas', 'nome')
}

const createCantor = async (data) => {
  const payload = {
    nome: data.nome?.trim(),
    foto: data.foto?.trim?.() || data.foto || '',
    generos: normalizeIds(data.generos),
    musicas: normalizeIds(data.musicas),
    albuns: normalizeIds(data.albuns),
     seguidoresBase: parseSeguidores(data.seguidoresBase ?? data.seguidores)
  }

  if (!payload.nome) {
    throw new Error('Nome do cantor é obrigatório')
  }

  const cantor = new Cantor(payload)
  const savedCantor = await cantor.save()

  if (payload.musicas.length) {
    await Musica.updateMany(
      { _id: { $in: payload.musicas } },
      { $addToSet: { cantores: savedCantor._id } }
    )
  }

  if (payload.generos.length) {
    await Genero.updateMany(
      { _id: { $in: payload.generos } },
      { $addToSet: { cantores: savedCantor._id } }
    )
  }

  return savedCantor
}

const getCantores = async () => {
  return await Cantor.find()
    .populate('generos', '_id nome')
    .populate({
      path: 'albuns',
      select: '_id nome musicas',
      populate: {
        path: 'musicas',
        model: 'Musica',
        select: '_id nome'
      }
    })
    .populate('musicas', '_id nome')
}

const getCantorById = async (id) => {
  return await Cantor.findById(id)
    .populate('generos', '_id nome')
    .populate('musicas', '_id nome')
.populate({
  path: 'albuns',
  select: '_id nome descricao foto musicas',
  populate: {
    path: 'musicas',
    model: 'Musica',
    select: '_id nome'
  }
})
}

const getCantorByNome = async (nome) => {
  return await Cantor.findOne({ nome })
}

const updateCantor = async (id, data) => {
  const cantorAntigo = await Cantor.findById(id)
  if (!cantorAntigo) throw new Error('Cantor não encontrado')

  const payload = {
    nome: data.nome?.trim(),
    foto: data.foto?.trim?.() || data.foto || '',
    generos: normalizeIds(data.generos),
    musicas: normalizeIds(data.musicas),
    albuns: normalizeIds(data.albuns),
    seguidoresBase: parseSeguidores(data.seguidoresBase ?? data.seguidores ?? cantorAntigo.seguidoresBase)
  }

  const musicasAntigas = (cantorAntigo.musicas || []).map(m => m.toString())
  const musicasNovas = payload.musicas.map(m => m.toString())

  for (const musicaId of musicasAntigas) {
    if (!musicasNovas.includes(musicaId)) {
      await Musica.findByIdAndUpdate(musicaId, {
        $pull: { cantores: id }
      })
    }
  }

  for (const musicaId of musicasNovas) {
    if (!musicasAntigas.includes(musicaId)) {
      await Musica.findByIdAndUpdate(musicaId, {
        $addToSet: { cantores: id }
      })
    }
  }

  return await Cantor.findByIdAndUpdate(id, payload, { new: true })
}

const deleteCantor = async (id) => {
  await Musica.updateMany(
    { cantores: id },
    { $pull: { cantores: id } }
  )

  await Genero.updateMany(
    { cantores: id },
    { $pull: { cantores: id } }
  )

  await Album.updateMany(
    { cantores: id },
    { $pull: { cantores: id } }
  )

  return await Cantor.findByIdAndDelete(id)
}

const addAlbumToCantor = async (cantorId, albumId) => {
  return await Cantor.findByIdAndUpdate(
    cantorId,
    { $addToSet: { albuns: albumId } },
    { new: true }
  )
}
const seguirCantor = async (cantorId, usuarioId) => {
  const cantor = await Cantor.findById(cantorId)
  if (!cantor) throw new Error('Cantor não encontrado')

  const usuario = await Usuario.findById(usuarioId)
  if (!usuario) throw new Error('Usuário não encontrado')

  await Cantor.findByIdAndUpdate(
    cantorId,
    { $addToSet: { seguidores: usuarioId } },
    { new: true }
  )

  await Usuario.findByIdAndUpdate(
    usuarioId,
    { $addToSet: { seguindo: cantorId } },
    { new: true }
  )

  return await Cantor.findById(cantorId)
}

const deixarSeguirCantor = async (cantorId, usuarioId) => {
  const cantor = await Cantor.findById(cantorId)
  if (!cantor) throw new Error('Cantor não encontrado')

  const usuario = await Usuario.findById(usuarioId)
  if (!usuario) throw new Error('Usuário não encontrado')

  await Cantor.findByIdAndUpdate(
    cantorId,
    { $pull: { seguidores: usuarioId } },
    { new: true }
  )

  await Usuario.findByIdAndUpdate(
    usuarioId,
    { $pull: { seguindo: cantorId } },
    { new: true }
  )

  return await Cantor.findById(cantorId)
}

module.exports = {
  createCantor,
  getCantores,
  getCantorById,
  getCantorByNome,
  updateCantor,
  deleteCantor,
  searchCantores,
   addAlbumToCantor,
  seguirCantor,
  deixarSeguirCantor
}
