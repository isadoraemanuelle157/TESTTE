const axios = require('axios')
const { spotifyRequest } = require('../utils/spotifyRequest')
const { 
  SPOTIFY_API_URL, 
  SPOTIFY_CLIENT_ID, 
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ACCOUNTS_URL,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
  FRONTEND_URL  // ← ADICIONAR AQUI
} = require('../config/spotify')
const { getCache, setCache } = require('../utils/cache')
const Usuario = require('../models/Usuario')

// ================= CACHE CONFIG =================
const CACHE_TTL = {
  search: 1000 * 60 * 15,        // 15 min
  artist: 1000 * 60 * 60,        // 1 hora
  album: 1000 * 60 * 60,         // 1 hora
  playlist: 1000 * 60 * 30,      // 30 min
popular: 1000 * 60 * 60 * 24,
  vibes: 1000 * 60 * 60 * 6      // 6 horas
}
// ================= FALLBACK DATA (dados estáticos) =================
// Quando o Spotify bloqueia (429), usamos esses dados reais
const FALLBACK_ARTISTS = [
  { genre: 'brazilian funk', artists: [
    { id: 'fb1', name: 'Anitta', images: [{url:null}], popularity: 95, followers: {total: 15000000}, genres: ['funk'] },
    { id: 'fb2', name: 'Ludmilla', images: [{url:null}], popularity: 90, followers: {total: 8000000}, genres: ['funk'] },
    { id: 'fb3', name: 'MC Kevin o Chris', images: [{url:null}], popularity: 85, followers: {total: 5000000}, genres: ['funk'] }
  ]},
  { genre: 'sertanejo', artists: [
    { id: 'fb4', name: 'Gusttavo Lima', images: [{url:null}], popularity: 92, followers: {total: 12000000}, genres: ['sertanejo'] },
    { id: 'fb5', name: 'Jorge & Mateus', images: [{url:null}], popularity: 88, followers: {total: 10000000}, genres: ['sertanejo'] },
    { id: 'fb6', name: 'Henrique & Juliano', images: [{url:null}], popularity: 86, followers: {total: 9000000}, genres: ['sertanejo'] }
  ]},
  { genre: 'pagode', artists: [
    { id: 'fb7', name: 'Grupo Revelação', images: [{url:null}], popularity: 85, followers: {total: 4000000}, genres: ['pagode'] },
    { id: 'fb8', name: 'Sorriso Maroto', images: [{url:null}], popularity: 87, followers: {total: 6000000}, genres: ['pagode'] },
    { id: 'fb9', name: 'Péricles', images: [{url:null}], popularity: 84, followers: {total: 3500000}, genres: ['pagode'] }
  ]},
  { genre: 'samba', artists: [
    { id: 'fb10', name: 'Zeca Pagodinho', images: [{url:null}], popularity: 88, followers: {total: 7000000}, genres: ['samba'] },
    { id: 'fb11', name: 'Martinho da Vila', images: [{url:null}], popularity: 82, followers: {total: 3000000}, genres: ['samba'] },
    { id: 'fb12', name: 'Beth Carvalho', images: [{url:null}], popularity: 80, followers: {total: 2500000}, genres: ['samba'] }
  ]},
  { genre: 'mpb', artists: [
    { id: 'fb13', name: 'Caetano Veloso', images: [{url:null}], popularity: 85, followers: {total: 5000000}, genres: ['mpb'] },
    { id: 'fb14', name: 'Gilberto Gil', images: [{url:null}], popularity: 84, followers: {total: 4500000}, genres: ['mpb'] },
    { id: 'fb15', name: 'Marisa Monte', images: [{url:null}], popularity: 83, followers: {total: 4000000}, genres: ['mpb'] }
  ]},
  { genre: 'brazilian rock', artists: [
    { id: 'fb16', name: 'Legião Urbana', images: [{url:null}], popularity: 90, followers: {total: 8000000}, genres: ['rock'] },
    { id: 'fb17', name: 'Paralamas do Sucesso', images: [{url:null}], popularity: 86, followers: {total: 5500000}, genres: ['rock'] },
    { id: 'fb18', name: 'Titãs', images: [{url:null}], popularity: 85, followers: {total: 5000000}, genres: ['rock'] }
  ]},
  { genre: 'pop', artists: [
    { id: 'fb19', name: 'Taylor Swift', images: [{url:null}], popularity: 98, followers: {total: 80000000}, genres: ['pop'] },
    { id: 'fb20', name: 'The Weeknd', images: [{url:null}], popularity: 96, followers: {total: 60000000}, genres: ['pop'] },
    { id: 'fb21', name: 'Dua Lipa', images: [{url:null}], popularity: 94, followers: {total: 45000000}, genres: ['pop'] }
  ]},
  { genre: 'hip hop', artists: [
    { id: 'fb22', name: 'Kendrick Lamar', images: [{url:null}], popularity: 95, followers: {total: 35000000}, genres: ['hip hop'] },
    { id: 'fb23', name: 'Drake', images: [{url:null}], popularity: 97, followers: {total: 70000000}, genres: ['hip hop'] },
    { id: 'fb24', name: 'Travis Scott', images: [{url:null}], popularity: 93, followers: {total: 30000000}, genres: ['hip hop'] }
  ]},
  { genre: 'rap', artists: [
    { id: 'fb25', name: 'Eminem', images: [{url:null}], popularity: 96, followers: {total: 60000000}, genres: ['rap'] },
    { id: 'fb26', name: 'Jay-Z', images: [{url:null}], popularity: 90, followers: {total: 40000000}, genres: ['rap'] },
    { id: 'fb27', name: 'Post Malone', images: [{url:null}], popularity: 94, followers: {total: 35000000}, genres: ['rap'] }
  ]},
  { genre: 'eletronica', artists: [
    { id: 'fb28', name: 'David Guetta', images: [{url:null}], popularity: 92, followers: {total: 30000000}, genres: ['eletronica'] },
    { id: 'fb29', name: 'Calvin Harris', images: [{url:null}], popularity: 91, followers: {total: 35000000}, genres: ['eletronica'] },
    { id: 'fb30', name: 'Skrillex', images: [{url:null}], popularity: 88, followers: {total: 20000000}, genres: ['eletronica'] }
  ]},
  { genre: 'gospel', artists: [
    { id: 'fb31', name: 'Aline Barros', images: [{url:null}], popularity: 85, followers: {total: 5000000}, genres: ['gospel'] },
    { id: 'fb32', name: 'Fernandinho', images: [{url:null}], popularity: 84, followers: {total: 4500000}, genres: ['gospel'] },
    { id: 'fb33', name: 'Cassiane', images: [{url:null}], popularity: 82, followers: {total: 3000000}, genres: ['gospel'] }
  ]},
  { genre: 'reggae', artists: [
    { id: 'fb34', name: 'Bob Marley', images: [{url:null}], popularity: 95, followers: {total: 25000000}, genres: ['reggae'] },
    { id: 'fb35', name: 'Natiruts', images: [{url:null}], popularity: 86, followers: {total: 6000000}, genres: ['reggae'] },
    { id: 'fb36', name: 'SOJA', images: [{url:null}], popularity: 80, followers: {total: 3500000}, genres: ['reggae'] }
  ]},
  { genre: 'indie', artists: [
    { id: 'fb37', name: 'Arctic Monkeys', images: [{url:null}], popularity: 93, followers: {total: 25000000}, genres: ['indie'] },
    { id: 'fb38', name: 'Tame Impala', images: [{url:null}], popularity: 91, followers: {total: 15000000}, genres: ['indie'] },
    { id: 'fb39', name: 'The Strokes', images: [{url:null}], popularity: 89, followers: {total: 12000000}, genres: ['indie'] }
  ]},
  { genre: 'metal', artists: [
    { id: 'fb40', name: 'Metallica', images: [{url:null}], popularity: 94, followers: {total: 35000000}, genres: ['metal'] },
    { id: 'fb41', name: 'Iron Maiden', images: [{url:null}], popularity: 92, followers: {total: 20000000}, genres: ['metal'] },
    { id: 'fb42', name: 'Sepultura', images: [{url:null}], popularity: 85, followers: {total: 6000000}, genres: ['metal'] }
  ]},
  { genre: 'jazz', artists: [
    { id: 'fb43', name: 'Miles Davis', images: [{url:null}], popularity: 82, followers: {total: 5000000}, genres: ['jazz'] },
    { id: 'fb44', name: 'John Coltrane', images: [{url:null}], popularity: 80, followers: {total: 4000000}, genres: ['jazz'] },
    { id: 'fb45', name: 'Norah Jones', images: [{url:null}], popularity: 85, followers: {total: 7000000}, genres: ['jazz'] }
  ]}
]

