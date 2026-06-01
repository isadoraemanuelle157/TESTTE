const axios = require('axios')
const { SPOTIFY_AUTH_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/spotify')

let spotifyToken = null
let tokenExpiresAt = 0
let lastRequestTime = 0  // ✅ NOVO: controla tempo entre requests

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * ✅ NOVO: Delay entre requests para evitar rate limit
 * Mínimo 500ms entre cada request ao Spotify
 */
async function respectRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
 const minDelay = 200 
  
  if (timeSinceLastRequest < minDelay) {
    const wait = minDelay - timeSinceLastRequest
    await sleep(wait)
  }
  lastRequestTime = Date.now()
}

async function getSpotifyToken(retries = 5) {
  if (spotifyToken && Date.now() < tokenExpiresAt - 60000) {
    return spotifyToken
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        SPOTIFY_AUTH_URL,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      )

      spotifyToken = response.data.access_token
      tokenExpiresAt = Date.now() + (response.data.expires_in * 1000)
      console.log('🎵 Token Spotify renovado')
      return spotifyToken

    } catch (error) {
      const status = error.response?.status
      const errorCode = error.response?.data?.error
      
      // ✅ CORREÇÃO: retry-after em segundos, limitado a 30s
      const retryAfterSeconds = parseInt(error.response?.headers?.['retry-after'] || '5', 10)
      const delayMs = Math.min(retryAfterSeconds, 30) * 1000 + Math.random() * 1000

      console.warn(`⏳ Retry auth em ${Math.round(delayMs)}ms`)
      await sleep(delayMs)
      
      if (i === retries - 1) {
        spotifyToken = null
        tokenExpiresAt = 0
        throw new Error(`Falha autenticação Spotify: ${errorCode || error.message}`)
      }
    }
  }
}

/**
 * ✅ CORREÇÃO CRÍTICA: 
 * 1. Delay de 500ms entre requests consecutivos
 * 2. retry-after limitado a 10 segundos (nunca 100 min!)
 */
async function spotifyRequest(config, retries = 3, userToken = null) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await respectRateLimit()

      // ✅ CORREÇÃO: Se tiver userToken, usa ele (streaming completo)
      // Senão, usa o app token (client credentials - só previews/dados públicos)
      const token = userToken || await getSpotifyToken()

      let finalUrl = config.url

      if (config.params && Object.keys(config.params).length > 0) {
        const query = new URLSearchParams(config.params).toString()
        finalUrl += `?${query}`
      }

      console.log(`📤 Spotify Request (${attempt + 1}/${retries + 1})${userToken ? ' [USER TOKEN - FULL STREAMING]' : ' [APP TOKEN - PREVIEW/PUBLIC]'}`)
      console.log(finalUrl)

      const response = await axios({
        method: config.method || 'GET',
        url: finalUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(config.headers || {})
        },
        timeout: config.timeout || 15000
      })

      return response

    } catch (error) {

           if (error.response?.status === 403 && userToken) {
        error.isUserTokenExpired = true
        throw error
      }

      const status = error.response?.status

      // Se for 403 com userToken, pode ser que o token do usuário expirou
      if (status === 403 && userToken) {
        error.isUserTokenExpired = true
        throw error
      }

      console.error(
        `❌ Tentativa ${attempt + 1}/${retries + 1} falhou:`,
        status,
        error.message
      )

      // =========================
      // RATE LIMIT 429
      // =========================
      if (status === 429) {
        const retryAfter = parseInt(
          error.response?.headers?.['retry-after'] || '3',
          10
        )

 const delay = Math.min(retryAfter, 60) * 1000

  console.warn(`🚫 Spotify Rate Limit → aguardando ${delay}ms`)

  // ✅ AJUSTE 2: Aumentar retries de 3 para 5
  if (attempt >= retries) {  // antes era >= retries (3)
    error.isRateLimit = true
    throw error
  }

        await sleep(delay)
        continue
      }

      // =========================
      // TOKEN EXPIRADO
      // =========================
      if (status === 401) {
        spotifyToken = null
        tokenExpiresAt = 0

        if (attempt >= retries) {
          throw error
        }

        continue
      }

      // =========================
      // ERROS RETRYABLE
      // =========================
      const retryableStatuses = [500, 502, 503, 504]

      const retryable =
        retryableStatuses.includes(status) ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT'

      if (retryable) {
        const delay = Math.min(1000 * (attempt + 1), 5000)

        console.warn(`⏳ Retry em ${delay}ms`)

        if (attempt >= retries) {
          throw error
        }

        await sleep(delay)
        continue
      }

      // erro comum
      throw error
    }

  }

  throw new Error('Spotify max retries exceeded')
}

async function refreshSpotifyToken() {
  spotifyToken = null
  tokenExpiresAt = 0
  return await getSpotifyToken()
}

function isTokenValid() {
  return spotifyToken && Date.now() < tokenExpiresAt - 60000
}


async function getUserSpotifyToken(req) {
  // Se o middleware já colocou o token no req, usa ele
  if (req.spotifyUserToken) return req.spotifyUserToken
  
  const userId = req.user?.id || req.user?._id
  if (!userId) return null
  
  const user = await Usuario.findById(userId)
  if (!user || !user.spotifyAccessToken) return null
  
  // Verifica se não expirou
  if (user.spotifyTokenExpiresAt && new Date() > user.spotifyTokenExpiresAt) {
    if (user.spotifyRefreshToken) {
      try {
        await refreshUserSpotifyToken(user)
        return user.spotifyAccessToken
      } catch (e) {
        return null
      }
    }
    return null
  }
  
  return user.spotifyAccessToken
}

async function refreshUserSpotifyToken(user) {
  const axios = require('axios')
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/spotify')
  
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.spotifyRefreshToken
    }).toString(),
    {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
  
  await user.updateSpotifyTokens(
    response.data.access_token,
    user.spotifyRefreshToken,
    response.data.expires_in
  )
}

// Exporte também:
module.exports = {
  spotifyRequest,
  refreshSpotifyToken,
  isTokenValid,
  getUserSpotifyToken // ✅ ADICIONAR
}
