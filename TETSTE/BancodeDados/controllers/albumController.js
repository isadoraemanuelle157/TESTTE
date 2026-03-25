const albumService = require('../services/albumService')

// CRIAR
const create = async (req, res) => {
  try {
    const album = await albumService.createAlbum(req.body)
    res.status(201).json({ message: "Álbum criado", album })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LISTAR
const list = async (req, res) => {
  try {
    const albuns = await albumService.getAlbuns()
    res.json(albuns)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const album = await albumService.getAlbumById(req.params.id)

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" })
    }

    res.json(album)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ATUALIZAR
const update = async (req, res) => {
  try {
    const album = await albumService.updateAlbum(req.params.id, req.body)

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" })
    }

    res.json({ message: "Álbum atualizado", album })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETAR
const remove = async (req, res) => {
  try {
    const album = await albumService.deleteAlbum(req.params.id)

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" })
    }

    res.json({ message: "Álbum removido" })
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