const FALLBACK_VIBES = [
  { id: 'spotify_festa', name: 'Festa', emoji: '🎉', description: 'Energia alta pra curtir com os amigos', gradient: 'linear-gradient(135deg,#ff512f,#dd2476)', tags: ['dança', 'noite', 'funkeira'] },
  { id: 'spotify_chill', name: 'Chill', emoji: '🌈', description: 'Relaxar e desacelerar', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', tags: ['relax', 'acústico', 'tarde'] },
  { id: 'spotify_treino', name: 'Treino', emoji: '💪', description: 'Energia pra academia', gradient: 'linear-gradient(135deg,#11998e,#38ef7d)', tags: ['academia', 'foco', 'energia'] },
  { id: 'spotify_focus', name: 'Focus', emoji: '🧠', description: 'Concentração total', gradient: 'linear-gradient(135deg,#36d1dc,#5b86e5)', tags: ['estudo', 'trabalho', 'lo-fi'] },
  { id: 'spotify_sertanejo', name: 'Modão', emoji: '🤠', description: 'Raiz e sofrência', gradient: 'linear-gradient(135deg,#8B4513,#D2691E)', tags: ['sertanejo', 'modão', 'universitário'] },
  { id: 'spotify_pagode', name: 'Pagode', emoji: '🥁', description: 'Roda de samba e resenha', gradient: 'linear-gradient(135deg,#FF6B35,#F7931E)', tags: ['samba', 'pagode', 'resenha'] },
  { id: 'spotify_funk', name: 'Funk', emoji: '🔥', description: 'Batida brasileira', gradient: 'linear-gradient(135deg,#E91E63,#9C27B0)', tags: ['funk', 'baile', 'ritmo'] },
  { id: 'spotify_gospel', name: 'Gospel', emoji: '🙏', description: 'Fé e inspiração', gradient: 'linear-gradient(135deg,#FFD700,#FF8C00)', tags: ['gospel', 'louvor', 'fé'] }
]

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

// ================= ATUALIZAR CACHE EM BACKGROUND =================
async function atualizarCacheArtistas(cacheKey, market, limit) {
  try {
    console.log('🔄 Atualizando cache em background:', cacheKey)
    
    const generos = [
      'brazilian funk', 'sertanejo', 'pagode', 'samba', 'mpb',
      'brazilian rock', 'pop', 'hip hop', 'rap', 'gospel'
    ]
    
    let searchResults = []
    let spotifyFailed = false
    const batchSize = 3

    for (let i = 0; i < generos.length; i += batchSize) {
      const batch = generos.slice(i, i + batchSize)
      
      const results = await Promise.allSettled(
        batch.map(async (genero) => {
          try {
            const response = await spotifyRequest({
              method: 'GET',
              url: `${SPOTIFY_API_URL}/search`,
              params: { q: `genre:"${genero}"`, type: 'artist', limit: 3, market }
            })
            const artists = response.data?.artists?.items || []
            if (artists.length === 0) return null
            
            const best = artists.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]
            return {
              genre: genero,
              id: best.id,
              name: best.name,
              popularity: best.popularity || 0,
              images: best.images || []
            }
          } catch (err) {
            if (err.isRateLimit || err.response?.status === 429) spotifyFailed = true
            return null
          }
        })
      )
      
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) searchResults.push(r.value)
      })
    }

    // Busca followers reais
    const artistIds = searchResults.map(r => r.id)
    let realFollowersMap = new Map()
    
    if (artistIds.length > 0) {
      const idsBatchSize = 50
      for (let i = 0; i < artistIds.length; i += idsBatchSize) {
        const batchIds = artistIds.slice(i, i + idsBatchSize).join(',')
        try {
          const response = await spotifyRequest({
            method: 'GET',
            url: `${SPOTIFY_API_URL}/artists`,
            params: { ids: batchIds }
          })
          
          const artistsDetails = response.data?.artists || []
          artistsDetails.forEach(a => {
            if (a && a.id) {
              realFollowersMap.set(a.id, a.followers?.total || 0)
            }
          })
        } catch (err) {
          console.warn('⚠️ Erro ao buscar detalhes batch:', err.message)
        }
      }
    }

    // Monta groups
    let groups = []
    searchResults.forEach(sr => {
      let followers = realFollowersMap.get(sr.id) || 0
      
      if (followers === 0) {
        const fallbackGenre = FALLBACK_ARTISTS.find(f => f.genre === sr.genre)
        const fallbackArtist = fallbackGenre?.artists.find(fa => 
          fa.name.toLowerCase() === sr.name.toLowerCase()
        )
        if (fallbackArtist?.followers?.total) {
          followers = fallbackArtist.followers.total
        }
      }

      groups.push({
        genre: sr.genre,
        artists: [{
          id: sr.id,
          name: sr.name,
          images: sr.images,
          popularity: sr.popularity,
          nb_fan: followers,
          fans: followers,
          original_nb_fan: followers,
          followers: { total: followers },
          genres: [sr.genre]
        }]
      })
    })

    const finalGroups = groups.length === 0 ? FALLBACK_ARTISTS : groups
    
    const allArtistsFlat = finalGroups.flatMap(g => 
      (g.artists || []).map(a => ({
        id: a.id,
        name: a.name,
        images: a.images,
        popularity: a.popularity,
        nb_fan: a.nb_fan || a.followers?.total || 0,
        fans: a.fans || a.followers?.total || 0,
        original_nb_fan: a.original_nb_fan || a.nb_fan || a.followers?.total || 0,
        followers: a.followers || { total: 0 },
        genres: a.genres,
        genreGroup: g.genre
      }))
    )

    const result = {
      groups: finalGroups,
      artists: allArtistsFlat,
      totalGroups: finalGroups.length,
      totalArtists: allArtistsFlat.length,
      fromCache: false,
      usedFallback: groups.length === 0 || spotifyFailed
    }

    setCache(cacheKey, result, CACHE_TTL.popular)
    console.log('✅ Cache atualizado em background:', cacheKey)

  } catch (error) {
    console.error('❌ Erro ao atualizar cache em background:', error.message)
  }
}

