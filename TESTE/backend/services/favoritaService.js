const Favorita = require('../models/Favorita')
const FavoritaExterna = require('../models/FavoritaExterna')
const mongoose = require('mongoose')

// ========== FAVORITAS LOCAIS ==========
const toggleFavorita = async (usuarioId, { musicaId, playlistId, albumId, cantorId }) => {
  const hasValidId = musicaId || playlistId || albumId || cantorId
  
  if (!hasValidId) {
    throw new Error('Nenhum item válido foi enviado para favoritar')
  }

  // Garante que usuarioId é ObjectId
  const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId) 
    ? new mongoose.Types.ObjectId(usuarioId) 
    : usuarioId

  const query = { usuario: userObjectId }
  
  if (musicaId) query.musica = musicaId
  if (playlistId) query.playlist = playlistId
  if (albumId) query.album = albumId
  if (cantorId) query.cantor = cantorId

  const existing = await Favorita.findOne(query)

  if (existing) {
    await existing.deleteOne()
    return { favorited: false }
  }

  const newFavoritaData = { usuario: userObjectId }
  if (musicaId) newFavoritaData.musica = musicaId
  if (playlistId) newFavoritaData.playlist = playlistId
  if (albumId) newFavoritaData.album = albumId
  if (cantorId) newFavoritaData.cantor = cantorId

  await Favorita.create(newFavoritaData)
  return { favorited: true }
}

// ========== FAVORITAS EXTERNAS ==========
const toggleFavoritaExterna = async (usuarioId, itemId, source, tipoItem, dadosItem) => {
  try {
    // Garante que usuarioId é ObjectId válido
    const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId) 
      ? new mongoose.Types.ObjectId(usuarioId) 
      : (() => { throw new Error('usuarioId inválido: ' + usuarioId) })()

    const idExterno = String(itemId)

    console.log('toggleFavoritaExterna:', { userObjectId, idExterno, source, tipoItem })

    const existing = await FavoritaExterna.findOne({
      usuario: userObjectId,
      itemId: idExterno,
      source: source,
      tipoItem: tipoItem
    })

    if (existing) {
      await existing.deleteOne()
      return { favorited: false, source: source, tipoItem: tipoItem }
    }

    const dadosPadrao = {
      titulo: dadosItem?.titulo || dadosItem?.nome || 'Sem título',
      artista: dadosItem?.artista || dadosItem?.artistaNome || 'Artista Desconhecido',
      capa: dadosItem?.capa || dadosItem?.foto || dadosItem?.cover || '',
      previewUrl: dadosItem?.previewUrl || dadosItem?.preview || '',
      duration: dadosItem?.duration || 0,
      ano: dadosItem?.ano || null,
      album: dadosItem?.album || ''
    }

    const novoDoc = await FavoritaExterna.create({
      usuario: userObjectId,
      itemId: idExterno,
      source: source,
      tipoItem: tipoItem,
      dadosItem: dadosPadrao
    })

    console.log('FavoritaExterna criada:', novoDoc._id)

    return { favorited: true, source: source, tipoItem: tipoItem }

  } catch (err) {
    console.error('Erro em toggleFavoritaExterna:', err)
    throw err
  }
}

const getFavoritasByUser = async (usuarioId) => {
  const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId) 
    ? new mongoose.Types.ObjectId(usuarioId) 
    : usuarioId

  const [locais, externas] = await Promise.all([
    Favorita.find({ usuario: userObjectId })
      .populate({
        path: 'musica',
        populate: { path: 'cantores', select: 'nome foto' }
      })
      .populate('playlist')
      .populate({
        path: 'album',
        populate: { path: 'cantor', select: 'nome foto' }
      })
      .populate('cantor')
      .sort({ createdAt: -1 }),
    
    FavoritaExterna.find({ usuario: userObjectId })
      .sort({ createdAt: -1 })
  ])

  const externasFormatadas = externas.map(f => {
    const tipo = f.tipoItem || 'musica'
    
    return {
      _id: f._id,
      usuario: f.usuario,
      musica: null,
      playlist: null,
      album: null,
      cantor: null,
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

  const todas = [...locais, ...externasFormatadas]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return todas
}

module.exports = {
  toggleFavorita,
  toggleFavoritaExterna,
  getFavoritasByUser
}