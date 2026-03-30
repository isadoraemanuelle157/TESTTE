const Musica = require('../models/Musicas')
const Album = require('../models/Album')
const Cantor = require('../models/Cantor')

const createMusica = async (data) => {
  console.log("🔥 CREATE MUSICA RODANDO")

  // 🔥 SE TEM ÁLBUNS
  if (data.albuns && data.albuns.length > 0) {
    const album = await Album.findById(data.albuns[0])

    if (!album) throw new Error("Álbum não encontrado")

    if (!album.cantores || album.cantores.length === 0) {
      throw new Error("Álbum sem cantor")
    }

    // 🔥 define cantores baseado no álbum (opcional)
    data.cantores = album.cantores
  }

  // 🔥 valida cantor
  if (!data.cantores || data.cantores.length === 0) {
    throw new Error("Pelo menos um cantor é obrigatório")
  }

  const musica = await Musica.create(data)

  // 🔥 adiciona nos álbuns
  if (data.albuns) {
    for (const albumId of data.albuns) {
      await Album.findByIdAndUpdate(albumId, {
        $addToSet: { musicas: musica._id }
      })
    }
  }

  // 🔥 adiciona nos cantores
  for (const cantorId of data.cantores) {
    await Cantor.findByIdAndUpdate(cantorId, {
      $addToSet: { musicas: musica._id }
    })
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

// ATUALIZAR
const updateMusica = async (id, data) => {
  return await Musica.findByIdAndUpdate(id, data, { new: true })
}

// DELETAR
const deleteMusica = async (id) => {
  return await Musica.findByIdAndDelete(id)
}

module.exports = {
  createMusica,
  getMusicas,
  getMusicaById,
  updateMusica,
  deleteMusica
}