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
  id: decoded.id || decoded._id
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
  id: decoded.id || decoded._id
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

module.exports = {
  optionalAuth,
  requireAuth
}