// ================= POPULAR ARTISTS =================
exports.getPopularArtists = async (req, res) => {
  const { limit = 45, market = 'BR' } = req.query
  const cacheKey = `spotify_popular_artists_${market}_${limit}`

  // ✅ CACHE PRIMEIRO - retorna imediatamente se tiver
  const cached = getCache(cacheKey)
  if (cached) {
    console.log('📦 Cache hit - retornando imediatamente')
    setImmediate(() => atualizarCacheArtistas(cacheKey, market, limit))
    return res.json(cached)
  }

  try {
    const generos = [
      'brazilian funk', 'sertanejo', 'pagode', 'samba', 'mpb',
      'brazilian rock', 'pop', 'hip hop', 'rap', 'gospel'
    ]
    
    let searchResults = [] // Guarda {id, name, genre, popularity} do search
    let spotifyFailed = false
    const batchSize = 3

    // === PASSO 1: Busca search de todos os gêneros em paralelo ===
    for (let i = 0; i < generos.length; i += batchSize) {
      const batch = generos.slice(i, i + batchSize)
      
      const results = await Promise.allSettled(
        batch.map(async (genero) => {
          try {
            const response = await spotifyRequest({
              method: 'GET',
              url: `${SPOTIFY_API_URL}/search`,
              params: { q: `genre:"${genero}"`, type: 'artist', limit: 3, market }
            })
            const artists = response.data?.artists?.items || []
            if (artists.length === 0) return null
            
            const best = artists.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]
            return {
              genre: genero,
              id: best.id,
              name: best.name,
              popularity: best.popularity || 0,
              images: best.images || []
            }
          } catch (err) {
            if (err.isRateLimit || err.response?.status === 429) spotifyFailed = true
            return null
          }
        })
      )
      
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) searchResults.push(r.value)
      })
    }

    // === PASSO 2: Busca followers REAIS em batch (até 50 IDs por request) ===
    const artistIds = searchResults.map(r => r.id)
    let realFollowersMap = new Map() // id -> followers
    
    if (artistIds.length > 0) {
      // Spotify permite até 50 IDs por request no endpoint /artists
      const idsBatchSize = 50
      for (let i = 0; i < artistIds.length; i += idsBatchSize) {
        const batchIds = artistIds.slice(i, i + idsBatchSize).join(',')
        try {
          const response = await spotifyRequest({
            method: 'GET',
            url: `${SPOTIFY_API_URL}/artists`,
            params: { ids: batchIds }
          })
          
          const artistsDetails = response.data?.artists || []
          artistsDetails.forEach(a => {
            if (a && a.id) {
              realFollowersMap.set(a.id, a.followers?.total || 0)
            }
          })
        } catch (err) {
          console.warn('⚠️ Erro ao buscar detalhes batch:', err.message)
        }
      }
    }

    // === PASSO 3: Monta groups com followers reais (ou fallback) ===
    let groups = []
    
    searchResults.forEach(sr => {
      let followers = realFollowersMap.get(sr.id) || 0
      
      // Se ainda vier 0, tenta fallback pelo nome
      if (followers === 0) {
        const fallbackGenre = FALLBACK_ARTISTS.find(f => f.genre === sr.genre)
        const fallbackArtist = fallbackGenre?.artists.find(fa => 
          fa.name.toLowerCase() === sr.name.toLowerCase()
        )
        if (fallbackArtist?.followers?.total) {
          followers = fallbackArtist.followers.total
          console.log(`📦 Fallback followers para ${sr.name}: ${followers}`)
        }
      }

      groups.push({
        genre: sr.genre,
        artists: [{
          id: sr.id,
          name: sr.name,
          images: sr.images,
          popularity: sr.popularity,
          nb_fan: followers,
          fans: followers,
          original_nb_fan: followers,
          followers: { total: followers },
          genres: [sr.genre]
        }]
      })
    })

    // Se não conseguiu nada do Spotify, usa fallback total
    const finalGroups = groups.length === 0 ? FALLBACK_ARTISTS : groups
    
    const allArtistsFlat = finalGroups.flatMap(g => 
      (g.artists || []).map(a => ({
        id: a.id,
        name: a.name,
        images: a.images,
        popularity: a.popularity,
        nb_fan: a.nb_fan || a.followers?.total || 0,
        fans: a.fans || a.followers?.total || 0,
        original_nb_fan: a.original_nb_fan || a.nb_fan || a.followers?.total || 0,
        followers: a.followers || { total: 0 },
        genres: a.genres,
        genreGroup: g.genre
      }))
    )

    const result = {
      groups: finalGroups,
      artists: allArtistsFlat,
      totalGroups: finalGroups.length,
      totalArtists: allArtistsFlat.length,
      fromCache: false,
      usedFallback: groups.length === 0 || spotifyFailed
    }

    setCache(cacheKey, result, CACHE_TTL.popular)
    console.log(`✅ Popular artists: ${result.totalArtists} artistas (${spotifyFailed ? 'com fallback' : 'Spotify'})`)
    res.json(result)

  } catch (error) {
    console.error('❌ Popular artists error:', error.message)
    const fallbackResult = {
      groups: FALLBACK_ARTISTS,
      artists: FALLBACK_ARTISTS.flatMap(g => 
        (g.artists || []).map(a => ({
          id: a.id, name: a.name, images: a.images, popularity: a.popularity,
          nb_fan: a.followers?.total || 0, fans: a.followers?.total || 0,
          original_nb_fan: a.followers?.total || 0,
          followers: a.followers || { total: 0 },
          genres: a.genres, genreGroup: g.genre
        }))
      ),
      totalGroups: FALLBACK_ARTISTS.length,
      totalArtists: FALLBACK_ARTISTS.reduce((sum, g) => sum + g.artists.length, 0),
      fromCache: false, usedFallback: true
    }
    res.status(200).json(fallbackResult)
  }
}
// ================= VIBES (CACHE + FALLBACK ESTÁTICO) =================
exports.getVibes = async (req, res) => {
  const cacheKey = 'spotify_vibes'
  
  try {
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('📦 Cache hit: vibes')
      return res.json(cached)
    }

    // ✅ Usa dados estáticos (não consome rate limit do Spotify)
    const vibes = FALLBACK_VIBES

    setCache(cacheKey, vibes, CACHE_TTL.vibes)
    
    console.log('✅ Vibes carregadas (estáticas + cache)')
    res.json(vibes)
  } catch (error) {
    console.error('❌ Vibes error:', error.message)
    res.status(200).json(FALLBACK_VIBES)
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

// ================= OAUTH: INITIATE AUTH =================
exports.initiateAuth = async (req, res) => {
  try {
    // Pega o token JWT do header Authorization
    const authHeader = req.headers.authorization
    const appToken = authHeader?.replace('Bearer ', '')
    
    console.log('🔍 initiateAuth - appToken presente:', !!appToken)

    if (!appToken) {
      return res.status(401).json({ error: 'Token do app necessário. Faça login primeiro.' })
    }

    // Codifica o appToken no state (base64) para recuperar no callback
    const stateData = JSON.stringify({
      random: Math.random().toString(),
      appToken: appToken  // ← ISSO É CRÍTICO
    })
    const state = Buffer.from(stateData).toString('base64')

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      state: state,
      show_dialog: 'true'
    })

    const authUrl = `${SPOTIFY_ACCOUNTS_URL}?${params.toString()}`

    console.log('✅ Auth URL gerada:', authUrl.substring(0, 80) + '...')

    res.json({ authUrl, state })
  } catch (error) {
    console.error('❌ Initiate auth error:', error)
    res.status(500).json({ error: 'Erro ao iniciar autenticação Spotify' })
  }
}

