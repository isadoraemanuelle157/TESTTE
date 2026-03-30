const Cantor = require('../models/Cantor')
const Album = require('../models/Album')
const Genero = require('../models/generosMusicais')
const Musica = require('../models/Musicas')

const createCantor = async (data) => {
  if (data.generos && !Array.isArray(data.generos)) {
    data.generos = [data.generos]
  }

  const cantor = new Cantor(data)
  const savedCantor = await cantor.save()

  // 🔥 RELACIONAR MUSICAS (FALTANDO)
if (data.musicas?.length) {
  for (const musicaId of data.musicas) {
    await Musica.findByIdAndUpdate(musicaId, {
      $addToSet: { cantores: savedCantor._id }
    })
  }
}

  // 🔥 generos (já tem)
  if (data.generos?.length) {
    await Genero.updateMany(
      { _id: { $in: data.generos } },
      { $addToSet: { cantores: savedCantor._id } }
    )
  }

  return savedCantor
}

// LISTAR
const getCantores = async () => {
  return await Cantor.find()
   .populate('generos', '_id nome') // 🔥 NOVO
    .populate({
      path: 'albuns',
      select: '_id nome musicas',
      populate: {
        path: 'musicas',
        model: 'Musica',
        select: '_id nome'
      }
    })
    .populate('musicas', '_id nome') // 🔥 NOVO
}
// BUSCAR POR ID
const getCantorById = async (id) => {
  return await Cantor.findById(id)
    .populate({
      path: 'albuns',
      select: '_id nome musicas',
      populate: {
        path: 'musicas',
        model: 'Musica',
        select: '_id nome'
      }
    })
}
// BUSCAR POR NOME
const getCantorByNome = async (nome) => {
  return await Cantor.findOne({ nome })
}

// ATUALIZAR
const updateCantor = async (id, data) => {
  const Musica = require('../models/Musicas')

  const cantorAntigo = await Cantor.findById(id)

  const musicasAntigas = cantorAntigo.musicas?.map(m => m.toString()) || []
  const musicasNovas = data.musicas || []

  // 🔥 REMOVE das antigas
  for (const musicaId of musicasAntigas) {
    if (!musicasNovas.includes(musicaId)) {
      await Musica.findByIdAndUpdate(musicaId, {
        $pull: { cantores: id }
      })
    }
  }

  // 🔥 ADICIONA nas novas
  for (const musicaId of musicasNovas) {
    if (!musicasAntigas.includes(musicaId)) {
      await Musica.findByIdAndUpdate(musicaId, {
        $addToSet: { cantores: id }
      })
    }
  }

  // 🔥 AGORA SIM atualiza cantor
  return await Cantor.findByIdAndUpdate(id, data, { new: true })
}


// DELETAR
const deleteCantor = async (id) => {
  return await Cantor.findByIdAndDelete(id)
}

const addAlbumToCantor = async (cantorId, albumId) => {
  return await Cantor.findByIdAndUpdate(
    cantorId,
    {
      $addToSet: { albuns: albumId }
    },
    { new: true }
  )
}

module.exports = {
  createCantor,
  getCantores,
  getCantorById,
  getCantorByNome,
  updateCantor,
  deleteCantor
}