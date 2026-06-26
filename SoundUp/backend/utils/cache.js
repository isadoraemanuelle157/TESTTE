const cache = new Map()

const DEFAULT_TTL = 1000 * 60 * 30 // 30 minutos padrão

function setCache(key, data, ttl = DEFAULT_TTL) {
  const entry = { 
    data,
    expiresAt: Date.now() + ttl  // ← SEMPRE expira agora (nunca infinito)
  }
  cache.set(key, entry)
}

function getCache(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    return null
  }
  return item.data
}

function deleteCache(key) {
  cache.delete(key)
}

function clearCache() {
  cache.clear()
}

module.exports = {
  cache,
  getCache,
  setCache,
  deleteCache,
  clearCache
}