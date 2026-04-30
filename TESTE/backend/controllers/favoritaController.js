const favoritaService = require('../services/favoritaService')
const mongoose = require('mongoose')

const toggle = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId
    const { id } = req.params
    const { tipo, source, dadosItem } = req.body

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo é obrigatório' })
    }

    // ========== ITENS EXTERNOS (Spotify/Deezer) ==========
    if (source && source !== 'local') {
      const tiposSuportados = ['musica', 'album', 'cantor']
      if (!tiposSuportados.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido para item externo' })
      }

      // Validação mínima de dados
      if (!dadosItem || !dadosItem.titulo) {
        return res.status(400).json({ 
          error: 'Dados do item são obrigatórios para favoritar itens externos',
          exemplo: {
            tipo: 'album',
            source: 'deezer',
            dadosItem: {
              titulo: 'Nome do Álbum',
              artista: 'Nome do Artista',
              capa: 'url-da-capa',
              ano: 2024
            }
          }
        })
      }

      const result = await favoritaService.toggleFavoritaExterna(
        usuarioId,
        String(id),
        source,
        tipo,
        dadosItem
      )
      return res.json(result)
    }

    // ========== ITENS LOCAIS ==========
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        message: 'ID deve ser um ObjectId válido do MongoDB'
      })
    }

    if (!['musica', 'playlist', 'album', 'cantor'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' })
    }

    const params = {
      musicaId: tipo === 'musica' ? id : undefined,
      playlistId: tipo === 'playlist' ? id : undefined,
      albumId: tipo === 'album' ? id : undefined,
      cantorId: tipo === 'cantor' ? id : undefined
    }

    const result = await favoritaService.toggleFavorita(usuarioId, params)
    res.json(result)

  } catch (err) {
    console.error('Erro ao favoritar:', err)
    return res.status(500).json({ error: err.message || 'Erro ao favoritar' })
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