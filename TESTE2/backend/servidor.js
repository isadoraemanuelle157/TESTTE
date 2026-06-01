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

const { DEEZER_API_URL, SPOTIFY_API_URL } = require('./config/spotify')

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
    console.warn(`⚠️ Rota não encontrada: ${path} — ${err.message}`)
    return express.Router()
  }
}

// ============================================
// 📦 ROTAS
// ============================================
const { requireAuth, optionalAuth } = require('./middleware/auth')
const { spotifyRequest, isTokenValid } = require('./utils/spotifyRequest')
const cache = require('./utils/cache')
const { checkChatLimit } = require('./middleware/chatLimit')
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
const geniusRoutes = safeRequire('./routes/geniusRoutes')
const gameRoutes = safeRequire('./routes/gameRoutes')
const suporteRoutes = safeRequire('./routes/suporteRoutes')
const chatRoutes = safeRequire('./routes/chatRoutes')
const karaokeRoutes = safeRequire('./routes/karaokeRoutes')

// ============================================
// 📌 ROTAS APP
// ============================================
app.use('/usuarios', usuarioRoutes)
app.use('/musicas', musicaRoutes)
app.use('/generos', generoRoutes)
app.use('/cantores', cantorRoutes)
app.use('/albuns', albumRoutes)
app.use('/playlists', playlistRoutes)
app.use('/vibes', vibeRoutes)
app.use('/follows', followRoutes)
app.use('/spotify', spotifyRoutes)
app.use('/curtidas', requireAuth, curtidaRoutes)     // 🔒 Protegido
app.use('/favoritas', requireAuth, favoritaRoutes)   // 🔒 Protegido
app.use('/historico', requireAuth, historicoRoutes)  // 🔒 Protegido
app.use('/chats', requireAuth, chatRoutes)
app.use('/notificacoes', notificacaoRoutes)
app.use('/privacidade', privacidadeRoutes)
app.use('/matches', matchRoutes)
app.use('/deezer', deezerRoutes)
app.use('/locais', locaisRoutes)
app.use('/genius', geniusRoutes)
app.use('/game', gameRoutes)
app.use('/suporte', suporteRoutes)
app.use('/api/karaoke', karaokeRoutes)

app.post('/chat/message', checkChatLimit, async (req, res) => {
  try {
    const { message, context } = req.body
    
    const isLyricSearch = detectLyricSearch(message)
    let response
    
    if (isLyricSearch) {
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
      chatInfo: req.chatInfo
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
    icon: 'fa-solid fa-champagne-glasses',
    description: 'Energia alta',
    gradient: 'linear-gradient(135deg,#ff512f,#dd2476)'
  },
  {
    name: 'Chill',
    icon: 'fa-solid fa-cloud-sun',
    description: 'Relaxar',
    gradient: 'linear-gradient(135deg,#667eea,#764ba2)'
  },
  {
    name: 'Treino',
    icon: 'fa-solid fa-dumbbell',
    description: 'Academia',
    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)'
  },
  {
    name: 'Focus',
    icon: 'fa-solid fa-brain',
    description: 'Concentração',
    gradient: 'linear-gradient(135deg,#36d1dc,#5b86e5)'
  }
]

app.post('/spotify/refresh-token', requireAuth, async (req, res) => {
  try {
    const { refresh_token } = req.body || req.user?.spotifyRefreshToken
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token não fornecido' })
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }).toString(),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      scope: response.data.scope
    })

  } catch (error) {
    console.error('[SPOTIFY] Refresh token error:', error.response?.data || error.message)
    res.status(401).json({
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Não foi possível renovar o token do Spotify. Faça login novamente.'
    })
  }
})

// ============================================
// 🔍 BUSCA DE MÚSICAS LOCAIS
// ============================================
app.get('/musicas/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ error: 'Query obrigatória' })

    if (!dbConnected) return res.json([])

    const Musica = safeRequire('./models/Musica')
    
    const musicas = await Musica.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { 'cantores.nome': { $regex: q, $options: 'i' } },
        { 'albuns.nome': { $regex: q, $options: 'i' } }
      ]
    })
    .populate('cantores', 'nome')
    .populate('albuns', 'nome')
    .limit(20)

    res.json(musicas)
  } catch (error) {
    console.error('❌ Erro busca músicas:', error.message)
    res.status(500).json({ error: 'Erro ao buscar músicas' })
  }
})

// ============================================
// 🎵 ÁUDIO DA MÚSICA
// ============================================
app.get('/musicas/:id/audio', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const query = id
    const isAuthenticated = !!(req.user && req.user.id)

    // COM LOGIN -> SPOTIFY PRIMEIRO
    if (isAuthenticated) {
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
          spotifyResponse.data?.tracks?.items?.find(track => track.preview_url)

        if (spotifyTrack) {
          return res.json({
            source: 'spotify',
            url: spotifyTrack.preview_url,
            title: spotifyTrack.name,
            artist: spotifyTrack.artists?.map(a => a.name).join(', '),
            cover: spotifyTrack.album?.images?.[0]?.url
          })
        }
      } catch (err) {
        console.log('⚠️ Spotify preview falhou')
      }
    }

    // SEM LOGIN -> DEEZER PRIMEIRO
    try {
      const deezerResponse = await axios.get(`${DEEZER_API_URL}/search`, {
        params: {
          q: query,
          limit: 5
        }
      })

      const track = deezerResponse.data?.data?.find(t => t.preview)

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

    // fallback final
    if (!isAuthenticated) {
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
          spotifyResponse.data?.tracks?.items?.find(track => track.preview_url)

        if (spotifyTrack) {
          return res.json({
            source: 'spotify',
            url: spotifyTrack.preview_url,
            title: spotifyTrack.name,
            artist: spotifyTrack.artists?.map(a => a.name).join(', '),
            cover: spotifyTrack.album?.images?.[0]?.url
          })
        }
      } catch (err) {
        console.log('⚠️ Spotify fallback falhou')
      }
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
  console.log('🎮 Jogo Musical:')
  console.log('GET  /game/modes')
  console.log('GET  /game/modes/:modo/difficulties')
  console.log('POST /game/start')
  console.log('POST /game/answer')
  console.log('GET  /game/leaderboard')
  console.log('GET  /game/rewards/daily')
  console.log('POST /game/rewards/daily/claim')
  console.log('GET  /game/shop')
  console.log('POST /game/shop/buy')
  console.log('GET  /game/achievements')
  console.log('POST /game/achievements/claim')
  console.log('GET  /game/stats')
  console.log('GET  /game/activities/live')
})
