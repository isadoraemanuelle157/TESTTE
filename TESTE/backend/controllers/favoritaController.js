const favoritaService = require('../services/favoritaService')
const mongoose = require('mongoose')

const toggle = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId
    const { id } = req.params
    const { tipo, source, dadosMusica } = req.body

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo é obrigatório' })
    }

    // ========== MÚSICA EXTERNA (Spotify/Deezer) ==========
    if (tipo === 'musica' && source && source !== 'local') {
      // Validação dos dados apenas na criação (dadosMusica pode não vir na remoção)
      if (dadosMusica && (!dadosMusica.titulo || !dadosMusica.artista)) {
        return res.status(400).json({ 
          error: 'Dados da música são obrigatórios para favoritar músicas externas'
        })
      }

      const result = await favoritaService.toggleFavoritaExterna(
        usuarioId,
        id,        // musicaId (string do Spotify/Deezer)
        source,    // 'spotify' ou 'deezer'
        dadosMusica || {}  // pode ser vazio na remoção
      )

      return res.json(result)
    }

    // ========== ITENS LOCAIS (musica, playlist, album, cantor) ==========
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        message: 'Para músicas externas, envie source: "spotify" ou "deezer" no body'
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