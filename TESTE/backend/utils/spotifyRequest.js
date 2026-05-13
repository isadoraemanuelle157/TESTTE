const axios = require('axios')

const {
  SPOTIFY_AUTH_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET
} = require('../config/spotify')

let spotifyToken = null
let tokenExpiresAt = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Obtém token do Spotify com retry e backoff exponencial
 * Trata erros transitórios como temporarily_unavailable
 */
async function getSpotifyToken(retries = 5) {
  // Token ainda válido (com 1 min de margem)
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
          timeout: 10000 // 10s timeout na autenticação
        }
      )

      spotifyToken = response.data.access_token
      tokenExpiresAt = Date.now() + (response.data.expires_in * 1000)
      console.log('🎵 Token Spotify renovado (válido até', new Date(tokenExpiresAt).toLocaleTimeString('pt-BR'), ')')
      return spotifyToken

    } catch (error) {
      const status = error.response?.status
      const errorCode = error.response?.data?.error
      const errorDesc = error.response?.data?.error_description || error.message

      console.error(`❌ Erro token Spotify (tentativa ${i + 1}/${retries}):`, errorCode || status, errorDesc)

      // Erros que merecem retry na autenticação
      const retryableAuthErrors = [
        'temporarily_unavailable',
        'server_error',
        'rate_limit'
      ]
      const retryableStatuses = [429, 500, 502, 503, 504]

      const isRetryable = retryableAuthErrors.includes(errorCode) ||
                         retryableStatuses.includes(status) ||
                         error.code === 'ECONNRESET' ||
                         error.code === 'ETIMEDOUT' ||
                         error.code === 'ECONNREFUSED' ||
                         error.code === 'ENOTFOUND'

      if (isRetryable && i < retries - 1) {
        // Backoff exponencial: 2s, 4s, 8s, 16s... + jitter
        const baseDelay = status === 429
          ? parseInt(error.response.headers['retry-after'] || '2', 10) * 1000
          : Math.min(2000 * Math.pow(2, i), 30000)
        const delay = baseDelay + Math.random() * 1000

        console.warn(`⏳ Retry auth em ${Math.round(delay)}ms (${errorCode || 'erro de rede'})`)
        await sleep(delay)
        continue
      }

      // Erro definitivo — limpa token e lança
      spotifyToken = null
      tokenExpiresAt = 0
      throw new Error(`Falha autenticação Spotify: ${errorCode || error.message}`)
    }
  }

  throw new Error('Spotify auth max retries exceeded')
}

/**
 * Faz request à API do Spotify com retry inteligente
 */
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

      console.log('📤 Request Spotify:', config.method || 'GET', finalUrl)

      const response = await axios({
        method: config.method,
        url: finalUrl,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`
        },
        timeout: config.timeout || 15000 // 15s default timeout
      })

      return response

    } catch (error) {
      const status = error.response?.status
      const errorCode = error.response?.data?.error?.message || error.message

      console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, status, errorCode)

      // Rate limit — respeita Retry-After
      if (status === 429 && i < retries - 1) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10)
        const delay = Math.min(retryAfter * 1000, 60000) // max 60s
        console.warn(`⏳ Rate limit Spotify → esperando ${delay}ms`)
        await sleep(delay)
        continue
      }

      // Erros de rede/transitórios — retry com backoff
      const retryableStatuses = [502, 503, 504]
      const isRetryable = retryableStatuses.includes(status) ||
                         error.code === 'ECONNRESET' ||
                         error.code === 'ETIMEDOUT' ||
                         error.code === 'ECONNREFUSED'

      if (isRetryable && i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000) + Math.random() * 1000
        console.warn(`⏳ Retry em ${Math.round(delay)}ms (erro ${status || error.code})`)
        await sleep(delay)
        continue
      }

      // Token expirado/inválido — força renovação e retry
      if (status === 401 && i < retries - 1) {
        console.log('🔄 Token inválido ou expirado, forçando renovação...')
        spotifyToken = null
        tokenExpiresAt = 0
        continue
      }

      // Erro definitivo — não retry
      throw error
    }
  }

  throw new Error('Spotify max retries exceeded')
}

/**
 * Força renovação do token (útil para health checks)
 */
async function refreshSpotifyToken() {
  spotifyToken = null
  tokenExpiresAt = 0
  return await getSpotifyToken()
}

/**
 * Verifica se o token está válido sem renovar
 */
function isTokenValid() {
  return spotifyToken && Date.now() < tokenExpiresAt - 60000
}

module.exports = {
  spotifyRequest,
  refreshSpotifyToken,
  isTokenValid
}