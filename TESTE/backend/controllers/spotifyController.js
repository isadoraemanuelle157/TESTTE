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
    const { limit = 45, market = 'BR' } = req.query
    
    // Gêneros brasileiros/populares para buscar
    const generos = [
      'brazilian funk', 'sertanejo', 'pagode', 'samba', 'mpb', 
      'brazilian rock', 'pop', 'hip hop', 'rap', 'eletronica', 
      'gospel', 'reggae', 'indie', 'metal', 'jazz'
    ]

    // Buscar artistas por gênero (3 por gênero)
    const groups = []
    
    for (const genero of generos.slice(0, 15)) {
      try {
        const response = await spotifyRequest({
          method: 'GET',
          url: `${SPOTIFY_API_URL}/search`,
          params: { 
            q: `genre:"${genero}"`, 
            type: 'artist', 
            limit: 3, 
            market 
          }
        })

        const artists = response.data?.artists?.items || []
        
        if (artists.length > 0) {
          groups.push({
            genre: genero,
            artists: artists.map(artist => ({
              id: artist.id,
              name: artist.name,
              images: artist.images,
              popularity: artist.popularity,
              followers: artist.followers,
              genres: artist.genres
            }))
          })
        }
      } catch (err) {
        console.warn(`⚠️ Gênero ${genero} falhou:`, err.message)
        continue // ignora e vai pro próximo
      }
    }

    res.json({
      groups: groups,        // ← formato que o frontend espera
      totalGroups: groups.length,
      totalArtists: groups.reduce((sum, g) => sum + g.artists.length, 0)
    })

  } catch (error) {
    console.error('❌ Popular artists error:', error.message)
    // Retorna array vazio em vez de erro 500
    res.status(200).json({ 
      groups: [],
      totalGroups: 0,
      totalArtists: 0
    })
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

exports.getVibes = async (req, res) => {
  try {
    // Vibes baseadas em playlists/features do Spotify ou estáticas
    const vibes = [
      {
        id: 'spotify_festa',
        name: 'Festa',
        emoji: '🎉',
        description: 'Energia alta pra curtir com os amigos',
        gradient: 'linear-gradient(135deg,#ff512f,#dd2476)',
        tags: ['dança', 'noite', 'funkeira']
      },
      {
        id: 'spotify_chill',
        name: 'Chill',
        emoji: '🌈',
        description: 'Relaxar e desacelerar',
        gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
        tags: ['relax', 'acústico', 'tarde']
      },
      {
        id: 'spotify_treino',
        name: 'Treino',
        emoji: '💪',
        description: 'Energia pra academia',
        gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',
        tags: ['academia', 'foco', 'energia']
      },
      {
        id: 'spotify_focus',
        name: 'Focus',
        emoji: '🧠',
        description: 'Concentração total',
        gradient: 'linear-gradient(135deg,#36d1dc,#5b86e5)',
        tags: ['estudo', 'trabalho', 'lo-fi']
      },
      {
        id: 'spotify_sertanejo',
        name: 'Modão',
        emoji: '🤠',
        description: 'Raiz e sofrência',
        gradient: 'linear-gradient(135deg,#8B4513,#D2691E)',
        tags: ['sertanejo', 'modão', 'universitário']
      },
      {
        id: 'spotify_pagode',
        name: 'Pagode',
        emoji: '🪘',
        description: 'Roda de samba e resenha',
        gradient: 'linear-gradient(135deg,#FF6B35,#F7931E)',
        tags: ['samba', 'pagode', 'resenha']
      },
      {
        id: 'spotify_funk',
        name: 'Funk',
        emoji: '🔥',
        description: 'Batida brasileira',
        gradient: 'linear-gradient(135deg,#E91E63,#9C27B0)',
        tags: ['funk', 'baile', 'ritmo']
      },
      {
        id: 'spotify_gospel',
        name: 'Gospel',
        emoji: '🙏',
        description: 'Fé e inspiração',
        gradient: 'linear-gradient(135deg,#FFD700,#FF8C00)',
        tags: ['gospel', 'louvor', 'fé']
      }
    ]

    res.json(vibes)
  } catch (error) {
    console.error('❌ Vibes error:', error.message)
    res.status(200).json([]) // retorna vazio em vez de erro
  }
}