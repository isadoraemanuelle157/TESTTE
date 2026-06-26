const express = require('express')
const router = express.Router()
const axios = require('axios')

const { DEEZER_API_URL } = require('../config/spotify')

const { getCache, setCache } = require('../utils/cache')

const DEEZER_CACHE_TTL = 1000 * 60 * 30 // 30 minutos para Deezer

// ============================================
// 🎧 DEEZER PROXY ROUTES (evita CORS no frontend)
// ============================================

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query
    if (!q) return res.status(400).json({ error: 'Query obrigatória' })

    // ✅ CACHE
    const cacheKey = `deezer_search_${q.toLowerCase().trim()}_${limit}`
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('📦 Cache hit Deezer search:', q)
      return res.json(cached)
    }

    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q, limit },
      timeout: 5000
    })

    // ✅ SALVAR CACHE
    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer search error:', error.message)
    res.status(500).json({ error: 'Erro Deezer Search' })
  }
})

router.get('/chart/0/tracks', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const cacheKey = `deezer_chart_tracks_${limit}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(`${DEEZER_API_URL}/chart/0/tracks`, {
      params: { limit },
      timeout: 5000
    })

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer chart tracks error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar chart do Deezer' })
  }
})

router.get('/chart/0/albums', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const cacheKey = `deezer_chart_albums_${limit}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(`${DEEZER_API_URL}/chart/0/albums`, {
      params: { limit },
      timeout: 5000
    })

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer chart albums error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar álbuns do Deezer' })
  }
})

router.get('/genre', async (req, res) => {
  try {
    const cacheKey = 'deezer_genres'
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(`${DEEZER_API_URL}/genre`, {
      timeout: 5000
    })

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL * 2) // 1 hora (gêneros mudam pouco)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer genre error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar gêneros do Deezer' })
  }
})

router.get('/artist/:id/top', async (req, res) => {
  try {
    const { limit = 5 } = req.query
    const cacheKey = `deezer_artist_top_${req.params.id}_${limit}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${req.params.id}/top`,
      { params: { limit }, timeout: 5000 }
    )

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer artist top error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar top tracks do artista' })
  }
})

router.get('/album/:id/tracks', async (req, res) => {
  try {
    const cacheKey = `deezer_album_tracks_${req.params.id}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(
      `${DEEZER_API_URL}/album/${req.params.id}/tracks`,
      { timeout: 5000 }
    )

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer album tracks error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar tracks do álbum' })
  }
})

router.get('/chart/0/artists', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const cacheKey = `deezer_chart_artists_${limit}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    
    // Busca o chart de artistas
    const response = await axios.get(`${DEEZER_API_URL}/chart/0/artists`, {
      params: { limit },
      timeout: 5000
    })

    const chartData = response.data

    // 🔥 Enriquece cada artista com nb_fan real buscando detalhes
    if (chartData.data && Array.isArray(chartData.data)) {
      const enrichedArtists = await Promise.allSettled(
        chartData.data.map(async (artist) => {
          try {
            // Se já tem nb_fan válido, usa ele
            if (artist.nb_fan && artist.nb_fan > 0) {
              return artist
            }

            // Senão, busca detalhes do artista
            const detailRes = await axios.get(
              `${DEEZER_API_URL}/artist/${artist.id}`,
              { timeout: 3000 }
            )
            
            return {
              ...artist,
              nb_fan: detailRes.data.nb_fan || artist.nb_fan || 0
            }
          } catch (err) {
            // Se falhar a busca de detalhes, retorna o artista original
            return artist
          }
        })
      )

      chartData.data = enrichedArtists
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
    }

     setCache(cacheKey, chartData, DEEZER_CACHE_TTL)
    res.json(chartData)
  } catch (error) {
    console.error('❌ Deezer chart artists error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar chart de artistas do Deezer' })
  }
})

router.get('/artist/:id', async (req, res) => {
  try {
    const cacheKey = `deezer_artist_${req.params.id}`
    
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${req.params.id}`,
      { timeout: 5000 }
    )

    setCache(cacheKey, response.data, DEEZER_CACHE_TTL)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Deezer artist error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar artista do Deezer' })
  }
})

// Gêneros do artista (via álbuns)
router.get('/artist/:id/genres', async (req, res) => {
  try {
    // Busca álbuns do artista
    const albumsRes = await axios.get(
      `${DEEZER_API_URL}/artist/${req.params.id}/albums?limit=50`,
      { timeout: 5000 }
    )
    
    const albums = albumsRes.data?.data || []
    const generoIds = new Set()
    
    // Coleta genre_ids únicos
    for (const album of albums) {
      if (album.genre_id && album.genre_id > 0) {
        generoIds.add(album.genre_id)
      }
    }
    
    // Busca nome de cada gênero
    const generos = []
    for (const genreId of generoIds) {
      try {
        const genreRes = await axios.get(
          `${DEEZER_API_URL}/genre/${genreId}`,
          { timeout: 3000 }
        )
        if (genreRes.data?.name) {
          generos.push(genreRes.data.name)
        }
      } catch (e) {
        // ignora
      }
    }
    
    res.json({ genres: generos })
  } catch (error) {
    console.error('❌ Deezer artist genres error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar gêneros do artista' })
  }
})

module.exports = router