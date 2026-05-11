const jwt = require('jsonwebtoken')

// ============================================
// 🔓 OPTIONAL AUTH - Identifica usuário logado mas não bloqueia
// ============================================
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  req.isLogged = false
  req.user = null

  if (!authHeader) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, "SEGREDO_SUPER_SECRETO")
    req.user = decoded
    req.isLogged = true
    next()
  } catch (err) {
    // Token inválido, mas não bloqueia
    next()
  }
}

// ============================================
// 🔒 REQUIRE AUTH - Exige login obrigatório
// ============================================
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      error: 'Login obrigatório',
      code: 'AUTH_REQUIRED',
      message: 'Faça login para acessar este recurso do Spotify'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, "SEGREDO_SUPER_SECRETO")
    req.user = decoded
    req.isLogged = true
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN',
      message: 'Sessão expirada. Faça login novamente.'
    })
  }
}

module.exports = { optionalAuth, requireAuth }