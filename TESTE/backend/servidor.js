const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

// Tenta conectar ao banco, mas não falha se não conseguir
let dbConnected = false
try {
  require('./config/bancoDados')
  dbConnected = true
  console.log('✅ Banco de dados conectado')
} catch (err) {
  console.warn('⚠️ Banco de dados não conectado:', err.message)
  console.log('   O servidor vai rodar mesmo assim, mas rotas que precisam do banco podem falhar.')
}

// ============================================
// 🎵 SPOTIFY CONFIGURAÇÃO
// ============================================
const SPOTIFY_CLIENT_ID = 'cda0f08c0e8744a2a021aceea8d9e0df'
const SPOTIFY_CLIENT_SECRET = 'cc19aea0c1b7441c802247a609ef00bb'
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const DEEZER_API_URL = 'https://api.deezer.com'

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
          'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    spotifyToken = response.data.access_token
    tokenExpiresAt = Date.now() + (response.data.expires_in * 1000)
    console.log('🎵 Spotify token renovado')
    return spotifyToken
  } catch (error) {
    console.error('❌ Erro ao obter token Spotify:', error.response?.data || error.message)
    throw new Error('Falha na autenticação com Spotify')
  }
}

// ============================================
// 🛡️ CACHE & RATE LIMIT HANDLING
// ============================================
const cache = new Map()

function getCache(key, ttlMs = 300000) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < ttlMs) {
    return entry.data
  }
  return null
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Spotify request com retry automático em 429
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
        const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10)
        const delay = Math.max(retryAfter * 1000, (i + 1) * 1000)
        console.warn(`⏳ Rate limit (429). Aguardando ${delay}ms antes de retry ${i + 1}/${retries - 1}...`)
        await sleep(delay)
      } else if (error.response?.status === 401) {
        spotifyToken = null
        if (i < retries - 1) {
          await sleep(500)
          continue
        }
        throw error
      } else {
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}

// ============================================
// IMPORTA ROTAS EXISTENTES (com try-catch)
// ============================================
function safeRequire(path) {
  try {
    return require(path)
  } catch (err) {
    console.warn(`⚠️ Rota não encontrada: ${path}`, err.message)
    return express.Router()
  }
}

const usuarioRoutes = safeRequire('./routes/usuarioRoutes')
const generoRoutes = safeRequire('./routes/generosMusicaisRoutes')
const musicaRoutes = safeRequire('./routes/musicaRoutes')
const albumRoutes = safeRequire('./routes/albumRoutes')
const cantorRoutes = safeRequire('./routes/cantorRoutes')
const playlistRoutes = safeRequire('./routes/playlistRoutes')
const curtidaRoutes = safeRequire('./routes/curtidaRoutes')
const favoritaRoutes = safeRequire('./routes/favoritaRoutes')
const vibeRoutes = safeRequire('./routes/vibeRoutes')
const followRoutes = safeRequire('./routes/followRoutes')
const historicoRoutes = safeRequire('./routes/historicoRoutes')
const notificacaoRoutes = safeRequire('./routes/notificacaoRoutes')
const privacidadeAtividadeRoutes = safeRequire('./routes/privacidadeAtividadeRoutes')

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Middleware: Verifica se banco está conectado
app.use((req, res, next) => {
  if (!dbConnected && req.path !== '/health') {
    const dbRoutes = ['/usuarios', '/generos', '/musicas', '/albuns', '/cantores',
                    '/playlists', '/curtidas', '/favoritas', '/vibes', '/follows',
                    '/historico', '/notificacoes', '/privacidade']
    if (dbRoutes.some(route => req.path.startsWith(route))) {
      return res.status(503).json({
        error: 'Banco de dados não conectado',
        message: 'O servidor está rodando, mas o banco de dados não está acessível. Verifique a conexão.'
      })
    }
  }
  next()
})

// ============================================
// 🎵 ROTAS DO SPOTIFY (PROXY)
// ============================================
function validateLimit(limit, max = 50, fallback = 20) {
  const parsed = parseInt(limit, 10)
  if (isNaN(parsed) || parsed < 1) return fallback
  if (parsed > max) return max
  return parsed
}

