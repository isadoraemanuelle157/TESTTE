const cache = new Map()

// ✅ DEPOIS (versão melhorada):
function setCache(key, data, ttl = null) {
  const entry = { data }
  if (ttl) {
    entry.expiresAt = Date.now() + ttl
  }
  // Se não passar ttl, não seta expiresAt = nunca expira
  cache.set(key, entry)
}

function getCache(key) {
  const item = cache.get(key)
  if (!item) return null
  // Só verifica expiração se expiresAt existir
  if (item.expiresAt && Date.now() > item.expiresAt) {
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