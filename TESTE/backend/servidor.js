require('dotenv').config()

const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

// ============================================
// 🗄️ BANCO DE DADOS
// ============================================
let dbConnected = false

try {
  require('./config/bancoDados')
  dbConnected = true
  console.log('✅ Banco de dados conectado')
} catch (err) {
  console.warn('⚠️ Banco não conectado:', err.message)
}

// ============================================
// 🔥 CONFIG
// ============================================
const PORT = process.env.PORT || 3002

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const DEEZER_API_URL = 'https://api.deezer.com'

// ============================================
// 🎵 TOKEN SPOTIFY
// ============================================
let spotifyToken = null
let tokenExpiresAt = 0

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiresAt - 60000) {
    return spotifyToken
  }

  try {
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString('base64'),

          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    spotifyToken = response.data.access_token
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000

    console.log('🎵 Token Spotify renovado')

    return spotifyToken
  } catch (error) {
    console.error(
      '❌ Erro token Spotify:',
      error.response?.data || error.message
    )

    throw new Error('Falha autenticação Spotify')
  }
}

// ============================================
// ⚡ CACHE
// ============================================
const cache = new Map()

function getCache(key, ttl = 300000) {
  const item = cache.get(key)

  if (!item) return null

  if (Date.now() - item.timestamp > ttl) {
    cache.delete(key)
    return null
  }

  return item.data
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// 🎵 SPOTIFY REQUEST
// ============================================
async function spotifyRequest(config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await getSpotifyToken()

      const response = await axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`
        }
      })

      return response
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        const retryAfter = parseInt(
          error.response.headers['retry-after'] || '2',
          10
        )

        const delay = Math.min(retryAfter * 1000, 15000)

        console.warn(`⏳ Spotify Rate Limit → ${delay}ms`)

        await sleep(delay)
      } else if (error.response?.status === 401) {
        spotifyToken = null
      } else {
        throw error
      }
    }
  }

  throw new Error('Spotify max retries exceeded')
}

// ============================================
// 🛡️ MIDDLEWARES
// ============================================
app.use(cors())

app.use(express.json({
  limit: '20mb'
}))

app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}))

// ============================================
// 📦 SAFE REQUIRE
// ============================================
function safeRequire(path) {
  try {
    return require(path)
  } catch (err) {
    console.warn(`⚠️ Rota não encontrada: ${path}`)
    return express.Router()
  }
}

// ============================================
// 📦 ROTAS
// ============================================
const { requireAuth, optionalAuth } = require('./middleware/auth')

const usuarioRoutes = safeRequire('./routes/usuarioRoutes')
const musicaRoutes = safeRequire('./routes/musicaRoutes')
const cantorRoutes = safeRequire('./routes/cantorRoutes')
const albumRoutes = safeRequire('./routes/albumRoutes')
const playlistRoutes = safeRequire('./routes/playlistRoutes')
const curtidaRoutes = safeRequire('./routes/curtidaRoutes')
const favoritaRoutes = safeRequire('./routes/favoritaRoutes')
const vibeRoutes = safeRequire('./routes/vibeRoutes')
const followRoutes = safeRequire('./routes/followRoutes')
const historicoRoutes = safeRequire('./routes/historicoRoutes')
const notificacaoRoutes = safeRequire('./routes/notificacaoRoutes')
const privacidadeRoutes = safeRequire('./routes/privacidadeAtividadeRoutes')
const matchRoutes = safeRequire('./routes/matchMusicalRoutes')                                                               
const generoRoutes = safeRequire('./routes/generosMusicaisRoutes')
const deezerRoutes = safeRequire('./routes/deezerRoutes')
const locaisRoutes = safeRequire('./routes/locaisRoutes')
const spotifyRoutes = safeRequire('./routes/spotifyRoutes')

// ============================================
// 📌 ROTAS APP
// ============================================
app.use('/usuarios', usuarioRoutes)                                                                                            
app.use('/generos', generoRoutes) 
app.use('/musicas', musicaRoutes)
app.use('/cantores', cantorRoutes)
app.use('/albuns', albumRoutes)
app.use('/playlists', playlistRoutes)
app.use('/vibes', vibeRoutes)
app.use('/follows', followRoutes)
app.use('/spotify', requireAuth, spotifyRoutes)      // 🔒 Protegido
app.use('/curtidas', requireAuth, curtidaRoutes)     // 🔒 Protegido
app.use('/favoritas', requireAuth, favoritaRoutes)   // 🔒 Protegido
app.use('/historico', requireAuth, historicoRoutes)  // 🔒 Protegido
app.use('/notificacoes', notificacaoRoutes)                                                                                                                                  
app.use('/privacidade', privacidadeRoutes)
app.use('/matches', matchRoutes)
app.use('/deezer', deezerRoutes)
app.use('/locais', locaisRoutes)

// ============================================
// 🎵 SPOTIFY SEARCH
// ============================================
app.get('/spotify/search', async (req, res) => {
  try {
    const {
      q,
      type = 'track,artist,album',
      limit = 10,
      market = 'BR'
    } = req.query

    if (!q) {
      return res.status(400).json({
        error: 'Query obrigatória'
      })
    }

    const cacheKey = `spotify_search_${q}_${type}_${limit}`

    const cached = getCache(cacheKey, 60000)

    if (cached) {
      return res.json(cached)
    }

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: {
        q,
        type,
        limit,
        market
      }
    })

    setCache(cacheKey, response.data)

    res.json(response.data)

  } catch (error) {
    console.error('❌ Spotify search:', error.message)

    res.status(500).json({
      error: 'Erro busca Spotify'
    })
  }
})

// ============================================
// 🎵 SPOTIFY ARTIST
// ============================================
app.get('/spotify/artist/:id', async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${req.params.id}`
    })

    res.json(response.data)

  } catch (error) {
    console.error('❌ Artist error:', error.message)

    res.status(500).json({
      error: 'Erro artista Spotify'
    })
  }
})

