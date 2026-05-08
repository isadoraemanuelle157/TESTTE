const { spotifyRequest } = require('../utils/spotifyRequest')
const { SPOTIFY_API_URL } = require('../config/spotify')
const { getCache, setCache } = require('../utils/cache')

// ================= SEARCH =================
exports.search = async (req, res) => {
  try {
    const { q, type = 'track,artist,album', market = 'BR' } = req.query
    if (!q) return res.status(400).json({ error: 'Query obrigatória' })

    const cacheKey = `spotify_search_${q}_${type}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: { q, type, limit: 10, market }
    })

    setCache(cacheKey, response.data)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Spotify search:', error.message)
    res.status(500).json({ error: 'Erro Spotify Search', details: error.message })
  }
}

// ================= ARTIST =================
exports.getArtist = async (req, res) => {
  try {
    console.log('🔍 getArtist chamado com ID:', req.params.id)
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${req.params.id}`
    })
    console.log('✅ getArtist sucesso')
    res.json(response.data)
  } catch (error) {
    console.error('❌ Artist error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar artista', details: error.message })
  }
}

// ================= ARTIST TOP TRACKS =================
exports.getArtistTopTracks = async (req, res) => {
  try {
    const { id } = req.params
    // Se não passar market, não envia (Spotify usa o mercado do token)
    const market = req.query.market || 'US'
    
    console.log('🔍 getArtistTopTracks:', { id, market })

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${id}/top-tracks`,
      params: { market }
    })

    console.log('✅ getArtistTopTracks sucesso')
    res.json(response.data)
  } catch (error) {
    console.error('❌ Artist top tracks error:', error.response?.data?.error?.message || error.message)
    // Retorna array vazio em vez de erro 500 para não quebrar o frontend
    res.status(200).json({ tracks: [] })
  }
}

// ================= ARTIST ALBUMS =================
exports.getArtistAlbums = async (req, res) => {
  try {
    const { id } = req.params
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    
    console.log('🔍 getArtistAlbums:', { id, limit, offset })

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${id}/albums`,
      params: {
        limit: limit,
        offset: offset,
        include_groups: 'album,single,compilation'
      }
    })

    console.log('✅ getArtistAlbums sucesso, items:', response.data.items?.length || 0)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Artist albums error:', error.response?.data?.error?.message || error.message)
    res.status(200).json({ items: [], total: 0 })
  }
}

// ================= RELATED ARTISTS =================
exports.getRelatedArtists = async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 getRelatedArtists:', id)

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${id}/related-artists`
    })

    console.log('✅ getRelatedArtists sucesso')
    res.json(response.data)
  } catch (error) {
    console.error('❌ Related artists error:', error.response?.data?.error?.message || error.message)
    res.status(200).json({ artists: [] })
  }
}
// ================= ALBUM =================
exports.getAlbum = async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/albums/${req.params.id}`
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Album error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar álbum', details: error.message })
  }
}

// ================= POPULAR ARTISTS =================
exports.getPopularArtists = async (req, res) => {
  try {
    const { limit = 10, market = 'BR' } = req.query
    
    // Buscar artistas populares do Brasil diretamente
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: { 
        q: 'genre:"brazilian"', 
        type: 'artist', 
        limit: limit, 
        market 
      }
    })

    res.json({
      artists: response.data.artists // já no formato correto
    })
  } catch (error) {
    console.error('❌ Popular artists error:', error.message)
    res.status(500).json({ error: 'Erro artistas populares' })
  }
}

// ================= PLAYLIST =================
exports.getPlaylist = async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/playlists/${req.params.id}/tracks`,
      params: { limit: 50, market: 'BR' }
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Playlist error:', error.message)
    res.status(500).json({ error: 'Erro playlist', details: error.message })
  }
}