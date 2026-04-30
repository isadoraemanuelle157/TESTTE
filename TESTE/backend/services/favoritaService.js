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
// Agora suporta: musica, album, cantor
const toggleFavoritaExterna = async (usuarioId, itemId, source, tipoItem, dadosItem) => {
  // tipoItem pode ser: 'musica', 'album', 'cantor'
  const existing = await FavoritaExterna.findOne({
    usuario: usuarioId,
    itemId: itemId,
    source: source,
    tipoItem: tipoItem
  })

  if (existing) {
    await existing.deleteOne()
    return { favorited: false, source: source, tipoItem: tipoItem }
  }

  // Dados padronizados para qualquer tipo de item externo
  const dadosPadrao = {
    titulo: dadosItem?.titulo || dadosItem?.nome || 'Sem título',
    artista: dadosItem?.artista || dadosItem?.artistaNome || 'Artista Desconhecido',
    capa: dadosItem?.capa || dadosItem?.foto || dadosItem?.cover || '',
    previewUrl: dadosItem?.previewUrl || dadosItem?.preview || '',
    duration: dadosItem?.duration || 0,
    ano: dadosItem?.ano || null,
    album: dadosItem?.album || ''
  }

  await FavoritaExterna.create({
    usuario: usuarioId,
    itemId: itemId,
    source: source,
    tipoItem: tipoItem,  // 'musica' | 'album' | 'cantor'
    dadosItem: dadosPadrao
  })

  return { favorited: true, source: source, tipoItem: tipoItem }
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
  const externasFormatadas = externas.map(f => {
    const tipo = f.tipoItem || 'musica'  // fallback para compatibilidade
    
    return {
      _id: f._id,
      usuario: f.usuario,
      musica: null,
      playlist: null,
      album: null,
      cantor: null,
      // Campos extras para identificar como externa
      musicaExterna: tipo === 'musica' ? {
        id: f.itemId,
        source: f.source,
        nome: f.dadosItem.titulo,
        artista: f.dadosItem.artista,
        capa: f.dadosItem.capa,
        previewUrl: f.dadosItem.previewUrl,
        duration: f.dadosItem.duration,
        ano: f.dadosItem.ano,
        album: f.dadosItem.album
      } : null,
      albumExterno: tipo === 'album' ? {
        id: f.itemId,
        source: f.source,
        nome: f.dadosItem.titulo,
        artista: f.dadosItem.artista,
        capa: f.dadosItem.capa,
        ano: f.dadosItem.ano
      } : null,
      cantorExterno: tipo === 'cantor' ? {
        id: f.itemId,
        source: f.source,
        nome: f.dadosItem.titulo,
        capa: f.dadosItem.capa,
        foto: f.dadosItem.capa
      } : null,
      createdAt: f.createdAt,
      tipoItem: tipo
    }
  })

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