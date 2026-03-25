const musicaService = require('../services/musicaService')
const Genero = require('../models/generosMusicais')

// CRIAR
const create = async (req, res) => {
  try {
    const musica = await musicaService.createMusica(req.body)

    // adiciona no gênero
    if (req.body.generoId) {
      await Genero.findByIdAndUpdate(req.body.generoId, {
        $push: { musicas: musica._id }
      })
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

    // 🔥 se mudou de gênero
    if (req.body.generoId && musicaAntiga.generoId != req.body.generoId) {

      // remove do antigo
      if (musicaAntiga.generoId) {
        await Genero.findByIdAndUpdate(musicaAntiga.generoId, {
          $pull: { musicas: musica._id }
        })
      }

      // adiciona no novo
      await Genero.findByIdAndUpdate(req.body.generoId, {
        $push: { musicas: musica._id }
      })
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
    if (musica.generoId) {
      await Genero.findByIdAndUpdate(musica.generoId, {
        $pull: { musicas: musica._id }
      })
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