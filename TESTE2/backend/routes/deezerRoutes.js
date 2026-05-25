const express = require('express')
const router = express.Router()
const axios = require('axios')

const { DEEZER_API_URL } = require('../config/spotify')

// ============================================
// 🎧 DEEZER PROXY ROUTES (evita CORS no frontend)
// ============================================

// Busca geral
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Query obrigatória' })
    }

    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q, limit },
      timeout: 5000
    })

    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer search error:', error.message)
    res.status(500).json({ error: 'Erro Deezer Search' })
  }
})

// Chart de tracks (Top 10 Brasil)
router.get('/chart/0/tracks', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const response = await axios.get(`${DEEZER_API_URL}/chart/0/tracks`, {
      params: { limit },
      timeout: 5000
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer chart tracks error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar chart do Deezer' })
  }
})

// Chart de álbuns (Lançamentos)
router.get('/chart/0/albums', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const response = await axios.get(`${DEEZER_API_URL}/chart/0/albums`, {
      params: { limit },
      timeout: 5000
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer chart albums error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar álbuns do Deezer' })
  }
})

// Gêneros musicais
router.get('/genre', async (req, res) => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/genre`, {
      timeout: 5000
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer genre error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar gêneros do Deezer' })
  }
})

// Top tracks do artista
router.get('/artist/:id/top', async (req, res) => {
  try {
    const { limit = 5 } = req.query
    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${req.params.id}/top`,
      { params: { limit }, timeout: 5000 }
    )
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer artist top error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar top tracks do artista' })
  }
})

// Tracks do álbum
router.get('/album/:id/tracks', async (req, res) => {
  try {
    const response = await axios.get(
      `${DEEZER_API_URL}/album/${req.params.id}/tracks`,
      { timeout: 5000 }
    )
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer album tracks error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar tracks do álbum' })
  }
})

router.get('/chart/0/artists', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const response = await axios.get(`${DEEZER_API_URL}/chart/0/artists`, {
      params: { limit },
      timeout: 5000
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer chart artists error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar chart de artistas do Deezer' })
  }
})

// Detalhes do artista
router.get('/artist/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${req.params.id}`,
      { timeout: 5000 }
    )
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer artist error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar artista do Deezer' })
  }
})

module.exports = router