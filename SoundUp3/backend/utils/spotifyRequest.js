const axios = require('axios')
const { SPOTIFY_AUTH_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/spotify')
const { getCache, setCache } = require('./cache')

let spotifyToken = null
let tokenExpiresAt = 0
let lastRequestTime = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ✅ CACHE: Evita requests repetidos por 30 minutos
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

// ✅ BAN ATIVO
let hardBanUntil = 0

async function respectRateLimit() {
  if (hardBanUntil > 0 && Date.now() >= hardBanUntil) {
    console.log('✅ Ban do Spotify expirado, liberando...')
    hardBanUntil = 0
  }

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
  const minDelay = 6000

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

async function _spotifyRequest(config, retries = 3, userToken = null) {
  // Cache SÓ para requisições GET sem userToken (dados públicos)
  const isCacheable = (!config.method || config.method === 'GET') && !userToken
  
  if (isCacheable) {
    const cached = getCache(getCacheKey(config))
    if (cached) {
      console.log('💾 Cache hit:', config.url)
      return { data: cached, fromCache: true, status: 200, headers: {} }
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await respectRateLimit()

      const token = userToken || await getSpotifyToken()

      // ✅ CORREÇÃO: Usa axios params em vez de montar URL manualmente
      const tokenType = userToken ? ' [USER TOKEN]' : ' [APP TOKEN]'
      console.log(`📤 Spotify Request (${attempt + 1}/${retries + 1})${tokenType} → ${config.url}`)

      const response = await axios({
        method: config.method || 'GET',
        url: config.url,
        params: config.params || {},
        headers: {
          Authorization: `Bearer ${token}`,
          ...(config.headers || {})
        },
        timeout: config.timeout || 15000
      })

      // Salva no cache
      setCached(config, response.data)
    if (isCacheable && response.data) {
        setCache(getCacheKey(config), response.data, CACHE_TTL)
      }
      
      return response
      
    } catch (error) {
      const status = error.response?.status

      // ❌ ERRO 400 — Pode ser token expirado ou query inválida
      if (status === 400 && userToken) {
        // Verifica se é erro de token (mensagem típica do Spotify)
        const errorMsg = error.response?.data?.error?.message || ''
        const isTokenError = errorMsg.toLowerCase().includes('token') || 
                            errorMsg.toLowerCase().includes('expired') ||
                            errorMsg.toLowerCase().includes('invalid')
        
        if (isTokenError) {
          console.error('❌ Erro 400 com userToken — token expirado. Marcando para refresh.')
          error.isUserTokenExpired = true
          throw error
        }
        
        // Se não for erro de token, é query inválida
        console.error('❌ Erro 400 com userToken — query inválida:', errorMsg)
        throw error
      }
      
      // ❌ ERRO 401 — Token expirado
      if (status === 401 && userToken) {
        console.error('❌ Erro 401 com userToken — token expirado. Marcando para refresh.')
        error.isUserTokenExpired = true
        throw error
      }
      // ❌ ERRO 403 — Usuário sem Premium ou sem permissão
      if (status === 403 && userToken) {
        console.error('❌ Erro 403 com userToken — sem permissão (precisa Spotify Premium).')
        error.isUserTokenForbidden = true
        error.message = 'Spotify Premium necessário para este recurso'
        throw error
      }

      // ✅ RATE LIMIT 429
      if (status === 429) {
        const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '3', 10)

        if (retryAfter > 1800) {
          console.error(`🚫 Spotify BANIDO por ${Math.round(retryAfter / 3600)}h. Abortando.`)
          hardBanUntil = Date.now() + (retryAfter * 1000)
          error.isRateLimit = true
          error.isHardBan = true
          error.banDurationHours = Math.round(retryAfter / 3600)
          throw error
        }

        const delay = Math.min(retryAfter, 60) * 1000
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

      // ERROS RETRYABLE (500, 502, 503, 504, ECONNRESET, ETIMEDOUT)
      const retryableStatuses = [500, 502, 503, 504]
      const retryable = retryableStatuses.includes(status) || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT'

      if (retryable) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.warn(`⏳ Retry em ${delay}ms`)

        if (attempt >= retries) {
          throw error
        }

        await sleep(delay)
        continue
      }

      // Log de erro genérico
      console.error(`❌ Tentativa ${attempt + 1}/${retries + 1} falhou: ${status} - ${error.message}`)
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
  if (!req || !req.user) return null
  if (req.spotifyUserToken) return req.spotifyUserToken

  const userId = req.user?.id || req.user?._id
  if (!userId) return null

  const Usuario = require('../models/Usuario')
  const user = await Usuario.findById(userId)
  if (!user || !user.spotifyAccessToken) return null

  // ✅ VERIFICA SE TOKEN EXPIRA EM BREVE (margem de 5 min)
  const expiresSoon = user.spotifyTokenExpiresAt && 
    (new Date(user.spotifyTokenExpiresAt).getTime() - Date.now() < 5 * 60 * 1000)

  if (expiresSoon || (user.spotifyTokenExpiresAt && new Date() > user.spotifyTokenExpiresAt)) {
    if (user.spotifyRefreshToken) {
      try {
        await refreshUserSpotifyToken(user)
        return user.spotifyAccessToken  // ✅ RETORNA O NOVO TOKEN
      } catch (e) {
        console.error('❌ Falha ao renovar token no getUserSpotifyToken:', e.message)
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
      },
      timeout: 10000
    }
  )

  const newRefreshToken = response.data.refresh_token || user.spotifyRefreshToken
  
  await user.updateSpotifyTokens(
    response.data.access_token,
    newRefreshToken,
    response.data.expires_in
  )
  
  console.log('🔄 Token Spotify renovado para usuário:', user.email || user._id)
  return response.data.access_token
}
module.exports = {
  spotifyRequest,
  refreshSpotifyToken,
  isTokenValid,
  getUserSpotifyToken,
  refreshUserSpotifyToken  // ← EXPORTADO para uso no controller
} 