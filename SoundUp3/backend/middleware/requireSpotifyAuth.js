const Usuario = require('../models/Usuario')
const axios = require('axios')
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/spotify')

/**
 * Middleware que verifica se o usuário tem Spotify conectado
 * e se o token é válido. Se expirado, tenta refresh automaticamente.
 * Adiciona req.spotifyUserToken para as rotas usarem.
 */
module.exports = async function requireSpotifyAuth(req, res, next) {
  // req.isAuthenticated já foi setado pelo requireAuth anterior
  if (!req.isAuthenticated) {
    return res.status(401).json({
      error: 'LOGIN_REQUIRED',
      message: 'Faça login para continuar'
    })
  }

  const userId = req.user?.id || req.user?._id
  if (!userId) {
    return res.status(401).json({ error: 'ID do usuário não encontrado' })
  }

  try {
    const user = await Usuario.findById(userId)
    
    if (!user || !user.spotifyConnected) {
      return res.status(403).json({
        error: 'SPOTIFY_NOT_CONNECTED',
        message: 'Conecte sua conta do Spotify para ouvir músicas completas',
        connectUrl: '/spotify/auth'
      })
    }

    // ✅ VERIFICAÇÃO DE TOKEN COM MARGEM DE SEGURANÇA (só declara UMA VEZ)
    const TOKEN_MARGIN_MS = 5 * 60 * 1000 // 5 minutos

    // Token expirou (ou vai expirar em breve)? Tenta refresh
    if (!user.isSpotifyTokenValid()) {
      if (user.spotifyRefreshToken) {
        try {
          const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: user.spotifyRefreshToken
            }).toString(),
            {
              headers: {
                Authorization: 'Basic ' + Buffer.from(
                  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          )
          
          await user.updateSpotifyTokens(
            response.data.access_token,
            response.data.refresh_token || user.spotifyRefreshToken,
            response.data.expires_in
          )
          
        } catch (refreshErr) {
          return res.status(403).json({
            error: 'SPOTIFY_TOKEN_EXPIRED',
            message: 'Token do Spotify expirado. Conecte novamente.'
          })
        }
      } else {
        return res.status(403).json({
          error: 'SPOTIFY_TOKEN_EXPIRED',
          message: 'Token do Spotify expirado. Conecte novamente.'
        })
      }
    }

    // ✅ SETA O TOKEN NO REQ
    req.spotifyUserToken = user.spotifyAccessToken
    req.userDoc = user
    
    next()

  } catch (err) {
    console.error('[SPOTIFY] Erro no middleware:', err)
    return res.status(500).json({ error: 'Erro interno ao verificar Spotify' })
  }
}

// ✅ FUNÇÃO UTILITÁRIA FORA DO MIDDLEWARE
function invalidateSpotifyCache(pattern) {
  const { cache } = require('../utils/cache')
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      console.log('🗑️ Cache invalidado:', key)
    }
  }
}