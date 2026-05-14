// ============================================
// favoritaService.js — AJUSTADO E COMPLETO
// ============================================

const Favorita = require('../models/Favorita')
const FavoritaExterna = require('../models/FavoritaExterna')
const mongoose = require('mongoose')

// ============================================
// 🔍 HELPERS DE BUSCA
// ============================================

/**
 * Busca favorita externa (Spotify) pelo ID + source + tipo
 */
const findFavoritaExterna = async (usuarioId, itemId, source, tipoItem) => {
  const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId)
    ? new mongoose.Types.ObjectId(usuarioId)
    : usuarioId

  // Busca exata primeiro (com tipoItem)
  let existing = await FavoritaExterna.findOne({
    usuario: userObjectId,
    itemId: String(itemId),
    source: String(source).toLowerCase(),
    tipoItem: String(tipoItem).toLowerCase()
  })

  // Fallback: documentos antigos sem tipoItem (só se não achou com tipoItem)
  if (!existing) {
    existing = await FavoritaExterna.findOne({
      usuario: userObjectId,
      itemId: String(itemId),
      source: String(source).toLowerCase(),
      tipoItem: { $exists: false }
    })
  }

  return existing
}

/**
 * Busca favorita local pelo ID + tipo
 */
const findFavoritaLocal = async (usuarioId, itemId, tipo) => {
  const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId)
    ? new mongoose.Types.ObjectId(usuarioId)
    : usuarioId

  const query = { usuario: userObjectId }

  if (tipo === 'musica') query.musica = itemId
  else if (tipo === 'album') query.album = itemId
  else if (tipo === 'cantor') query.cantor = itemId
  else if (tipo === 'playlist') query.playlist = itemId
  else return null

  return await Favorita.findOne(query)
}

// ============================================
// 🏠 FAVORITAS LOCAIS (MongoDB)
// ============================================

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

// ============================================
// 🌐 FAVORITAS EXTERNAS (Spotify)
// ============================================

const toggleFavoritaExterna = async (usuarioId, itemId, source, tipoItem, dadosItem, options = {}) => {
  try {
    const acao = options.acao || 'toggle'

    const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId)
      ? new mongoose.Types.ObjectId(usuarioId)
      : (() => { throw new Error('usuarioId inválido: ' + usuarioId) })()

    const idExterno = String(itemId)
    const sourceNormalizado = String(source).toLowerCase()
    const tipoNormalizado = String(tipoItem).toLowerCase()

    console.log('=== toggleFavoritaExterna ===')
    console.log('userObjectId:', userObjectId)
    console.log('idExterno:', idExterno)
    console.log('source:', sourceNormalizado)
    console.log('tipoItem:', tipoNormalizado)
    console.log('acao:', acao)
    console.log('dadosItem:', dadosItem ? 'presente' : 'ausente')

    // Busca existente (usando helper)
    let existing = await findFavoritaExterna(
      userObjectId,
      idExterno,
      sourceNormalizado,
      tipoNormalizado
    )

    // Se existe → remove (toggle off)
    if (existing) {
      await existing.deleteOne()
      console.log('✅ FavoritaExterna REMOVIDA:', existing._id)
      return { 
        favorited: false, 
        source: sourceNormalizado, 
        tipoItem: tipoNormalizado 
      }
    }

    // Se a intenção era remover e não achou → retorna não favoritado
    if (acao === 'remover') {
      console.log('⚠️ Item externo não encontrado para remover')
      return {
        favorited: false,
        source: sourceNormalizado,
        tipoItem: tipoNormalizado,
        notFound: true
      }
    }

    // Criação: precisa de dados do item
    if (!dadosItem || (!dadosItem.titulo && !dadosItem.nome)) {
      throw new Error('Dados do item são obrigatórios para criar nova favorita externa. Envie: titulo/nome, artista, capa')
    }

    // Normaliza dados do item
    const dadosPadrao = {
      titulo: dadosItem.titulo || dadosItem.nome || 'Sem título',
      artista: dadosItem.artista || dadosItem.artistaNome || 'Artista Desconhecido',
      capa: dadosItem.capa || dadosItem.foto || dadosItem.cover || '',
      previewUrl: dadosItem.previewUrl || dadosItem.preview || '',
      duration: dadosItem.duration || 0,
      ano: dadosItem.ano || null,
      album: dadosItem.album || ''
    }

    const novoDoc = await FavoritaExterna.create({
      usuario: userObjectId,
      itemId: idExterno,
      source: sourceNormalizado,
      tipoItem: tipoNormalizado,
      dadosItem: dadosPadrao
    })

    console.log('✅ FavoritaExterna CRIADA:', novoDoc._id)

    return { 
      favorited: true, 
      source: sourceNormalizado, 
      tipoItem: tipoNormalizado 
    }

  } catch (err) {
    console.error('❌ Erro em toggleFavoritaExterna:', err)
    throw err
  }
}

// ============================================
// 📋 LISTAR FAVORITAS DO USUÁRIO
// ============================================

const getFavoritasByUser = async (usuarioId) => {
  const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId) 
    ? new mongoose.Types.ObjectId(usuarioId) 
    : usuarioId

  const [locais, externas] = await Promise.all([
    // Favoritas locais com populate
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
    
    // Favoritas externas (Spotify)
    FavoritaExterna.find({ usuario: userObjectId })
      .sort({ createdAt: -1 })
  ])

  // Filtra apenas Spotify (ignora Deezer se houver legado)
  const externasSpotify = externas.filter(f => {
    const s = String(f.source || '').toLowerCase()
    return s === 'spotify'
  })
    
  // Formata externas para o mesmo formato das locais
  const externasFormatadas = externasSpotify.map(f => {
    const tipo = f.tipoItem || 'musica'
    
    return {
      _id: f._id,
      usuario: f.usuario,
      // Campos locais (null para externos)
      musica: null,
      playlist: null,
      album: null,
      cantor: null,
      // Campos externos
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

// ============================================
// 📤 EXPORTS
// ============================================

module.exports = {
  // Favoritas locais
  toggleFavorita,
  findFavoritaLocal,
  
  // Favoritas externas (Spotify)
  toggleFavoritaExterna,
  findFavoritaExterna,
  
  // Listagem
  getFavoritasByUser
}