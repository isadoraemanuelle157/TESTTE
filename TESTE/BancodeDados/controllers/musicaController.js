const musicaService = require('../services/musicaService')
const Genero = require('../models/generosMusicais')

// CRIAR
const create = async (req, res) => {
  try {
    const musica = await musicaService.createMusica(req.body)

    // adiciona no gênero
    if (req.body.generos && req.body.generos.length > 0) {
  for (const generoId of req.body.generos) {
    await Genero.findByIdAndUpdate(generoId, {
      $addToSet: { musicas: musica._id }
    })
  }
}

    res.status(201).json({ message: "Música criada", musica })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LISTAR
const list = async (req, res) => {
  try {
    const musicas = await musicaService.getMusicas()
    res.json(musicas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const musica = await musicaService.getMusicaById(req.params.id)

    if (!musica) {
      return res.status(404).json({ message: "Música não encontrada" })
    }

    res.json(musica)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ATUALIZAR
const update = async (req, res) => {
  try {
    const musicaAntiga = await musicaService.getMusicaById(req.params.id)

    const musica = await musicaService.updateMusica(req.params.id, req.body)

    // =========================
    // 🎧 GENEROS
    // =========================

   if (req.body.generos) {

  const generosAntigos = musicaAntiga.generos?.map(g =>
    g._id ? g._id.toString() : g.toString()
  ) || []

  const generosNovos = req.body.generos

  for (const generoId of generosAntigos) {
    if (!generosNovos.includes(generoId)) {
      await Genero.findByIdAndUpdate(generoId, {
        $pull: { musicas: musica._id }
      })
    }
  }

  for (const generoId of generosNovos) {
    if (!generosAntigos.includes(generoId)) {
      await Genero.findByIdAndUpdate(generoId, {
        $addToSet: { musicas: musica._id }
      })
    }
  }

}
console.log("BODY:", req.body)
console.log("ANTIGOS:", generosAntigos)
console.log("NOVOS:", generosNovos)


    // =========================
    // 💿 ALBUNS
    // =========================

    const albunsAntigos = musicaAntiga.albuns?.map(a =>
  a._id ? a._id.toString() : a.toString()
) || []

    const albunsNovos = req.body.albuns || []

    const Album = require('../models/Album')

    for (const albumId of albunsAntigos) {
      if (!albunsNovos.includes(albumId)) {
        await Album.findByIdAndUpdate(albumId, {
          $pull: { musicas: musica._id }
        })
      }
    }

    for (const albumId of albunsNovos) {
      if (!albunsAntigos.includes(albumId)) {
        await Album.findByIdAndUpdate(albumId, {
          $addToSet: { musicas: musica._id }
        })
      }
    }

    // =========================
    // 🎤 CANTORES
    // =========================

    const cantoresAntigos = musicaAntiga.cantores?.map(c =>
  c._id ? c._id.toString() : c.toString()
) || []

    const cantoresNovos = req.body.cantores || []

    const Cantor = require('../models/Cantor')

    for (const cantorId of cantoresAntigos) {
      if (!cantoresNovos.includes(cantorId)) {
        await Cantor.findByIdAndUpdate(cantorId, {
          $pull: { musicas: musica._id }
        })
      }
    }

    for (const cantorId of cantoresNovos) {
      if (!cantoresAntigos.includes(cantorId)) {
        await Cantor.findByIdAndUpdate(cantorId, {
          $addToSet: { musicas: musica._id }
        })
      }
    }

    res.json({ message: "Música atualizada", musica })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// DELETAR
const remove = async (req, res) => {
  try {
    const musica = await musicaService.getMusicaById(req.params.id)

    if (!musica) {
      return res.status(404).json({ message: "Música não encontrada" })
    }

    // 🔥 remove do gênero antes de deletar
   if (musica.generos) {
  for (const generoId of musica.generos) {
    await Genero.findByIdAndUpdate(generoId, {
      $pull: { musicas: musica._id }
    })
  }
}
    await musicaService.deleteMusica(req.params.id)

    res.json({ message: "Música removida" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove
}