// ============================================
// 🎵 SPOTIFY ALBUM
// ============================================
app.get('/spotify/album/:id', async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/albums/${req.params.id}`
    })

    res.json(response.data)

  } catch (error) {
    console.error('❌ Album error:', error.message)

    res.status(500).json({
      error: 'Erro álbum Spotify'
    })
  }
})

// ============================================
// 🎵 PLAYLIST
// ============================================
app.get('/spotify/playlist/:id', async (req, res) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/playlists/${req.params.id}/tracks`,
      params: {
        limit: 50,
        market: 'BR'
      }
    })

    res.json(response.data)

  } catch (error) {
    console.error('❌ Playlist error:', error.message)

    res.status(500).json({
      error: 'Erro playlist Spotify'
    })
  }
})

// ============================================
// 🎵 DEEZER SEARCH
// ============================================
app.get('/deezer/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query

    if (!q) {
      return res.status(400).json({
        error: 'Query obrigatória'
      })
    }

    const response = await axios.get(
      `${DEEZER_API_URL}/search`,
      {
        params: {
          q,
          limit
        },
        timeout: 5000
      }
    )

    res.json(response.data)

  } catch (error) {
    console.error('❌ Deezer error:', error.message)

    res.status(500).json({
      error: 'Erro Deezer'
    })
  }
})

// ============================================
// 🎧 VIBES
// ============================================
const MOODS = [
  {
    name: 'Festa',
    emoji: '🎉',
    description: 'Energia alta',
    gradient: 'linear-gradient(135deg,#ff512f,#dd2476)'
  },

  {
    name: 'Chill',
    emoji: '🌈',
    description: 'Relaxar',
    gradient: 'linear-gradient(135deg,#667eea,#764ba2)'
  },

  {
    name: 'Treino',
    emoji: '💪',
    description: 'Academia',
    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)'
  },

  {
    name: 'Focus',
    emoji: '🧠',
    description: 'Concentração',
    gradient: 'linear-gradient(135deg,#36d1dc,#5b86e5)'
  }
]

app.get('/spotify/vibes', async (req, res) => {
  try {
    const cacheKey = 'spotify_vibes'

    const cached = getCache(cacheKey, 900000)

    if (cached) {
      return res.json(cached)
    }

    const vibes = MOODS.map((mood, index) => ({
      id: `vibe_${index}`,
      ...mood
    }))

    setCache(cacheKey, vibes)

    res.json(vibes)

  } catch (error) {
    console.error('❌ Erro vibes:', error.message)

    res.status(500).json({
      error: 'Erro vibes'
    })
  }
})

