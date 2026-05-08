const axios = require('axios')

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

let spotifyToken = null
let tokenExpiresAt = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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
          Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    spotifyToken = response.data.access_token
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000
    console.log('🎵 Token Spotify renovado')
    return spotifyToken
  } catch (error) {
    console.error('❌ Erro token Spotify:', error.response?.data || error.message)
    throw new Error('Falha autenticação Spotify')
  }
}

async function spotifyRequest(config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await getSpotifyToken()
      
      // Constrói URL com query params manualmente
      let finalUrl = config.url
      if (config.params && Object.keys(config.params).length > 0) {
        const queryParts = []
        for (const [key, value] of Object.entries(config.params)) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        }
        const separator = finalUrl.includes('?') ? '&' : '?'
        finalUrl = `${finalUrl}${separator}${queryParts.join('&')}`
      }

      console.log('📤 Request Spotify:', finalUrl)

      const response = await axios({
        method: config.method,
        url: finalUrl,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`
        }
      })

      return response
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10)
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

module.exports = { spotifyRequest }