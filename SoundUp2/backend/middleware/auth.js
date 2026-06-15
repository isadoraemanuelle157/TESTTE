const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || "SEGREDO_SUPER_SECRETO"

// ============================================
// 🔓 OPTIONAL AUTH
// ============================================
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization

  req.isLogged = false
  req.user = null
  req.isAuthenticated = false

  if (!authHeader) return next()

const token = authHeader?.startsWith('Bearer ')
  ? authHeader.split(' ')[1]
  : null
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
req.user = {
  ...decoded,
  id: decoded.id || decoded._id,
  role: decoded.role || 'user'  // ← ADICIONAR ISSO
}
    req.isLogged = true
    req.isAuthenticated = true
    next()
  } catch (err) {
    req.tokenExpired = err.name === 'TokenExpiredError'
    next()
  }
}

// ============================================
// 🔒 REQUIRE AUTH
// ============================================
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      error: 'LOGIN_REQUIRED',
      message: 'Faça login para continuar'
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      error: 'TOKEN_REQUIRED'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      role: decoded.role || 'user'
    }

    req.isLogged = true
    req.isAuthenticated = true
    next()
  } catch (err) {
    return res.status(401).json({
      error: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    })
  }
}

async function requireSpotifyAuth(req, res, next) {
  // Primeiro verifica autenticação normal
  requireAuth(req, res, async () => {
    const userId = req.user?.id || req.user?._id
    
    if (!userId) {
      return res.status(401).json({
        error: 'LOGIN_REQUIRED',
        message: 'Faça login para continuar'
      })
    }
    
    try {
      const Usuario = require('../models/Usuario')
      const user = await Usuario.findById(userId)
      
      if (!user || !user.spotifyConnected) {
        return res.status(403).json({
          error: 'SPOTIFY_NOT_CONNECTED',
          message: 'Conecte sua conta do Spotify para ouvir músicas completas',
          connectUrl: '/spotify/auth'
        })
      }
      
      // Verifica se token expirou
      if (!user.isSpotifyTokenValid()) {
        // Tenta refresh
        if (user.spotifyRefreshToken) {
          try {
            const axios = require('axios')
            const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_AUTH_URL } = require('../config/spotify')
            
            const response = await axios.post(
              SPOTIFY_AUTH_URL,
              new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: user.spotifyRefreshToken
              }).toString(),
              {
                headers: {
                  'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }
            )
            
            await user.updateSpotifyTokens(
              response.data.access_token,
              user.spotifyRefreshToken, // Spotify nem sempre retorna novo refresh token
              response.data.expires_in
            )
          } catch (refreshErr) {
            return res.status(403).json({
              error: 'SPOTIFY_TOKEN_EXPIRED',
              message: 'Token do Spotify expirado. Conecte novamente.',
              connectUrl: '/spotify/auth'
            })
          }
        } else {
          return res.status(403).json({
            error: 'SPOTIFY_TOKEN_EXPIRED',
            message: 'Token do Spotify expirado. Conecte novamente.',
            connectUrl: '/spotify/auth'
          })
        }
      }
      
      // Adiciona tokens do Spotify ao req
      req.spotifyToken = user.spotifyAccessToken
      req.spotifyRefreshToken = user.spotifyRefreshToken
      req.userDoc = user
      
      next()
    } catch (err) {
      console.error('Erro ao verificar Spotify auth:', err)
      return res.status(500).json({ error: 'Erro interno' })
    }
  })
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireSpotifyAuth  // ✅ NOVO
}