function validateSearchLimit(limit) {
  return validateLimit(limit, 10, 5)
}

function validatePlaylistLimit(limit) {
  return validateLimit(limit, 100, 20)
}

// SPOTIFY SEARCH
app.get('/spotify/search', async (req, res) => {
  try {
    const { q, type = 'track,artist,album', market = 'BR' } = req.query
    const limit = validateSearchLimit(req.query.limit)
    const offset = parseInt(req.query.offset, 10) || 0

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' })
    }

    const cacheKey = `search_${q.trim()}_${type}_${limit}_${offset}_${market}`
    const cached = getCache(cacheKey, 60000)
    if (cached) {
      console.log('⚡ Cache hit: /spotify/search')
      return res.json(cached)
    }

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/search`,
      params: { q: q.trim(), type, limit, offset, market }
    })

    setCache(cacheKey, response.data)
    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro na busca Spotify:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      spotifyToken = null
      return res.status(401).json({ error: 'Token expirado, tente novamente' })
    }
    res.status(500).json({
      error: 'Erro ao buscar no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// DEEZER SEARCH
app.get('/deezer/search', async (req, res) => {
  try {
    const { q } = req.query
    const limit = parseInt(req.query.limit, 10) || 20

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' })
    }

    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: q.trim(), limit },
      timeout: 5000
    })

    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro na busca Deezer:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Erro ao buscar no Deezer',
      details: error.response?.data || error.message
    })
  }
})

// SPOTIFY PLAYLIST
app.get('/spotify/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params
    const limit = validatePlaylistLimit(req.query.limit)
    const offset = parseInt(req.query.offset, 10) || 0
    const market = req.query.market || 'BR'

    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/playlists/${id}/tracks`,
      params: { limit, offset, market }
    })

    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro ao buscar playlist Spotify:', error.response?.data || error.message)
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Playlist privada ou acesso negado',
        details: 'Essa playlist não está acessível com o token atual.'
      })
    }
    res.status(500).json({
      error: 'Erro ao buscar playlist no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// SPOTIFY ARTIST
app.get('/spotify/artist/:id', async (req, res) => {
  try {
    const { id } = req.params
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/artists/${id}`
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro ao buscar artista Spotify:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Erro ao buscar artista no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// SPOTIFY ALBUM
app.get('/spotify/album/:id', async (req, res) => {
  try {
    const { id } = req.params
    const response = await spotifyRequest({
      method: 'GET',
      url: `${SPOTIFY_API_URL}/albums/${id}`
    })
    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro ao buscar álbum Spotify:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Erro ao buscar álbum no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})
// ============================================
// 🎵 VIBES (ROTA FALTANDO - CORREÇÃO)
// ============================================
app.get('/spotify/vibes', async (req, res) => {
  try {
    const cached = getCache(VIBES_CACHE_KEY, VIBES_TTL)
    if (cached) {
      console.log('⚡ Cache hit: /spotify/vibes')
      return res.json(cached)
    }

    // Aqui você pode enriquecer depois com Spotify se quiser
    const vibes = MOODS.map((mood, index) => ({
      id: `spotify_vibe_${index}`,
      name: mood.name,
      emoji: mood.emoji,
      description: mood.description,
      tags: mood.tags,
      gradient: mood.gradient,
      source: 'spotify'
    }))

    setCache(VIBES_CACHE_KEY, vibes)

    console.log(`🎧 ${vibes.length} vibes carregadas`)
    res.json(vibes)

  } catch (error) {
    console.error('❌ Erro ao gerar vibes:', error.message)
    res.status(500).json({
      error: 'Erro ao carregar vibes'
    })
  }
})

// ============================================
// 🎵 ARTISTAS POPULARES (15 GÊNEROS, 3 ARTISTAS CADA)
// ============================================
const POPULAR_ARTISTS_CACHE_KEY = 'popular_artists'
const POPULAR_ARTISTS_TTL = 10 * 60 * 1000 // 10 minutos

const GENRE_QUERIES = [
  'pop', 'rock', 'funk', 'rap',
  'sertanejo', 'mpb', 'pagode', 'eletronica', 'reggae',
  'gospel', 'samba', 'indie', 'metal', 'jazz'
]

function formatGenreLabel(genre) {
  const map = {
    pop: 'Pop',
    rock: 'Rock',
    funk: 'Funk',
    rap: 'Rap',
    trap: 'Trap',
    sertanejo: 'Sertanejo',
    mpb: 'MPB',
    pagode: 'Pagode',
    eletronica: 'Eletrônica',
    reggae: 'Reggae',
    gospel: 'Gospel',
    samba: 'Samba',
    indie: 'Indie',
    metal: 'Metal',
    jazz: 'Jazz'
  }

  return map[genre] || genre.charAt(0).toUpperCase() + genre.slice(1)
}

app.get('/spotify/artists/popular', async (req, res) => {
  try {
    console.log('🔥 /spotify/artists/popular chamada', req.query)

    const market = req.query.market || 'BR'
    const cacheKey = `${POPULAR_ARTISTS_CACHE_KEY}_${market}`

    const cached = getCache(cacheKey, POPULAR_ARTISTS_TTL)
    if (cached) {
      console.log('⚡ Cache hit: /spotify/artists/popular')
      return res.json(cached)
    }

    const groups = []

    for (const genre of GENRE_QUERIES.slice(0, 15)) {
      try {
        const response = await spotifyRequest({
          method: 'GET',
          url: `${SPOTIFY_API_URL}/search`,
          params: {
            q: genre,
            type: 'artist',
            limit: 10,
            market
          }
        })

        const items = response.data?.artists?.items || []

        const top3 = items.slice(0, 3)

        groups.push({
          genre: formatGenreLabel(genre),
          artists: top3
        })

        if (genre !== GENRE_QUERIES[GENRE_QUERIES.length - 1]) {
          await sleep(400)
        }
      } catch (err) {
        console.warn(`⚠️ Falha na query "${genre}":`, err.message)

        groups.push({
          genre: formatGenreLabel(genre),
          artists: []
        })
      }
    }

    const flatArtists = groups.flatMap(group =>
      group.artists.map(artist => ({
        ...artist,
        genre_group: group.genre
      }))
    )

    const payload = {
      totalGenres: groups.length,
      artistsPerGenre: 3,
      groups,
      artists: {
        items: flatArtists,
        total: flatArtists.length
      }
    }

    setCache(cacheKey, payload)

    console.log(`✅ /spotify/artists/popular -> ${groups.length} gêneros, ${flatArtists.length} artistas`)
    res.json(payload)
  } catch (error) {
    console.error('❌ Erro ao buscar artistas populares:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Erro ao buscar artistas no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// ============================================
// 🎵 VIBES (18 VIBES)
// ============================================
const VIBES_CACHE_KEY = 'spotify_vibes'
const VIBES_TTL = 15 * 60 * 1000 // 15 minutos

const MOODS = [
  { q: 'party', name: 'Festa', emoji: '🎉', description: 'Batidas animadas para curtir a noite', tags: ['dança', 'energia', 'balada'], gradient: 'linear-gradient(135deg,#ff512f,#dd2476)' },
  { q: 'workout', name: 'Treino', emoji: '💪', description: 'Músicas para manter o ritmo e a motivação', tags: ['energia', 'foco', 'academia'], gradient: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { q: 'chill', name: 'Chill', emoji: '🌈', description: 'Clima leve para relaxar e curtir', tags: ['leve', 'calmo', 'vibes'], gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { q: 'focus', name: 'Focus', emoji: '🧠', description: 'Som ideal para concentração', tags: ['estudo', 'trabalho', 'foco'], gradient: 'linear-gradient(135deg,#36d1dc,#5b86e5)' },
  { q: 'romance', name: 'Romântica', emoji: '💖', description: 'Clima perfeito para momentos especiais', tags: ['amor', 'calma', 'sentimento'], gradient: 'linear-gradient(135deg,#ff758c,#ff7eb3)' },
  { q: 'sleep', name: 'Relax', emoji: '🌙', description: 'Para desacelerar e descansar', tags: ['sono', 'paz', 'calma'], gradient: 'linear-gradient(135deg,#232526,#414345)' },
  { q: 'happy', name: 'Alegria', emoji: '😄', description: 'Músicas para levantar o astral', tags: ['felicidade', 'positivo', 'dia'], gradient: 'linear-gradient(135deg,#f6d365,#fda085)' },
  { q: 'sad', name: 'Melancolia', emoji: '😢', description: 'Para aqueles momentos de reflexão', tags: ['emoção', 'sentimento', 'introspecção'], gradient: 'linear-gradient(135deg,#434343,#000000)' },
  { q: 'driving', name: 'Dirigindo', emoji: '🚗', description: 'A trilha sonora perfeita para a estrada', tags: ['viagem', 'estrada', 'liberdade'], gradient: 'linear-gradient(135deg,#00c6ff,#0072ff)' },
  { q: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Músicas épicas para suas partidas', tags: ['ação', 'intenso', 'competição'], gradient: 'linear-gradient(135deg,#7b4397,#dc2430)' },
  { q: 'cooking', name: 'Cozinhando', emoji: '🍳', description: 'Ritmo gostoso para a cozinha', tags: ['leve', 'divertido', 'casa'], gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { q: 'morning', name: 'Manhã', emoji: '☕', description: 'Para começar o dia com energia', tags: ['café', 'acordar', 'positivo'], gradient: 'linear-gradient(135deg,#ffecd2,#fcb69f)' },

  { q: 'study', name: 'Estudo', emoji: '📚', description: 'Batidas suaves para aprender melhor', tags: ['estudo', 'calma', 'concentração'], gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { q: 'sunset', name: 'Pôr do Sol', emoji: '🌅', description: 'Som perfeito para um fim de tarde', tags: ['sunset', 'leve', 'good vibes'], gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { q: 'rainy day', name: 'Dia Chuvoso', emoji: '🌧️', description: 'Músicas para dias nublados e introspectivos', tags: ['chuva', 'calma', 'reflexão'], gradient: 'linear-gradient(135deg,#5f72bd,#9b23ea)' },
  { q: 'road trip', name: 'Road Trip', emoji: '🛣️', description: 'Trilha sonora para viagens longas', tags: ['viagem', 'aventura', 'estrada'], gradient: 'linear-gradient(135deg,#43cea2,#185a9d)' },
  { q: 'meditation', name: 'Meditação', emoji: '🧘', description: 'Sons para respirar e desacelerar', tags: ['paz', 'respiração', 'zen'], gradient: 'linear-gradient(135deg,#c3ec52,#0ba29d)' },
  { q: 'summer', name: 'Verão', emoji: '☀️', description: 'Músicas vibrantes para dias ensolarados', tags: ['praia', 'sol', 'energia'], gradient: 'linear-gradient(135deg,#f7971e,#ffd200)' }
]
// ============================================
// 🎵 RESOLVER URL DE ÁUDIO PARA MÚSICA LOCAL
// ============================================
app.get('/musicas/:id/audio', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🎵 Resolvendo áudio para música ID:', id)

    let musica = null
    let artistName = ''
    let trackName = ''

    if (dbConnected) {
      try {
        const Musica = require('./models/Musica')
        musica = await Musica.findById(id).populate('cantores albuns')
        if (musica) {
          artistName = musica.cantores?.map(c => c.nome).join(' ') || ''
          trackName = musica.nome
          console.log('✅ Música encontrada no banco:', trackName, '- Artista:', artistName)
        }
      } catch (dbErr) {
        console.warn('⚠️ Erro ao buscar no banco:', dbErr.message)
      }
    }

    if (!musica) {
      console.log('⚠️ Música não encontrada no banco, tentando buscar por ID:', id)
      trackName = id
    }

    // 1. Tenta Spotify
    try {
      const token = await getSpotifyToken()
      const query = artistName ? `track:"${trackName}" artist:"${artistName}"` : trackName
      const spotifyResponse = await axios.get(`${SPOTIFY_API_URL}/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, type: 'track', limit: 5, market: 'BR' }
      })
      const spotifyTrack = spotifyResponse.data?.tracks?.items?.find(t => t.preview_url)
      if (spotifyTrack?.preview_url) {
        return res.json({
          source: 'spotify',
          url: spotifyTrack.preview_url,
          title: spotifyTrack.name,
          artist: spotifyTrack.artists?.map(a => a.name).join(', '),
          cover: spotifyTrack.album?.images?.[1]?.url,
          duration: Math.floor(spotifyTrack.duration_ms / 1000),
          isPreview: true
        })
      }
    } catch (err) {
      console.log('⚠️ Spotify falhou')
    }

    // 2. Tenta Deezer
    try {
      const query = artistName ? `${artistName} ${trackName}` : trackName
      const deezerResponse = await axios.get(`${DEEZER_API_URL}/search`, {
        params: { q: query, limit: 5 }
      })
      const deezerTrack = deezerResponse.data?.data?.find(t => t.preview)
      if (deezerTrack?.preview) {
        return res.json({
          source: 'deezer',
          url: deezerTrack.preview,
          title: deezerTrack.title,
          artist: deezerTrack.artist?.name,
          cover: deezerTrack.album?.cover_medium,
          duration: deezerTrack.duration,
          isPreview: true
        })
      }
    } catch (err) {
      console.log('⚠️ Deezer falhou')
    }

    // 3. Link direto do banco
    if (musica?.link && musica.link.includes('.mp3')) {
      console.log('✅ Usando link direto do banco')
      return res.json({
        source: 'local',
        url: musica.link,
        title: musica.nome,
        artist: artistName,
        cover: musica.albuns?.[0]?.foto || musica.foto,
        duration: musica.duracao,
        isPreview: false
      })
    }

    console.log('❌ Nenhuma fonte de áudio encontrada')
    res.status(404).json({
      error: 'Nenhuma fonte de áudio disponível',
      message: 'Não foi possível encontrar preview para esta música no Deezer ou Spotify'
    })
  } catch (error) {
    console.error('❌ Erro geral ao resolver áudio:', error.message)
    res.status(500).json({
      error: 'Erro interno ao resolver áudio',
      details: error.message
    })
  }
})

