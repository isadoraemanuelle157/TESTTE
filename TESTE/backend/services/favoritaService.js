const Favorita = require('../models/Favorita')
const FavoritaExterna = require('../models/FavoritaExterna')

const toggleFavorita = async (usuarioId, { musicaId, playlistId, albumId, cantorId }) => {
  // Verifica se pelo menos um ID válido foi enviado
  const hasValidId = musicaId || playlistId || albumId || cantorId
  
  if (!hasValidId) {
    throw new Error('Nenhum item válido foi enviado para favoritar')
  }

  // Constrói a query dinamicamente apenas com os campos que existem
  const query = { usuario: usuarioId }
  
  if (musicaId) query.musica = musicaId
  if (playlistId) query.playlist = playlistId
  if (albumId) query.album = albumId
  if (cantorId) query.cantor = cantorId

  // Verifica se já existe favorito com esses critérios
  const existing = await Favorita.findOne(query)

  if (existing) {
    await existing.deleteOne()
    return { favorited: false }
  }

  // Cria o documento apenas com os campos necessários
  const newFavoritaData = { usuario: usuarioId }
  if (musicaId) newFavoritaData.musica = musicaId
  if (playlistId) newFavoritaData.playlist = playlistId
  if (albumId) newFavoritaData.album = albumId
  if (cantorId) newFavoritaData.cantor = cantorId

  await Favorita.create(newFavoritaData)

  return { favorited: true }
}

// ========== FAVORITAS EXTERNAS (Spotify/Deezer) ==========
const toggleFavoritaExterna = async (usuarioId, musicaId, source, dadosMusica) => {
  const existing = await FavoritaExterna.findOne({
    usuario: usuarioId,
    musicaId: musicaId,
    source: source
  })

  if (existing) {
    await existing.deleteOne()
    return { favorited: false, source: source }
  }

  await FavoritaExterna.create({
    usuario: usuarioId,
    musicaId: musicaId,
    source: source,
    dadosMusica: {
      titulo: dadosMusica.titulo,
      artista: dadosMusica.artista,
      capa: dadosMusica.capa || '',
      previewUrl: dadosMusica.previewUrl || '',
      duration: dadosMusica.duration || 30,
      ano: dadosMusica.ano || null,
      album: dadosMusica.album || ''
    }
  })

  return { favorited: true, source: source }
}

const getFavoritasByUser = async (usuarioId) => {
  // Busca favoritas locais e externas em paralelo
  const [locais, externas] = await Promise.all([
    Favorita.find({ usuario: usuarioId })
      .populate({
        path: 'musica',
        populate: {
          path: 'cantores',
          select: 'nome foto'
        }
      })
      .populate('playlist')
      .populate({
        path: 'album',
        populate: {
          path: 'cantor',
          select: 'nome foto'
        }
      })
      .populate('cantor')
      .sort({ createdAt: -1 }),
    
    FavoritaExterna.find({ usuario: usuarioId })
      .sort({ createdAt: -1 })
  ])

  // Formata externas no mesmo padrão das locais
  const externasFormatadas = externas.map(f => ({
    _id: f._id,
    usuario: f.usuario,
    musica: null,
    playlist: null,
    album: null,
    cantor: null,
    // Campos extras para identificar como externa
    musicaExterna: {
      id: f.musicaId,
      source: f.source,
      nome: f.dadosMusica.titulo,
      artista: f.dadosMusica.artista,
      capa: f.dadosMusica.capa,
      previewUrl: f.dadosMusica.previewUrl,
      duration: f.dadosMusica.duration,
      ano: f.dadosMusica.ano,
      album: f.dadosMusica.album
    },
    createdAt: f.createdAt
  }))

  // Junta tudo e ordena por data
  const todas = [...locais, ...externasFormatadas]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return todas
}

module.exports = {
  toggleFavorita,
  toggleFavoritaExterna,
  getFavoritasByUser
}