const { spotifyRequest } = require('../utils/spotifyRequest')

const {
  SPOTIFY_API_URL
} = require('../config/spotify')

const {
  getCache,
  setCache
} = require('../utils/cache')

exports.search = async (req, res) => {
  try {
    const {
      q,
      type = 'track,artist,album',
      market = 'BR'
    } = req.query

    if (!q) {
      return res.status(400).json({
        error: 'Query obrigatória'
      })
    }

    const cacheKey = `spotify_search_${q}_${type}`

    const cached = getCache(cacheKey)

    if (cached) {
      return res.json(cached)
    }

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q,
        type,
        limit: 10,
        market
      }
    })

    setCache(cacheKey, response.data)

    res.json(response.data)
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      error: 'Erro Spotify Search'
    })
  }
}

exports.getArtist = async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${req.params.id}`
    })

    res.json(response.data)
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar artista'
    })
  }
}

exports.getAlbum = async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/albums/${req.params.id}`
    })

    res.json(response.data)
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar álbum'
    })
  }
}

exports.getPlaylist = async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/playlists/${req.params.id}/tracks`,
      params: {
        limit: 20
      }
    })

    res.json(response.data)
  } catch (error) {
    res.status(500).json({
      error: 'Erro playlist'
    })
  }
}