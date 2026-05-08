// utils/cache.js
const cache = new Map()

function getCache(key, ttl = 300000) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > ttl) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

module.exports = { getCache, setCache, cache }