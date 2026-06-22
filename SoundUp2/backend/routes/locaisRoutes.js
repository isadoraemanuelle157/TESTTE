const express = require('express')
const axios = require('axios')
const router = express.Router()

// Lista completa de localizações do Brasil
const LOCALIZACOES_BRASIL = [
  'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná',
  'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Goiás', 'Distrito Federal',
  'Maranhão', 'Pará', 'Santa Catarina', 'Paraíba', 'Espírito Santo',
  'Alagoas', 'Sergipe', 'Piauí', 'Rio Grande do Norte', 'Mato Grosso',
  'Mato Grosso do Sul', 'Tocantins', 'Acre', 'Amapá', 'Rondônia', 'Roraima'
]

const LOCAL_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
]

function getLocalGradient(loc) {
  const index = loc.length % LOCAL_GRADIENTS.length
  return LOCAL_GRADIENTS[index]
}

// ============================================
// 🎵 TOKEN SPOTIFY (reutilizado do server.js)
// ============================================
let spotifyToken = null
let tokenExpiresAt = 0

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const DEEZER_API_URL = 'https://api.deezer.com'

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
            Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    spotifyToken = response.data.access_token
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000
    return spotifyToken
  } catch (error) {
    console.error('❌ Erro token Spotify:', error.response?.data || error.message)
    throw new Error('Falha autenticação Spotify')
  }
}

