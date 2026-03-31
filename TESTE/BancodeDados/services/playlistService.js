const Playlist = require('../models/Playlist')

// 🔥 CRIAR
const createPlaylist = async (data) => {
  if (!data.nome) {
    throw new Error('Nome da playlist é obrigatório')
  }

  const playlist = new Playlist({
    nome: data.nome,
    descricao: data.descricao,
    capa: data.capa,
    usuario: data.usuario,
    publica: data.publica
  })

  return await playlist.save()
}

// 🔥 LISTAR TODAS
const getPlaylists = async () => {
  return await Playlist.find()
    .populate('usuario', 'nome')
    .populate('musicas', 'nome duracao')
    .populate('favoritas', 'nome')
}

// 🔥 BUSCAR POR ID
const getPlaylistById = async (id) => {
  return await Playlist.findById(id)
    .populate('usuario', 'nome')
    .populate('musicas', 'nome duracao')
    .populate('favoritas', 'nome')
}

// 🔥 ATUALIZAR
const updatePlaylist = async (id, data) => {
  return await Playlist.findByIdAndUpdate(id, data, { new: true })
}

// 🔥 DELETAR
const deletePlaylist = async (id) => {
  return await Playlist.findByIdAndDelete(id)
}

// 🔥 ADICIONAR MÚSICA
const addMusica = async (playlistId, musicaId) => {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { musicas: musicaId } },
    { new: true }
  )
}

// 🔥 REMOVER MÚSICA
const removeMusica = async (playlistId, musicaId) => {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { musicas: musicaId } },
    { new: true }
  )
}

// 🔥 FAVORITAR PLAYLIST
const toggleFavorita = async (playlistId, usuarioId) => {
  const playlist = await Playlist.findById(playlistId)

  if (!playlist) throw new Error('Playlist não encontrada')

  const jaFavoritou = playlist.favoritas.includes(usuarioId)

  if (jaFavoritou) {
    playlist.favoritas.pull(usuarioId)
  } else {
    playlist.favoritas.push(usuarioId)
  }

  return await playlist.save()
}

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addMusica,
  removeMusica,
  toggleFavorita
}