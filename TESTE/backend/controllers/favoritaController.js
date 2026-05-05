const favoritaService = require('../services/favoritaService')
const mongoose = require('mongoose')

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
      return res.status(400).json({ error: 'Tipo é obrigatório. Use: musica, album, cantor, playlist' })
    }

    // ========== ITENS EXTERNOS (Spotify/Deezer) ==========
    if (source && source !== 'local') {
      const tiposSuportados = ['musica', 'album', 'cantor']
      const tipoEfetivo = (tipoItem || tipo)?.toLowerCase()
      const sourceNormalizado = String(source).toLowerCase()
const tipoNormalizado = String(tipoItem).toLowerCase()
      
      if (!tiposSuportados.includes(tipoEfetivo)) {
        return res.status(400).json({ 
          error: 'Tipo inválido para item externo',
          tipoRecebido: tipoEfetivo,
          tiposSuportados 
        })
      }

      const dadosEfetivos = dadosItem || dadosMusica
      
      // 🔥 CORREÇÃO: dadosItem só é obrigatório se for CRIAR (não existe ainda)
      // Se não enviou dadosItem, o service vai tentar remover pelo itemId+source+tipoItem
      try {
    const result = await favoritaService.toggleFavoritaExterna(
  usuarioId,
  String(id),
  String(source).toLowerCase(),
  String(tipoEfetivo).toLowerCase(),
  dadosEfetivos || null,
  { acao }
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
        message: 'ID deve ser um ObjectId válido do MongoDB. Para itens externos, envie source: "deezer" no body'
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
const getMinhasFavoritas = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuário inválido' })
    }

    const favoritas = await favoritaService.getFavoritasByUser(usuarioId)
    res.json(favoritas)

  } catch (err) {
    console.error('Erro ao buscar favoritas:', err)
    res.status(500).json({ error: 'Erro ao buscar favoritas' })
  }
}

module.exports = {
  toggle,
  getMinhasFavoritas
}