const Musica = require('../models/Musicas')
const Album = require('../models/Album')
const Cantor = require('../models/Cantor')

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

const createMusica = async (data) => {
  console.log('🔥 CREATE MUSICA RODANDO')

  const payload = {
    nome: data.nome?.trim(),
    duracao: data.duracao?.trim(),
    foto: data.foto?.trim(),
    humor: data.humor?.trim(),
    letra: data.letra?.trim(),
    link: data.link?.trim(),
    generos: normalizeIds(data.generos),
    albuns: normalizeIds(data.albuns),
    cantores: normalizeIds(data.cantores)
  }

  if (!payload.nome) throw new Error('Nome da música é obrigatório')
  if (!payload.duracao) throw new Error('Duração é obrigatória')
  if (!payload.foto) throw new Error('Foto é obrigatória')
  if (!payload.humor) throw new Error('Humor é obrigatório')
  if (!payload.letra) throw new Error('Letra é obrigatória')
  if (!payload.link) throw new Error('Link é obrigatório')

  const musica = await Musica.create(payload)

  // relaciona com álbuns se houver
  if (payload.albuns.length > 0) {
    await Album.updateMany(
      { _id: { $in: payload.albuns } },
      { $addToSet: { musicas: musica._id } }
    )
  }

  // relaciona com cantores se houver
  if (payload.cantores.length > 0) {
    await Cantor.updateMany(
      { _id: { $in: payload.cantores } },
      { $addToSet: { musicas: musica._id } }
    )
  }

  return musica
}

// LISTAR
const getMusicas = async () => {
  return await Musica.find()
    .populate('generos', 'nome _id')
    .populate('albuns', 'nome _id')
    .populate('cantores', 'nome _id')
}

const getMusicaById = async (id) => {
  return await Musica.findById(id)
    .populate('generos', 'nome')
    .populate('albuns', 'nome')
    .populate('cantores', 'nome')
}

const updateMusica = async (id, data) => {
  try {
    const musicaAntiga = await Musica.findById(id)
    if (!musicaAntiga) throw new Error('Música não encontrada')

    const payload = {
      nome: data.nome?.trim(),
      duracao: data.duracao?.trim(),
      foto: data.foto?.trim(),
      humor: data.humor?.trim(),
      letra: data.letra?.trim(),
      link: data.link?.trim(),
      generos: normalizeIds(data.generos),
      albuns: normalizeIds(data.albuns),
      cantores: normalizeIds(data.cantores)
    }

    // 🔥 REMOVE IDs inválidos
    payload.cantores = payload.cantores.filter(id => id)

    const cantoresAntigos = (musicaAntiga.cantores || []).map(id => id.toString())
    const cantoresNovos = payload.cantores.map(id => id.toString())

    // REMOVE antigos
    for (const cantorId of cantoresAntigos) {
      if (!cantoresNovos.includes(cantorId)) {
        await Cantor.findByIdAndUpdate(cantorId, {
          $pull: { musicas: id }
        })
      }
    }

    // ADICIONA novos
    for (const cantorId of cantoresNovos) {
      if (!cantoresAntigos.includes(cantorId)) {
        if (!cantorId) continue // 🔥 proteção

        await Cantor.findByIdAndUpdate(cantorId, {
          $addToSet: { musicas: id }
        })
      }
    }

    const musicaAtualizada = await Musica.findByIdAndUpdate(id, payload, { new: true })

    return await Musica.findById(musicaAtualizada._id)
      .populate('generos', 'nome _id')
      .populate('albuns', 'nome _id')
      .populate('cantores', 'nome _id')

  } catch (err) {
    console.error('🔥 ERRO NO UPDATE MUSICA:', err)
    throw err
  }
}
const searchMusicas = async (query) => {
  if (!query) return []

  return await Musica.find({
    nome: { $regex: query, $options: 'i' }
  })
    .populate('cantores', 'nome')
    .populate('albuns', 'nome')
    .limit(10)
}


const deleteMusica = async (id) => {
  const musica = await Musica.findById(id)
  if (!musica) return null

  if (musica.albuns?.length) {
    await Album.updateMany(
      { _id: { $in: musica.albuns } },
      { $pull: { musicas: id } }
    )
  }

  if (musica.cantores?.length) {
    await Cantor.updateMany(
      { _id: { $in: musica.cantores } },
      { $pull: { musicas: id } }
    )
  }

  return await Musica.findByIdAndDelete(id)
}

module.exports = {
  createMusica,
  getMusicas,
  getMusicaById,
  updateMusica,
  deleteMusica,
  searchMusicas
}