// ============================================
// 🎵 ARTISTAS POPULARES
// ============================================
app.get('/spotify/artists/popular', async (req, res) => {
  try {
    const genres = [
      'pop',
      'rock',
      'funk',
      'rap',
      'sertanejo',
      'mpb'
    ]

    const groups = []

    for (const genre of genres) {
      try {
        const response = await spotifyRequest({
          method: 'GET',
          url: `${SPOTIFY_API_URL}/search`,
          params: {
            q: genre,
            type: 'artist',
            limit: 3,
            market: 'BR'
          }
        })

        groups.push({
          genre,
          artists: response.data.artists.items
        })

        await sleep(1200)

      } catch (err) {
        console.warn(`⚠️ Falha gênero ${genre}`)
      }
    }

    res.json({
      totalGenres: groups.length,
      groups
    })

  } catch (error) {
    console.error('❌ Popular artists:', error.message)

    res.status(500).json({
      error: 'Erro artistas populares'
    })
  }
})

// ============================================
// 🎵 ÁUDIO DA MÚSICA
// ============================================
app.get('/musicas/:id/audio', async (req, res) => {
  try {
    const { id } = req.params

    const query = id

    // Spotify
    try {
      const spotifyResponse = await spotifyRequest({
        method: 'GET',
        url: `${SPOTIFY_API_URL}/search`,
        params: {
          q: query,
          type: 'track',
          limit: 5,
          market: 'BR'
        }
      })

      const spotifyTrack =
        spotifyResponse.data?.tracks?.items?.find(
          track => track.preview_url
        )

      if (spotifyTrack) {
        return res.json({
          source: 'spotify',
          url: spotifyTrack.preview_url,
          title: spotifyTrack.name,
          artist: spotifyTrack.artists
            ?.map(a => a.name)
            .join(', '),

          cover:
            spotifyTrack.album?.images?.[0]?.url
        })
      }

    } catch (err) {
      console.log('⚠️ Spotify preview falhou')
    }

    // Deezer fallback
    try {
      const deezerResponse = await axios.get(
        `${DEEZER_API_URL}/search`,
        {
          params: {
            q: query,
            limit: 5
          }
        }
      )

      const track = deezerResponse.data?.data?.find(
        t => t.preview
      )

      if (track) {
        return res.json({
          source: 'deezer',
          url: track.preview,
          title: track.title,
          artist: track.artist?.name,
          cover: track.album?.cover_medium
        })
      }

    } catch (err) {
      console.log('⚠️ Deezer preview falhou')
    }

    res.status(404).json({
      error: 'Preview não encontrado'
    })

  } catch (error) {
    console.error('❌ Audio error:', error.message)

    res.status(500).json({
      error: 'Erro áudio'
    })
  }
})

// ============================================
// 💚 HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    spotify: spotifyToken ? 'online' : 'offline',
    database: dbConnected ? 'online' : 'offline',
    cacheEntries: cache.size,
    timestamp: new Date().toISOString()
  })
})

// ============================================
// ❌ ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro global:', err)

  res.status(500).json({
    error: 'Erro interno servidor',
    details: err.message
  })
})

// ============================================
// 🚀 START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('')
  console.log('🚀 =================================')
  console.log(`🚀 SoundUp rodando → Porta ${PORT}`)
  console.log('🚀 =================================')
  console.log('')

  console.log('🎵 Spotify:')
  console.log('GET /spotify/search')
  console.log('GET /spotify/artist/:id')
  console.log('GET /spotify/album/:id')
  console.log('GET /spotify/playlist/:id')
  console.log('GET /spotify/artists/popular')
  console.log('GET /spotify/vibes')

  console.log('📍 Locais:')
console.log('GET /locais')
console.log('GET /locais/search')
console.log('GET /locais/:nome/musicas')

  console.log('')
  console.log('🎧 Deezer:')
  console.log('GET /deezer/search')

  console.log('')
  console.log('🎵 Áudio:')
  console.log('GET /musicas/:id/audio')

  console.log('')
  console.log('💚 Health:')
  console.log('GET /health')
  console.log('')
})
