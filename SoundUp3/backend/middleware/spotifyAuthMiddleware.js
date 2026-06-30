module.exports = (req, res, next) => {

  // ============================================
  // ✅ LOGADO
  // ============================================
  if (req.isAuthenticated) {
    return next()
  }

  // ============================================
  // ❌ SEM LOGIN
  // ============================================
  return res.status(401).json({
    error: 'LOGIN_REQUIRED_SPOTIFY',
    message: 'Faça login para usar recursos Spotify',
    showLoginModal: true
  })
}