// ================= OAUTH: CALLBACK =================
exports.callback = async (req, res) => {
  try {
    const { code, state, error: spotifyError } = req.query

    console.log('🔍 Callback recebido:', { code: !!code, state: !!state, error: spotifyError })

    // Decodifica o state para pegar o appToken
    let appToken = null
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        appToken = stateData.appToken
        console.log('✅ AppToken decodificado do state:', !!appToken)
      }
    } catch (e) {
      console.error('❌ Erro ao decodificar state:', e.message)
    }

    // FALLBACK: tenta pegar do query param
    if (!appToken) {
      appToken = req.query.app_token
      console.log('⚠️ Usando app_token do query param:', !!appToken)
    }

    if (spotifyError) {
      console.error('❌ Spotify retornou erro:', spotifyError)
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent(spotifyError)}`)
    }

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Code não fornecido')}`)
    }

    if (!appToken) {
      console.error('❌ appToken está NULO')
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Token do app não encontrado. Faça login novamente.')}`)
    }

    // Troca code por tokens do Spotify
    let tokenResponse
    try {
      tokenResponse = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          client_secret: SPOTIFY_CLIENT_SECRET
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )
    } catch (err) {
      console.error('❌ Erro ao trocar code por token:', err.response?.data || err.message)
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Erro ao autenticar com Spotify')}`)
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Decodifica token do app para pegar userId
    const jwt = require('jsonwebtoken')
    let decoded
    try {
      decoded = jwt.verify(appToken, process.env.JWT_SECRET)
      console.log('✅ JWT decodificado:', { id: decoded.id, _id: decoded._id, userId: decoded.userId })
    } catch (e) {
      console.error('❌ JWT inválido:', e.message)
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Token do app inválido ou expirado')}`)
    }
    
    // ✅ CORREÇÃO: Pegar o ID de todas as possíveis propriedades
    const userId = decoded.id || decoded._id || decoded.userId || decoded.sub
    
    if (!userId) {
      console.error('❌ userId não encontrado no JWT. Payload:', decoded)
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('ID do usuário não encontrado no token')}`)
    }

    console.log('🔍 Buscando usuário:', userId)

    // Salva tokens no usuário
    const user = await Usuario.findById(userId)
    
    if (!user) {
      console.error('❌ Usuário não encontrado no banco:', userId)
      return res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Usuário não encontrado. Faça login novamente.')}`)
    }

    console.log('✅ Usuário encontrado:', user.email || user.nome)

    user.spotifyAccessToken = access_token
    user.spotifyRefreshToken = refresh_token
    user.spotifyTokenExpiresAt = new Date(Date.now() + expires_in * 1000)
    user.spotifyConnected = true
    await user.save()

    console.log('✅ Spotify conectado com sucesso para:', userId)
    res.redirect(`${FRONTEND_URL}/spotify-connected?success=true`)

  } catch (error) {
    console.error('❌ Spotify callback error GERAL:', error.message, error.stack)
    res.redirect(`${FRONTEND_URL}/spotify-connected?error=${encodeURIComponent('Erro interno: ' + error.message)}`)
  }
}
// ================= OAUTH: REFRESH TOKEN MANUAL =================
exports.refreshUserToken = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const user = await Usuario.findById(userId)
    
    if (!user || !user.spotifyRefreshToken) {
      return res.status(403).json({ error: 'Spotify não conectado' })
    }
    
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotifyRefreshToken
      }).toString(),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    
    await user.updateSpotifyTokens(
      response.data.access_token,
      user.spotifyRefreshToken,
      response.data.expires_in
    )
    
    res.json({ success: true, expires_in: response.data.expires_in })
  } catch (error) {
    console.error('❌ Refresh error:', error.response?.data || error.message)
    res.status(500).json({ error: 'Erro ao renovar token' })
  }
}

