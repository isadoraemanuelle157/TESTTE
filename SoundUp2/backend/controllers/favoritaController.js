// ============================================
// favoritaController.js — AJUSTADO E COMPLETO
// ============================================

const favoritaService = require('../services/favoritaService')
const mongoose = require('mongoose')

// ============================================
// ⭐ TOGGLE FAVORITA (Curtir/Descurtir)
// ============================================
const toggle = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId
    const { id } = req.params
    const { tipo, source, dadosItem, dadosMusica, tipoItem, acao } = req.body

    console.log('=== TOGGLE FAVORITA ===')
    console.log('usuarioId:', usuarioId, '| tipo:', typeof usuarioId)
    console.log('id:', id, '| tipo:', typeof id)
    console.log('tipo:', tipo)
    console.log('tipoItem:', tipoItem)
    console.log('source:', source)

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!tipo) {
      return res.status(400).json({ 
        error: 'Tipo é obrigatório. Use: musica, album, cantor, playlist' 
      })
    }

    // ========== BLOQUEIO DEEZER ==========
    // Deezer NÃO permite favoritar (só Spotify e Local)
    const sourceNormalizado = source ? String(source).toLowerCase() : 'local'
    if (sourceNormalizado === 'deezer') {
      return res.status(403).json({ 
        error: 'DEEZER_NO_FAVORITE',
        message: 'Faça login com Spotify para favoritar itens do Deezer'
      })
    }

    // ========== ITENS EXTERNOS (Spotify) ==========
    // Qualquer source que não seja 'local' é tratado como externo
    const isExternal = sourceNormalizado !== 'local'

    if (isExternal) {
      const tiposSuportados = ['musica', 'album', 'cantor']
      const tipoEfetivo = (tipoItem || tipo)?.toLowerCase()
      
      if (!tiposSuportados.includes(tipoEfetivo)) {
        return res.status(400).json({ 
          error: 'Tipo inválido para item externo',
          tipoRecebido: tipoEfetivo,
          tiposSuportados 
        })
      }

      const dadosEfetivos = dadosItem || dadosMusica
      
      // Se ação for 'remover' e não tem dados, permite (vai tentar remover pelo ID)
      // Se ação for 'toggle' ou 'favoritar' e não tem dados, erro
      if (!dadosEfetivos && acao !== 'remover') {
        return res.status(400).json({
          error: 'Dados do item obrigatórios para favoritar',
          message: 'Envie dadosItem ou dadosMusica com: titulo, artista, capa'
        })
      }

      try {
        const result = await favoritaService.toggleFavoritaExterna(
          usuarioId,
          String(id),
          sourceNormalizado,
          String(tipoEfetivo).toLowerCase(),
          dadosEfetivos || null,
          { acao: acao || 'toggle' }
        )

        return res.json(result)
      } catch (serviceErr) {
        console.error('Erro no service toggleFavoritaExterna:', serviceErr)
        return res.status(500).json({ 
          error: 'Erro no serviço de favoritos externos',
          details: serviceErr.message 
        })
      }
    }

    // ========== ITENS LOCAIS ==========
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido para item local',
        idRecebido: id,
        message: 'ID deve ser um ObjectId válido do MongoDB. Para itens externos, envie source: "spotify" no body'
      })
    }

    const tiposLocais = ['musica', 'playlist', 'album', 'cantor']
    if (!tiposLocais.includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido',
        tiposSuportados: tiposLocais
      })
    }

    const params = {
      musicaId: tipo === 'musica' ? id : undefined,
      playlistId: tipo === 'playlist' ? id : undefined,
      albumId: tipo === 'album' ? id : undefined,
      cantorId: tipo === 'cantor' ? id : undefined
    }

    try {
      const result = await favoritaService.toggleFavorita(usuarioId, params)
      res.json(result)
    } catch (serviceErr) {
      console.error('Erro no service toggleFavorita:', serviceErr)
      return res.status(500).json({ 
        error: 'Erro no serviço de favoritos locais',
        details: serviceErr.message 
      })
    }

  } catch (err) {
    console.error('Erro geral ao favoritar:', err)
    return res.status(500).json({ 
      error: err.message || 'Erro ao favoritar',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}

// ============================================
// 📋 LISTAR MINHAS FAVORITAS
// ============================================
const getMinhasFavoritas = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Converte para ObjectId (igual no toggle)
    const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId)
      ? new mongoose.Types.ObjectId(usuarioId)
      : usuarioId

    const favoritas = await favoritaService.getFavoritasByUser(userObjectId)
    res.json(favoritas)

  } catch (err) {
    console.error('Erro ao buscar favoritas:', err)
    res.status(500).json({ error: 'Erro ao buscar favoritas' })
  }
}

// ============================================
// 🔍 VERIFICAR SE ITEM ESTÁ FAVORITADO
// ============================================
const isFavorita = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId
    
    // Se não estiver logado, retorna false (não favoritado)
    if (!usuarioId) {
      return res.json({ 
        isFavorita: false,
        isLogged: false 
      })
    }

    const { id } = req.params
    const { tipo, source } = req.query

    if (!id) {
      return res.status(400).json({ error: 'ID é obrigatório' })
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(usuarioId)
      ? new mongoose.Types.ObjectId(usuarioId)
      : usuarioId

    const sourceNormalizado = source ? String(source).toLowerCase() : 'local'
    const tipoNormalizado = tipo ? String(tipo).toLowerCase() : 'musica'

    let isFav = false

    // Itens externos (Spotify)
    if (sourceNormalizado !== 'local') {
      const existing = await favoritaService.findFavoritaExterna(
        userObjectId,
        String(id),
        sourceNormalizado,
        tipoNormalizado
      )
      isFav = !!existing
    } else {
      // Itens locais
      const existing = await favoritaService.findFavoritaLocal(
        userObjectId,
        id,
        tipoNormalizado
      )
      isFav = !!existing
    }

    res.json({ 
      isFavorita: isFav,
      isLogged: true 
    })

  } catch (err) {
    console.error('Erro ao verificar favorita:', err)
    res.status(500).json({ error: 'Erro ao verificar favorita' })
  }
}

module.exports = {
  toggle,
  getMinhasFavoritas,
  isFavorita
}