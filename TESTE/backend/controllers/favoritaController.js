const favoritaService = require('../services/favoritaService')

const toggle = async (req, res) => {
  try {
    const usuarioId = req.user.id
    const { id } = req.params
    const { tipo } = req.body // 🔥 "musica" ou "playlist"

const result = await favoritaService.toggleFavorita(usuarioId, {
  musicaId: tipo === 'musica' ? id : null,
  playlistId: tipo === 'playlist' ? id : null,
  albumId: tipo === 'album' ? id : null,     // 🔥 novo
  cantorId: tipo === 'cantor' ? id : null    // 🔥 novo
})

    res.json(result)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao favoritar' })
  }
}

const getMinhasFavoritas = async (req, res) => {
  try {
    const usuarioId = req.user.id

    const favoritas = await favoritaService.getFavoritasByUser(usuarioId)

    res.json(favoritas)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar favoritas' })
  }
}

module.exports = {
  toggle,
  getMinhasFavoritas
}
