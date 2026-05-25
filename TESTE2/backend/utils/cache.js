const cache = new Map()

function getCache(key) {
  const item = cache.get(key)

  if (!item) return null

  // expirado
  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    return null
  }

  return item.data
}

function setCache(key, data, ttl = 1000 * 60 * 30) {
  // 30 minutos

  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  })
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