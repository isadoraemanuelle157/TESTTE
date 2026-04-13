const favoritaService = require('../services/favoritaService')
const mongoose = require('mongoose')

const toggle = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.user?.usuarioId
    const { id } = req.params
    const { tipo } = req.body

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    if (!['musica', 'playlist', 'album', 'cantor'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' })
    }

    // Prepara os parâmetros corretamente
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