// ================= BUSCA COM STREAMING URL =================
exports.searchFullTracks = async (req, res) => {
  try {
    const { q, type = 'track', market = 'BR' } = req.query
    if (!q) return res.status(400).json({ error: 'Query obrigatória' })

    // ✅ USA O TOKEN DO USUÁRIO do middleware requireSpotifyAuth
    const userToken = req.spotifyUserToken
    
    if (!userToken) {
      return res.status(403).json({ 
        error: 'Spotify não conectado',
        message: 'Conecte sua conta Spotify para buscar músicas completas'
      })
    }

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: { q, type, limit: 20, market }
    }, 3, userToken) // ✅ Passa userToken aqui

    const data = response.data
    if (data.tracks?.items) {
      data.tracks.items = data.tracks.items.map(track => ({
        ...track,
        _fullTrack: true,
        _source: 'spotify_full'
      }))
    }

    res.json(data)
  } catch (error) {
    if (error.isUserTokenExpired) {
      return res.status(401).json({ 
        error: 'Token Spotify expirado',
        needsReconnect: true 
      })
    }
    console.error('❌ Full tracks search:', error.message)
    res.status(500).json({ error: 'Erro na busca', details: error.message })
  }
}


// ================= VERIFICAR STATUS DO SPOTIFY =================
exports.getSpotifyStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const user = await Usuario.findById(userId).select('spotifyConnected spotifyTokenExpiresAt')
    
    res.json({
      connected: user?.spotifyConnected || false,
      tokenValid: user?.isSpotifyTokenValid() || false
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status' })
  }
}

// ================= ALBUM TRACKS =================
exports.getAlbumTracks = async (req, res) => {
  try {
    const { id } = req.params
    const limit = parseInt(req.query.limit) || 50
    const market = req.query.market || 'BR'
    
    // ✅ USA O TOKEN DO USUÁRIO para full tracks
    const userToken = req.spotifyUserToken

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/albums/${id}/tracks`,
      params: { limit, market }
    }, 3, userToken)

    res.json(response.data)
  } catch (error) {
    console.error('❌ Album tracks error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar tracks do álbum', details: error.message })
  }
}