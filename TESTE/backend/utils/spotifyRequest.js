const axios = require('axios')

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_AUTH_URL
} = require('../config/spotify')

let spotifyToken = null
let tokenExpiresAt = 0

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiresAt - 60000) {
    return spotifyToken
  }

  const response = await axios.post(
    SPOTIFY_AUTH_URL,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  spotifyToken = response.data.access_token
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000

  console.log('🎵 Spotify token renovado')

  return spotifyToken
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function spotifyRequest(config, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await getSpotifyToken()

      const response = await axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      })

      return response
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(
          error.response.headers['retry-after'] || '3',
          10
        )

        const delay = Math.min(retryAfter * 1000, 5000)

        console.warn(
          `⏳ Spotify Rate Limit. Esperando ${delay}ms...`
        )

        await sleep(delay)

        continue
      }

      if (error.response?.status === 401) {
        spotifyToken = null
      }

      throw error
    }
  }

  throw new Error('Spotify max retries exceeded')
}

module.exports = {
  spotifyRequest
}