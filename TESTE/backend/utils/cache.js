const cache = new Map()

function getCache(key, ttlMs = 300000) {
  const entry = cache.get(key)

  if (entry && Date.now() - entry.ts < ttlMs) {
    return entry.data
  }

  return null
}

function setCache(key, data) {
  cache.set(key, {
    data,
    ts: Date.now()
  })
}

module.exports = {
  getCache,
  setCache,
  cache
}