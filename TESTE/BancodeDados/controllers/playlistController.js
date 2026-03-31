const playlistService = require('../services/playlistService')

// CRIAR
const create = async (req, res) => {
  try {
    const playlist = await playlistService.createPlaylist(req.body)
    res.status(201).json(playlist)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// LISTAR
const getAll = async (req, res) => {
  try {
    const playlists = await playlistService.getPlaylists()
    res.json(playlists)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id)
    res.json(playlist)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ATUALIZAR
const update = async (req, res) => {
  try {
    const playlist = await playlistService.updatePlaylist(req.params.id, req.body)
    res.json(playlist)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// DELETAR
const remove = async (req, res) => {
  try {
    await playlistService.deletePlaylist(req.params.id)
    res.json({ message: 'Playlist removida' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADICIONAR MÚSICA
const addMusica = async (req, res) => {
  try {
    const playlist = await playlistService.addMusica(
      req.params.id,
      req.params.musicaId
    )
    res.json(playlist)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// REMOVER MÚSICA
const removeMusica = async (req, res) => {
  try {
    const playlist = await playlistService.removeMusica(
      req.params.id,
      req.params.musicaId
    )
    res.json(playlist)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// FAVORITAR
const toggleFavorita = async (req, res) => {
  try {
    const playlist = await playlistService.toggleFavorita(
      req.params.id,
      req.params.usuarioId
    )
    res.json(playlist)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  addMusica,
  removeMusica,
  toggleFavorita
}