// ============================================
// ROTAS EXISTENTES DO SEU APP
// ============================================
app.use('/usuarios', usuarioRoutes)
app.use('/generos', generoRoutes)
app.use('/musicas', musicaRoutes)
app.use('/albuns', albumRoutes)
app.use('/cantores', cantorRoutes)
app.use('/playlists', playlistRoutes)
app.use('/curtidas', curtidaRoutes)
app.use('/favoritas', favoritaRoutes)
app.use('/vibes', vibeRoutes)
app.use('/follows', followRoutes)
app.use('/historico', historicoRoutes)
app.use('/notificacoes', notificacaoRoutes)
app.use('/privacidade', privacidadeAtividadeRoutes)

// ============================================
// ROTA DE SAÚDE (HEALTH CHECK)
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    spotify: spotifyToken ? 'conectado' : 'desconectado',
    database: dbConnected ? 'conectado' : 'desconectado',
    cache: {
      entries: cache.size,
      keys: Array.from(cache.keys())
    }
  })
})

// ============================================
// ERROR HANDLER GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err)
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: err.message
  })
})

// ============================================
// SERVIDOR
// ============================================
const PORT = 3002
app.listen(PORT, () => {
  console.log('')
  console.log('🚀 ============================================')
  console.log(`🚀 Servidor SoundUp rodando na porta ${PORT}`)
  console.log('🚀 ============================================')
  console.log('')
  console.log('🎵 Rotas Spotify:')
  console.log('   GET /spotify/search?q=...')
  console.log('   GET /spotify/playlist/:id')
  console.log('   GET /spotify/artist/:id')
  console.log('   GET /spotify/album/:id')
  console.log('   GET /spotify/artists/popular  (15 gêneros, 3 artistas cada)')
  console.log('   GET /spotify/vibes            (12 vibes)')
  console.log('')
  console.log('🎵 Rota de Áudio:')
  console.log('   GET /musicas/:id/audio')
  console.log('')
  console.log('💚 Health Check: GET /health')
  console.log('')
})