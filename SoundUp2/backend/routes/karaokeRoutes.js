// === BACKEND: karaoke.js ===
// Rota: GET /api/karaoke/lyrics-sync?title=...&artist=...&previewUrl=...

const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

/**
 * Busca letras sincronizadas e detecta em qual parte do preview
 * a letra começa, para sincronia perfeita.
 */
router.get('/lyrics-sync', async (req, res) => {
  const { title, artist, previewDuration = 30 } = req.query
  
  try {
    // 1. Busca LRC do LRCLIB
    const query = `${title} ${artist}`.toLowerCase().trim()
    const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`)
    const lrcData = await lrcRes.json()
    
    if (!lrcData || lrcData.length === 0) {
      return res.status(404).json({ error: 'Letras não encontradas' })
    }
    
    const bestMatch = lrcData[0]
    const syncedLyrics = bestMatch.syncedLyrics
    
    // 2. Parse do LRC
    const parsedLines = parseLRC(syncedLyrics)
    
    // 3. Detecta a melhor janela de 30s para o preview
    // (assumindo que o preview começa no meio da música ou no início)
    const fullDuration = bestMatch.duration || 180
    
    // Estratégia: retorna TODAS as linhas com tempos ajustados
    // O frontend vai usar previewStartOffset para sincronizar
 const result = {
  fullDuration,
  previewDuration: parseInt(previewDuration),
  lyrics: parsedLines,
  suggestedOffset: detectBestPreviewOffset(parsedLines, fullDuration, previewDuration)
}
    
    res.json(result)
    
  } catch (error) {
    console.error('Erro karaoke lyrics:', error)
    res.status(500).json({ error: error.message })
  }
})

function parseLRC(lrcText) {
  const lines = []
  const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/
  
  lrcText.split('\n').forEach(line => {
    const match = line.match(lineRegex)
    if (match) {
      const min = parseInt(match[1])
      const sec = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0').substring(0, 3))
      const time = min * 60 + sec + ms / 1000
      const text = match[4].trim()
      
      if (text) {
        lines.push({ time, text })
      }
    }
  })
  
  return lines.sort((a, b) => a.time - b.time)
}

/**
 * Detecta o melhor ponto para começar o preview de 30s
 * baseado em onde há mais conteúdo vocal (não instrumental)
 */
function detectBestPreviewOffset(lines, fullDuration, previewDuration) {
  if (!lines.length) return 0
  
  // Janelas de 30s deslizantes
  let bestOffset = 0
  let bestScore = -1
  
  for (let offset = 0; offset <= fullDuration - previewDuration; offset += 5) {
    const windowEnd = offset + previewDuration
    const windowLines = lines.filter(l => l.time >= offset && l.time <= windowEnd)
    
    let score = 0
    const uniqueTexts = new Set()
    
    windowLines.forEach(l => {
      // Penaliza instrumental
      if (l.text.includes('♪') || l.text.includes('Instrumental')) {
        score -= 5
        return
      }
      
      // Penaliza repetição
      const normalized = l.text.toLowerCase().replace(/[^\w]/g, '')
      if (uniqueTexts.has(normalized)) {
        score += 2  // Coro = bom, mas não demais
      } else {
        score += 5  // Linha nova = muito bom
      }
      uniqueTexts.add(normalized)
      
      // Bônus por comprimento
      score += Math.min(l.text.length / 10, 3)
    })
    
    // Prefere o meio da música (mais provável de ter conteúdo interessante)
    const center = fullDuration / 2
    const distFromCenter = Math.abs(offset + previewDuration/2 - center)
    score += Math.max(0, 10 - distFromCenter / 5)
    
    if (score > bestScore) {
      bestScore = score
      bestOffset = offset
    }
  }
  
  return bestOffset
}

module.exports = router