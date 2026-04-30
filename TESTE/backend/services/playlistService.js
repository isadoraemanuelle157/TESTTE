const Playlist = require('../models/Playlist')
const MusicaExterna = require('../models/MusicaExterna')

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
    usuario: userId,
    publica: data.publica ?? true,
    musicas: [],
    musicasExternas: []
  })

  return await playlist.save()
}

const getPlaylists = async (userId) => {
  const playlists = await Playlist.find({ usuario: userId })
    .populate('musicas', 'nome duracao foto link')
    .populate('musicasExternas')
    .sort({ createdAt: -1 })

  // 🔥 Ajuste dos dados para o front
  return playlists.map(p => {
    const obj = p.toObject()
    
    // Junta músicas locais e externas para o front
    const todasMusicas = [
      ...(obj.musicas || []).map(m => ({
        ...m,
        source: 'local'
      })),
      ...(obj.musicasExternas || []).map(m => ({
        _id: m._id,
        id: m.musicaId,
          externalId: m._id,
        nome: m.dadosMusica?.titulo,
        artista: m.dadosMusica?.artista,
        foto: m.dadosMusica?.capa,
        link: m.dadosMusica?.previewUrl,
        duracao: m.dadosMusica?.duration,
        ano: m.dadosMusica?.ano,
        album: m.dadosMusica?.album,
        source: m.source,
        musicaId: m.musicaId
      }))
    ]

    return {
      ...obj,
      totalMusicas: (obj.musicas?.length || 0) + (obj.musicasExternas?.length || 0),
      capa: obj.capa || (obj.musicas?.[0]?.foto || '/default-playlist.png'),
      privacidade: obj.publica ? 'Pública' : 'Privada',
      musicas: todasMusicas  // array unificado para o front
    }
  })
}

// 🔥 BUSCAR POR ID
const getPlaylistById = async (id) => {
  const playlist = await Playlist.findById(id)
    .populate('musicas', 'nome duracao foto link')
    .populate('musicasExternas')

  if (!playlist) return null

  const obj = playlist.toObject()

  // Junta músicas locais e externas
  const todasMusicas = [
    ...(obj.musicas || []).map(m => ({
      ...m,
      source: 'local'
    })),
    ...(obj.musicasExternas || []).map(m => ({
      _id: m._id,
      id: m.musicaId,
        externalId: m._id,
      nome: m.dadosMusica?.titulo,
      artista: m.dadosMusica?.artista,
      foto: m.dadosMusica?.capa,
      link: m.dadosMusica?.previewUrl,
      duracao: m.dadosMusica?.duration,
      ano: m.dadosMusica?.ano,
      album: m.dadosMusica?.album,
      source: m.source,
      musicaId: m.musicaId
    }))
  ]

  return {
    ...obj,
    musicas: todasMusicas
  }
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
  // Remove também as músicas externas associadas (opcional - se quiser manter, remova esta parte)
  const playlist = await Playlist.findById(id)
  if (playlist && playlist.musicasExternas?.length > 0) {
    await MusicaExterna.deleteMany({ _id: { $in: playlist.musicasExternas } })
  }
  
  return await Playlist.findByIdAndDelete(id)
}

// 🔥 ADICIONAR MÚSICA (local ou externa)
const addMusica = async (playlistId, musicaId, dadosMusica = null, source = 'local') => {
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) throw new Error('Playlist não encontrada')

  // Se for música externa
  if (source !== 'local' && dadosMusica) {
    // ✅ VALIDAÇÃO: Verificar campos obrigatórios
    if (!dadosMusica.titulo || !dadosMusica.artista) {
      throw new Error('Dados da música incompletos: título e artista são obrigatórios')
    }

    // Garantir que duration seja número
    const duration = Number.isFinite(Number(dadosMusica.duration)) 
      ? Number(dadosMusica.duration) 
      : 30

    // Verifica se a música externa já existe no banco
    let musicaExterna = await MusicaExterna.findOne({ 
      musicaId: musicaId, 
      source: source 
    })

    // Se não existir, cria
    if (!musicaExterna) {
      musicaExterna = await MusicaExterna.create({
        musicaId: musicaId,
        source: source,
        dadosMusica: {
          titulo: dadosMusica.titulo,
          artista: dadosMusica.artista,
          capa: dadosMusica.capa || '',
          previewUrl: dadosMusica.previewUrl || '',
          duration: duration,
          ano: dadosMusica.ano || null,
          album: dadosMusica.album || ''
        }
      })
    }

    // Adiciona à playlist (evita duplicatas)
    if (!playlist.musicasExternas.includes(musicaExterna._id)) {
      playlist.musicasExternas.push(musicaExterna._id)
      await playlist.save()
    }

    return playlist
  }

  // Se for música local (comportamento anterior)
  const mongoose = require('mongoose')
  if (!mongoose.Types.ObjectId.isValid(musicaId)) {
    throw new Error('ID de música local inválido')
  }

  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { musicas: musicaId } },
    { new: true }
  )
}

// 🔥 REMOVER MÚSICA (local ou externa)
const removeMusica = async (playlistId, musicaId, source = 'local') => {
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) throw new Error('Playlist não encontrada')

if (source !== 'local') {
  playlist.musicasExternas = playlist.musicasExternas.filter(
    id => String(id) !== String(musicaId)
  )

  await playlist.save()
  return playlist
}

  // Se for música local (comportamento anterior)
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