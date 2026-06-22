const axios = require('axios')
const { SPOTIFY_AUTH_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/spotify')

let spotifyToken = null
let tokenExpiresAt = 0
let lastRequestTime = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ✅ CACHE: Evita requests repetidos por 10 minutos
const cache = new Map()
const CACHE_TTL = 30 * 60 * 1000

function getCacheKey(config) {
  const params = config.params ? new URLSearchParams(config.params).toString() : ''
  return `${config.method || 'GET'}|${config.url}|${params}`
}

function getCached(config) {
  const key = getCacheKey(config)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.time < CACHE_TTL) {
    console.log('💾 Cache hit:', config.url)
    return entry.data
  }
  return null
}

function setCached(config, data) {
  const key = getCacheKey(config)
  cache.set(key, { data, time: Date.now() })
}

// ✅ FILA: Garante requests sequenciais, nunca paralelos
let requestQueue = Promise.resolve()

// ✅ NOVO — com verificação de ban ativo
let hardBanUntil = 0

async function respectRateLimit() {
  // 🔴 NOVO: Verifica se há ban ativo
  if (Date.now() < hardBanUntil) {
    const remainingMin = Math.ceil((hardBanUntil - Date.now()) / 60000)
    throw Object.assign(new Error(`Spotify banido por ${remainingMin} minutos`), {
      isRateLimit: true,
      isHardBan: true,
      banRemainingMinutes: remainingMin
    })
  }

  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
const minDelay = 4000

  if (timeSinceLastRequest < minDelay) {
    const wait = minDelay - timeSinceLastRequest
    console.log(`⏳ Rate limit: aguardando ${wait}ms...`)
    await sleep(wait)
  }
  lastRequestTime = Date.now()
}

async function getSpotifyToken(retries = 3) {
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
      const errorCode = error.response?.data?.error
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

// ✅ FUNÇÃO INTERNA (não exportada diretamente)
async function _spotifyRequest(config, retries = 3, userToken = null) {
  // Verifica cache primeiro
  const cached = getCached(config)
  if (cached) {
    return { data: cached, fromCache: true, status: 200, headers: {} }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await respectRateLimit()

      const token = userToken || await getSpotifyToken()

      let finalUrl = config.url
      if (config.params && Object.keys(config.params).length > 0) {
        const query = new URLSearchParams(config.params).toString()
        finalUrl += `?${query}`
      }

      console.log(`📤 Spotify Request (${attempt + 1}/${retries + 1})${userToken ? ' [USER TOKEN]' : ' [APP TOKEN]'} → ${finalUrl}`)

      const response = await axios({
        method: config.method || 'GET',
        url: finalUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(config.headers || {})
        },
        timeout: config.timeout || 15000
      })

      // Salva no cache
      setCached(config, response.data)
      return response

    } catch (error) {
      const status = error.response?.status

      if (status === 403 && userToken) {
        error.isUserTokenExpired = true
        throw error
      }

      console.error(`❌ Tentativa ${attempt + 1}/${retries + 1} falhou: ${status} - ${error.message}`)

      // RATE LIMIT 429
// ✅ RATE LIMIT 429 — CORRIGIDO
if (status === 429) {
  const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '3', 10)
  
// Linha ~67-75 — JÁ EXISTE, mas confirme que está assim:
if (retryAfter > 1800) {
  console.error(`🚫 Spotify BANIDO por ${Math.round(retryAfter / 3600)}h. Abortando.`)
  hardBanUntil = Date.now() + (retryAfter * 1000)
  error.isRateLimit = true
  error.isHardBan = true
  error.banDurationHours = Math.round(retryAfter / 3600)
  throw error
}

  const delay = Math.min(retryAfter, 60) * 1000 // máximo 60s

  console.warn(`🚫 Spotify Rate Limit → aguardando ${delay}ms (retry-after: ${retryAfter}s)`)

  if (attempt >= retries) {
    error.isRateLimit = true
    throw error
  }

  await sleep(delay)
  continue
}

      // TOKEN EXPIRADO 401
      if (status === 401) {
        spotifyToken = null
        tokenExpiresAt = 0

        if (attempt >= retries) {
          throw error
        }
        continue
      }

      // ERROS RETRYABLE
      const retryableStatuses = [500, 502, 503, 504]
      const retryable = retryableStatuses.includes(status) || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT'

      if (retryable) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // ✅ Backoff exponencial: 1s, 2s, 4s, 8s...

        console.warn(`⏳ Retry em ${delay}ms`)

        if (attempt >= retries) {
          throw error
        }

        await sleep(delay)
        continue
      }

      throw error
    }
  }

  throw new Error('Spotify max retries exceeded')
}

// ✅ FUNÇÃO PÚBLICA COM FILA
async function spotifyRequest(config, retries = 3, userToken = null) {
  return new Promise((resolve, reject) => {
    requestQueue = requestQueue.then(async () => {
      try {
        const result = await _spotifyRequest(config, retries, userToken)
        resolve(result)
        return result
      } catch (error) {
        reject(error)
        throw error
      }
    }).catch(() => {
      return Promise.resolve()
    })
  })
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
  if (req.spotifyUserToken) return req.spotifyUserToken
 
  const userId = req.user?.id || req.user?._id
  if (!userId) return null
 
  const Usuario = require('../models/Usuario')
  const user = await Usuario.findById(userId)
  if (!user || !user.spotifyAccessToken) return null
 
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

module.exports = {
  spotifyRequest,
  refreshSpotifyToken,
  isTokenValid,
  getUserSpotifyToken
}