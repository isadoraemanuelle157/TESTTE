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
      role: decoded.role || 'user'
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

// ============================================
// 🎵 REQUIRE SPOTIFY AUTH (REESCRITO)
// ============================================
async function requireSpotifyAuth(req, res, next) {
  // 🔥 PASSO 1: Verifica autenticação normal PRIMEIRO
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({
      error: 'LOGIN_REQUIRED',
      message: 'Faça login para continuar'
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'TOKEN_REQUIRED' })
  }

  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return res.status(401).json({
      error: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    })
  }

  // Seta req.user manualmente (igual requireAuth)
  req.user = {
    ...decoded,
    id: decoded.id || decoded._id,
    role: decoded.role || 'user'
  }
  req.isLogged = true
  req.isAuthenticated = true

  // 🔥 PASSO 2: Verifica Spotify
  const userId = req.user.id
  
  if (!userId) {
    return res.status(401).json({
      error: 'LOGIN_REQUIRED',
      message: 'Faça login para continuar'
    })
  }

  try {
    const Usuario = require('../models/Usuario')
    
    // 🔥 Busca usuário COM os campos Spotify (podem estar com select: false)
    const user = await Usuario.findById(userId).select(
      '+spotifyAccessToken +spotifyRefreshToken +spotifyTokenExpiresAt +spotifyConnected'
    )

    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado'
      })
    }

    if (!user.spotifyConnected) {
      return res.status(403).json({
        error: 'SPOTIFY_NOT_CONNECTED',
        message: 'Conecte sua conta do Spotify para ouvir músicas completas',
        connectUrl: '/spotify/auth'
      })
    }

    // 🔥 PASSO 3: Verifica se token Spotify expirou e renova se necessário
    const now = new Date()
    const tokenExpired = !user.spotifyTokenExpiresAt || user.spotifyTokenExpiresAt <= now

    if (tokenExpired) {
      if (!user.spotifyRefreshToken) {
        // Limpa estado Spotify do usuário
        user.spotifyConnected = false
        user.spotifyAccessToken = undefined
        user.spotifyRefreshToken = undefined
        await user.save()
        
        return res.status(403).json({
          error: 'SPOTIFY_TOKEN_EXPIRED',
          message: 'Token do Spotify expirou. Conecte novamente.',
          connectUrl: '/spotify/auth',
          requiresReauth: true
        })
      }

      // 🔥 Tenta refresh do token
      try {
        const axios = require('axios')
        const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_AUTH_URL } = require('../config/spotify')

        const refreshResponse = await axios.post(
          SPOTIFY_AUTH_URL || 'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: user.spotifyRefreshToken,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )

        const { access_token, expires_in, refresh_token: newRefreshToken } = refreshResponse.data

        // Atualiza usuário no banco
        user.spotifyAccessToken = access_token
        user.spotifyTokenExpiresAt = new Date(Date.now() + expires_in * 1000)
        if (newRefreshToken) {
          user.spotifyRefreshToken = newRefreshToken
        }
        await user.save()

        // Seta token atualizado no req
        req.spotifyToken = access_token
        
      } catch (refreshErr) {
        console.error('[SPOTIFY AUTH] Refresh falhou:', refreshErr.response?.data || refreshErr.message)
        
        // Limpa tokens inválidos
        user.spotifyConnected = false
        user.spotifyAccessToken = undefined
        user.spotifyRefreshToken = undefined
        user.spotifyTokenExpiresAt = undefined
        await user.save()

        return res.status(403).json({
          error: 'SPOTIFY_REFRESH_FAILED',
          message: 'Não foi possível renovar o token do Spotify. Conecte novamente.',
          connectUrl: '/spotify/auth',
          requiresReauth: true
        })
      }
    } else {
      // Token ainda válido
      req.spotifyToken = user.spotifyAccessToken
    }

    // 🔥 PASSO 4: Adiciona dados do usuário e Spotify ao req
    req.spotifyRefreshToken = user.spotifyRefreshToken
    req.userDoc = user
    
    next()

  } catch (err) {
    console.error('[SPOTIFY AUTH] Erro interno:', err)
    return res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: 'Erro interno ao verificar Spotify'
    })
  }
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireSpotifyAuth
}