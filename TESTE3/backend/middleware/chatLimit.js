const CHAT_LIMIT = 5
const anonymousChats = new Map() // IP => count

// ============================================
// 🔒 LIMITE DE MENSAGENS PARA USUÁRIOS ANÔNIMOS
// ============================================
const checkChatLimit = (req, res, next) => {
  // Se usuário está autenticado, liberar
  if (req.user && req.user.id) {
    return next()
  }

  const clientIp = req.ip || req.connection.remoteAddress || 'unknown'
  const currentCount = anonymousChats.get(clientIp) || 0

  if (currentCount >= CHAT_LIMIT) {
    return res.status(403).json({
      error: 'Limite de mensagens atingido',
      message: 'Você atingiu o limite de 5 mensagens. Faça login para continuar usando o chat.',
      limit: CHAT_LIMIT,
      used: currentCount,
      requiresAuth: true,
      redirectTo: '/login'
    })
  }

  // Incrementar contador
  anonymousChats.set(clientIp, currentCount + 1)
  
  // Adicionar info ao request
  req.chatInfo = {
    remaining: CHAT_LIMIT - (currentCount + 1),
    used: currentCount + 1,
    limit: CHAT_LIMIT
  }

  next()
}

// Resetar contador (após login)
const resetChatLimit = (ip) => {
  anonymousChats.delete(ip)
}

// Obter contador atual
const getChatCount = (ip) => {
  return anonymousChats.get(ip) || 0
}

module.exports = {
  checkChatLimit,
  resetChatLimit,
  getChatCount,
  CHAT_LIMIT
}