async function spotifyRequest(config) {
  const token = await getSpotifyToken()
  return axios({
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`
    }
  })
}

// ============================================
// 📍 ROTAS
// ============================================

// GET /locais — Lista todas as localizações
router.get('/', (req, res) => {
  const locais = LOCALIZACOES_BRASIL.map((loc, index) => ({
    id: `local-${index}`,
    nome: loc,
    descricao: `Música de ${loc}`,
    gradient: getLocalGradient(loc),
    emoji: '📍',
    type: 'local'
  }))

  res.json({ total: locais.length, locais })
})

// GET /locais/search?q=termo — Busca localizações
router.get('/search', (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'Query obrigatória' })

  const query = q.toLowerCase().trim()
  const results = LOCALIZACOES_BRASIL
    .filter(loc => loc.toLowerCase().includes(query))
    .map((loc, index) => ({
      id: `local-${index}`,
      nome: loc,
      descricao: `Música de ${loc}`,
      gradient: getLocalGradient(loc),
      emoji: '📍',
      type: 'local'
    }))

  res.json(results)
})

// ============================================
// 🎵 BUSCA REAL DE MÚSICAS POR LOCAL
// ============================================

// GET /locais/:nome/musicas — Busca músicas, artistas e álbuns do local
router.get('/:nome/musicas', async (req, res) => {
  try {
    const { nome } = req.params
    
    // Mapeamento de estados para termos de busca musicais mais efetivos
    const searchTermsMap = {
      'São Paulo': ['sertanejo paulista', 'funk paulista', 'samba paulista', 'MPB São Paulo'],
      'Rio de Janeiro': ['samba carioca', 'funk carioca', 'bossa nova', 'pagode carioca'],
      'Minas Gerais': ['sertanejo mineiro', 'clube da esquina', 'MPB Minas'],
      'Bahia': ['axé', 'samba reggae', 'MPB Bahia', 'tropicália'],
      'Paraná': ['sertanejo paranaense', 'rock curitiba'],
      'Rio Grande do Sul': ['rock gaúcho', 'música gaúcha', 'sertanejo gaúcho'],
      'Pernambuco': ['forró pé de serra', 'frevo', 'maracatu', 'manguebeat'],
      'Ceará': ['forró cearense', 'rock cearense'],
      'Goiás': ['sertanejo goiano', 'música goiana'],
      'Distrito Federal': ['rock brasília', 'MPB Brasília'],
      'Maranhão': ['reggae maranhense', 'tambor de crioula'],
      'Pará': ['carimbó', 'tecnobrega', 'guitarrada'],
      'Santa Catarina': ['sertanejo catarinense', 'música catarinense'],
      'Paraíba': ['forró paraibano', 'música paraibana'],
      'Espírito Santo': ['sertanejo capixaba', 'música capixaba'],
      'Alagoas': ['forró alagoano', 'música alagoana'],
      'Sergipe': ['forró sergipano', 'música sergipana'],
      'Piauí': ['forró piauiense', 'música piauiense'],
      'Rio Grande do Norte': ['forró potiguar', 'música potiguar'],
      'Mato Grosso': ['sertanejo mato-grossense'],
      'Mato Grosso do Sul': ['sertanejo sul-mato-grossense'],
      'Tocantins': ['sertanejo tocantinense', 'música tocantinense'],
      'Acre': ['música acreana', 'reggae acre'],
      'Amapá': ['música amapaense', 'carimbó amapaense'],
      'Rondônia': ['sertanejo rondoniense', 'música rondoniense'],
      'Roraima': ['música roraimense']
    }

    const searchTerms = searchTermsMap[nome] || [nome]
    const allResults = []

    // Busca com múltiplos termos para cada API
    for (const term of searchTerms.slice(0, 2)) { // Limita a 2 termos para não sobrecarregar
      console.log(`🔍 Buscando com termo: ${term}`)

      const [spotifyRes, deezerRes] = await Promise.allSettled([
        spotifyRequest({
          method: 'GET',
          url: `${SPOTIFY_API_URL}/search`,
          params: {
            q: term,
            type: 'track,artist,album',
            limit: 10,
            market: 'BR'
          }
        }).catch(err => {
          console.warn(`⚠️ Spotify falhou para ${term}:`, err.message)
          return null
        }),

        axios.get(`${DEEZER_API_URL}/search`, {
          params: { q: term, limit: 10 },
          timeout: 5000
        }).catch(err => {
          console.warn(`⚠️ Deezer falhou para ${term}:`, err.message)
          return null
        })
      ])

      // Processa Spotify
      if (spotifyRes.status === 'fulfilled' && spotifyRes.value) {
        const data = spotifyRes.value.data

        if (data.tracks?.items) {
          allResults.push(...data.tracks.items.map(t => ({
            id: t.id,
            title: t.name,
            artist: { name: t.artists.map(a => a.name).join(', ') },
            album: {
              title: t.album.name,
              cover: t.album.images?.[0]?.url,
              cover_medium: t.album.images?.[0]?.url
            },
            cover: t.album.images?.[0]?.url,
            preview: t.preview_url,
            duration: Math.floor(t.duration_ms / 1000),
            type: 'track',
            source: 'spotify',
            localContext: nome
          })))
        }

        if (data.artists?.items) {
          allResults.push(...data.artists.items.map(a => ({
            id: a.id,
            name: a.name,
            picture: a.images?.[0]?.url,
            picture_medium: a.images?.[0]?.url,
            picture_big: a.images?.[0]?.url,
            nb_fan: a.followers?.total || 0,
            type: 'artist',
            source: 'spotify',
            localContext: nome
          })))
        }

        if (data.albums?.items) {
          allResults.push(...data.albums.items.map(a => ({
            id: a.id,
            title: a.name,
            artist: { name: a.artists.map(ar => ar.name).join(', ') },
            cover: a.images?.[0]?.url,
            cover_medium: a.images?.[0]?.url,
            cover_big: a.images?.[0]?.url,
            type: 'album',
            source: 'spotify',
            localContext: nome
          })))
        }
      }

      // Processa Deezer
      if (deezerRes.status === 'fulfilled' && deezerRes.value) {
        const data = deezerRes.value.data

        if (data.data) {
          // Tracks
          allResults.push(...data.data.map(t => ({
            id: `dz-${t.id}`,
            title: t.title,
            artist: { name: t.artist?.name },
            album: {
              title: t.album?.title,
              cover: t.album?.cover_medium,
              cover_medium: t.album?.cover_medium
            },
            cover: t.album?.cover_medium,
            preview: t.preview,
            duration: t.duration,
            type: 'track',
            source: 'deezer',
            localContext: nome
          })))

          // Artistas únicos
          const deezerArtists = data.data
            .map(t => t.artist)
            .filter((a, i, arr) => a && arr.findIndex(x => x.id === a.id) === i)

          allResults.push(...deezerArtists.map(a => ({
            id: `dz-art-${a.id}`,
            name: a.name,
            picture: a.picture_medium,
            picture_medium: a.picture_medium,
            picture_big: a.picture_big,
            nb_fan: a.nb_fan || 0,
            type: 'artist',
            source: 'deezer',
            localContext: nome
          })))

          // Álbuns únicos
          const deezerAlbums = data.data
            .map(t => t.album)
            .filter((a, i, arr) => a && arr.findIndex(x => x.id === a.id) === i)

          allResults.push(...deezerAlbums.map(a => ({
            id: `dz-alb-${a.id}`,
            title: a.title,
            artist: { name: 'Artista' },
            cover: a.cover_medium,
            cover_medium: a.cover_medium,
            cover_big: a.cover_big,
            type: 'album',
            source: 'deezer',
            localContext: nome
          })))
        }
      }
    }

    // Remove duplicatas (por título/nome + tipo)
    const seen = new Set()
    const uniqueResults = allResults.filter(item => {
      const key = `${item.type}-${(item.title || item.name || '').toLowerCase().trim()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Se ainda não encontrou nada, retorna mensagem informativa
    if (uniqueResults.length === 0) {
      return res.json({
        local: nome,
        total: 0,
        results: [],
        message: `Nenhum resultado encontrado para ${nome}. Tente buscar por gêneros musicais associados a esta região.`
      })
    }

    res.json({
      local: nome,
      total: uniqueResults.length,
      results: uniqueResults
    })

  } catch (error) {
    console.error('❌ Erro busca local:', error.message)
    res.status(500).json({ error: 'Erro ao buscar músicas do local' })
  }
})

module.exports = router