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
// 🎵 DEEZER CONFIGURAÇÃO
// ============================================
const DEEZER_API_URL = 'https://api.deezer.com'

/**
 * Busca música no Deezer e retorna preview URL
 */
async function searchDeezerTrack(query, artist = '') {
  try {
    const searchQuery = artist ? `${query} artist:"${artist}"` : query
    console.log('🔍 Buscando no Deezer:', searchQuery)
    
    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: searchQuery, limit: 5 },
      timeout: 10000
    })
    
    if (response.data?.data?.length > 0) {
      const track = response.data.data.find(t => t.preview) || response.data.data[0]
      console.log('✅ Deezer encontrado:', track.title, '- Preview:', track.preview ? 'SIM' : 'NÃO')
      return {
        id: track.id,
        title: track.title,
        artist: track.artist?.name,
        preview: track.preview,
        cover: track.album?.cover_medium || track.album?.cover,
        duration: track.duration,
        link: track.link
      }
    }
    console.log('⚠️ Deezer: nenhum resultado')
    return null
  } catch (error) {
    console.error('❌ Erro ao buscar no Deezer:', error.message)
    return null
  }
}

/**
 * Busca preview direto por ID do Deezer
 */
async function getDeezerPreview(trackId) {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/track/${trackId}`, {
      timeout: 10000
    })
    
    if (response.data?.preview) {
      return {
        id: response.data.id,
        title: response.data.title,
        artist: response.data.artist?.name,
        preview: response.data.preview,
        cover: response.data.album?.cover_medium,
        duration: response.data.duration
      }
    }
    return null
  } catch (error) {
    console.error('❌ Erro ao buscar preview Deezer:', error.message)
    return null
  }
}

// ============================================
// IMPORTA ROTAS EXISTENTES (com try-catch)
// ============================================
function safeRequire(path) {
  try {
    return require(path)
  } catch (err) {
    console.warn(`⚠️ Rota não encontrada: ${path}`, err.message)
    return express.Router() // Retorna router vazio
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
app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
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

    const token = await getSpotifyToken()

    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: q.trim(), type, limit, offset, market }
    })

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

// SPOTIFY PLAYLIST
app.get('/spotify/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params
    const limit = validatePlaylistLimit(req.query.limit)
    const offset = parseInt(req.query.offset, 10) || 0
    const market = req.query.market || 'BR'

    const token = await getSpotifyToken()

    const response = await axios.get(`${SPOTIFY_API_URL}/playlists/${id}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
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
    const token = await getSpotifyToken()
    const response = await axios.get(`${SPOTIFY_API_URL}/artists/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
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
    const token = await getSpotifyToken()
    const response = await axios.get(`${SPOTIFY_API_URL}/albums/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
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

// SPOTIFY POPULAR ARTISTS
app.get('/spotify/artists/popular', async (req, res) => {
  try {
    const limit = validateSearchLimit(req.query.limit)
    const offset = parseInt(req.query.offset, 10) || 0
    const market = req.query.market || 'BR'
    const token = await getSpotifyToken()

    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: 'genre:"brazilian"',
        type: 'artist',
        limit,
        offset,
        market
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error('❌ Erro ao buscar artistas populares Spotify:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Erro ao buscar artistas no Spotify',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// ============================================
// 🎵 ROTAS DO DEEZER (PROXY)
// ============================================

/**
 * GET /deezer/search?q=nome+da+música&artist=nome+do+artista
 */
app.get('/deezer/search', async (req, res) => {
  try {
    const { q, artist } = req.query
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' })
    }
    
    const result = await searchDeezerTrack(q.trim(), artist)
    
    if (!result) {
      return res.status(404).json({ error: 'Música não encontrada no Deezer' })
    }
    
    res.json(result)
  } catch (error) {
    console.error('❌ Erro na busca Deezer:', error.message)
    res.status(500).json({ error: 'Erro ao buscar no Deezer', details: error.message })
  }
})

/**
 * GET /deezer/track/:id
 */
app.get('/deezer/track/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await getDeezerPreview(id)
    
    if (!result) {
      return res.status(404).json({ error: 'Música não encontrada no Deezer' })
    }
    
    res.json(result)
  } catch (error) {
    console.error('❌ Erro ao buscar track Deezer:', error.message)
    res.status(500).json({ error: 'Erro ao buscar no Deezer', details: error.message })
  }
})

/**
 * GET /deezer/preview-proxy?url=URL_DO_PREVIEW
 * Proxy para streaming do preview (resolve CORS)
 */
app.get('/deezer/preview-proxy', async (req, res) => {
  try {
    const { url } = req.query
    
    if (!url) {
      return res.status(400).json({ error: 'URL do preview é obrigatória' })
    }
    
    if (!url.includes('deezer.com') && !url.includes('cdn-preview-')) {
      return res.status(400).json({ error: 'URL inválida' })
    }
    
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    res.set('Content-Type', 'audio/mpeg')
    res.set('Content-Length', response.headers['content-length'])
    res.set('Accept-Ranges', 'bytes')
    res.set('Cache-Control', 'public, max-age=3600')
    
    response.data.pipe(res)
  } catch (error) {
    console.error('❌ Erro no proxy Deezer:', error.message)
    res.status(500).json({ error: 'Erro ao proxyar áudio', details: error.message })
  }
})

// ============================================
// 🎵 RESOLVER URL DE ÁUDIO PARA MÚSICA LOCAL
// ============================================

/**
 * GET /musicas/:id/audio
 * Resolve a melhor URL de áudio para uma música do banco local
 */
app.get('/musicas/:id/audio', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🎵 Resolvendo áudio para música ID:', id)
    
    // Tenta buscar no banco
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
    
    // Se não achou no banco, tenta usar o ID como nome para buscar
    if (!musica) {
      console.log('⚠️ Música não encontrada no banco, tentando buscar por ID:', id)
      trackName = id  // Usa o ID como query de busca
    }
    
    // 1. Tenta buscar no Deezer primeiro
    console.log('🔍 Buscando no Deezer:', trackName, artistName)
    const deezerResult = await searchDeezerTrack(trackName, artistName)
    
    if (deezerResult?.preview) {
      console.log('✅ Preview encontrado no Deezer!')
      return res.json({
        source: 'deezer',
        url: deezerResult.preview,
        proxyUrl: `${API_BASE_URL}/deezer/preview-proxy?url=${encodeURIComponent(deezerResult.preview)}`,
        title: deezerResult.title,
        artist: deezerResult.artist,
        cover: deezerResult.cover,
        duration: deezerResult.duration,
        isPreview: true
      })
    }
    
    // 2. Tenta buscar no Spotify
    console.log('🔍 Buscando no Spotify...')
    try {
      const token = await getSpotifyToken()
      const query = artistName 
        ? `track:"${trackName}" artist:"${artistName}"`
        : trackName
        
      const spotifyResponse = await axios.get(`${SPOTIFY_API_URL}/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: query,
          type: 'track',
          limit: 5,
          market: 'BR'
        }
      })
      
      const spotifyTrack = spotifyResponse.data?.tracks?.items?.find(t => t.preview_url) 
                          || spotifyResponse.data?.tracks?.items?.[0]
                          
      if (spotifyTrack?.preview_url) {
        console.log('✅ Preview encontrado no Spotify!')
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
    } catch (spotifyErr) {
      console.log('⚠️ Spotify fallback falhou:', spotifyErr.message)
    }
    
    // 3. Se tem música do banco com link direto MP3
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
    
    // 4. Nenhuma fonte encontrada
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
    database: dbConnected ? 'conectado' : 'desconectado'
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
  console.log('   GET /spotify/artists/popular')
  console.log('')
  console.log('🎵 Rotas Deezer:')
  console.log('   GET /deezer/search?q=...')
  console.log('   GET /deezer/track/:id')
  console.log('   GET /deezer/preview-proxy?url=...')
  console.log('')
  console.log('🎵 Rota de Áudio:')
  console.log('   GET /musicas/:id/audio')
  console.log('')
  console.log('💚 Health Check: GET /health')
  console.log('')
})