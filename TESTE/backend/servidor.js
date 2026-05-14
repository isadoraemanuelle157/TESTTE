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

const { DEEZER_API_URL } = require('./config/spotify')

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
const { spotifyRequest, isTokenValid } = require('./utils/spotifyRequest')
const cache = require('./utils/cache')

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
const geniusRoutes = require('./routes/geniusRoutes')

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
app.use('/genius', geniusRoutes)

app.post('/chat/message', checkChatLimit, async (req, res) => {
  try {
    const { message, context } = req.body
    
    // Aqui integraria com OpenAI/Claude/etc
    // Por enquanto, simula resposta inteligente
    
    const isLyricSearch = detectLyricSearch(message)
    let response
    
    if (isLyricSearch) {
      // Buscar no Genius
      const geniusResults = await searchGenius(message)
      response = {
        type: 'lyric_search',
        content: `Encontrei essas músicas com trechos similares:`,
        songs: geniusResults
      }
    } else {
      response = {
        type: 'general',
        content: generateAIResponse(message, context)
      }
    }

    res.json({
      ...response,
      chatInfo: req.chatInfo // Informações do limite
    })

  } catch (error) {
    res.status(500).json({ error: 'Erro no chat' })
  }
})

// Rota para verificar limite atual
app.get('/chat/limit', (req, res) => {
  const { getChatCount, CHAT_LIMIT } = require('./middleware/chatLimit')
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown'
  
  const used = getChatCount(clientIp)
  const isAuthenticated = !!(req.user && req.user.id)
  
  res.json({
    limit: CHAT_LIMIT,
    used: isAuthenticated ? 0 : used,
    remaining: isAuthenticated ? 'unlimited' : Math.max(0, CHAT_LIMIT - used),
    isAuthenticated,
    blocked: !isAuthenticated && used >= CHAT_LIMIT
  })
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
    spotify: isTokenValid() ? 'online' : 'offline',
    database: dbConnected ? 'online' : 'offline',
    cacheEntries: cache.cache.size,
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
