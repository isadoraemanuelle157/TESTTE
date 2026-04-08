const Playlist = require('../models/Playlist')


// 🔥 CRIAR
const createPlaylist = async (data, userId) => {
  if (!data.nome) {
    throw new Error('Nome da playlist é obrigatório')
  }

  if (!userId) {
    throw new Error('Usuário não autenticado')
  }

  const playlist = new Playlist({
    nome: data.nome,
    descricao: data.descricao || '',
    capa: data.capa || '',
    usuario: userId, // 🔥 agora vem do usuário logado
    publica: data.publica ?? true
  })

  return await playlist.save()
}

const getPlaylists = async (userId) => {
  const playlists = await Playlist.find({ usuario: userId })
    .populate('musicas', 'nome duracao foto link')
    .sort({ createdAt: -1 })

  // 🔥 Ajuste dos dados para o front
  return playlists.map(p => ({
    ...p.toObject(),
    totalMusicas: p.musicas.length,
    capa: p.capa || (p.musicas[0]?.foto || '/default-playlist.png'),
    privacidade: p.publica ? 'Pública' : 'Privada'
  }))
}

// 🔥 BUSCAR POR ID
const getPlaylistById = async (id) => {
  return await Playlist.findById(id)
.populate('musicas', 'nome duracao foto link')
}

// 🔥 ATUALIZAR
const updatePlaylist = async (id, data) => {
  return await Playlist.findByIdAndUpdate(
    id,
    {
      nome: data.nome,
      descricao: data.descricao,
      capa: data.capa,
      publica: data.publica
    },
    { new: true }
  )
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

// 🔥 FAVORITAR
const toggleFavorita = async (playlistId, userId) => {
  const playlist = await Playlist.findById(playlistId)

  if (!playlist) throw new Error('Playlist não encontrada')

  const jaFavoritou = playlist.favoritas.includes(userId)

  if (jaFavoritou) {
    playlist.favoritas.pull(userId)
  } else {
    playlist.favoritas.push(userId)
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