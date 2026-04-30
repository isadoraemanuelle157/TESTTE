const playlistService = require('../services/playlistService')
const Playlist = require('../models/Playlist')

// Helper seguro para extrair dados do body
const getBodyData = (req) => {
  const body = req.body || {}
  return {
    source: body.source || 'local',
    dadosMusica: body.dadosMusica || null
  }
}

// CRIAR
const create = async (req, res) => {
  try {
    const userId = req.user.id
    const playlist = await playlistService.createPlaylist(req.body, userId)
    res.status(201).json(playlist)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}

// LISTAR
const getAll = async (req, res) => {
  try {
    const userId = req.user.id
    const playlists = await playlistService.getPlaylists(userId)
    res.json(playlists)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id)
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' })
    }
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
    const { source, dadosMusica } = getBodyData(req)
    
    // ✅ DEBUG: Log para ver o que está chegando
    console.log('Requisição addMusica:', {
      playlistId: req.params.id,
      musicaId: req.params.musicaId,
      source,
      dadosMusica
    })

    const playlist = await playlistService.addMusica(
      req.params.id,
      req.params.musicaId,
      dadosMusica,
      source
    )
    
    res.json({
      message: 'Música adicionada à playlist',
      playlist
    })
  } catch (err) {
    console.error('Erro ao adicionar música:', err)
    res.status(400).json({ error: err.message })
  }
}

// REMOVER MÚSICA
const removeMusica = async (req, res) => {
  try {
    const { source } = getBodyData(req)
    
    const playlist = await playlistService.removeMusica(
      req.params.id,
      req.params.musicaId,
      source
    )
    
    res.json({
      message: 'Música removida da playlist',
      playlist
    })
  } catch (err) {
    console.error('Erro ao remover música:', err)
    res.status(400).json({ error: err.message })
  }
}

// FAVORITAR
const toggleFavorita = async (req, res) => {
  try {
    const userId = req.user.id
    const playlist = await playlistService.toggleFavorita(
      req.params.id,
      userId
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