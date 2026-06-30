const express = require('express')
const router = express.Router()
const { searchSong, getSong } = require('genius-lyrics-api')

const GENIUS_API_KEY = process.env.GENIUS_API_KEY

// ============================================
// 🔍 BUSCAR MÚSICA POR LETRA/TRECHO
// ============================================
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Query obrigatória' })
    }

    if (!GENIUS_API_KEY) {
      return res.status(500).json({ 
        error: 'Genius API key não configurada',
        message: 'Configure GENIUS_API_KEY no .env'
      })
    }

    const options = {
      apiKey: GENIUS_API_KEY,
      title: q,
      artist: '',
      optimizeQuery: true
    }

    const results = await searchSong(options)
    
    if (!results || results.length === 0) {
      return res.json({
        query: q,
        results: [],
        message: 'Nenhuma música encontrada com esse trecho'
      })
    }

    // Limitar resultados
    const limited = results.slice(0, parseInt(limit))

    // Buscar detalhes (letras) das músicas encontradas
    const detailedResults = await Promise.all(
      limited.map(async (song) => {
        try {
          const songDetails = await getSong({
            apiKey: GENIUS_API_KEY,
            title: song.title,
            artist: song.artist,
            optimizeQuery: true
          })

          return {
            id: song.id,
            title: song.title,
            artist: song.artist,
            url: song.url,
            albumArt: song.albumArt,
            lyrics: songDetails?.lyrics?.substring(0, 500) + '...' || null
          }
        } catch (err) {
          return {
            id: song.id,
            title: song.title,
            artist: song.artist,
            url: song.url,
            albumArt: song.albumArt,
            lyrics: null
          }
        }
      })
    )

    res.json({
      query: q,
      total: detailedResults.length,
      results: detailedResults
    })

  } catch (error) {
    console.error('❌ Genius search error:', error.message)
    res.status(500).json({ error: 'Erro na busca Genius' })
  }
})

// ============================================
// 🎵 BUSCAR MÚSICA ESPECÍFICA POR TÍTULO/ARTISTA
// ============================================
router.get('/song', async (req, res) => {
  try {
    const { title, artist = '' } = req.query

    if (!title) {
      return res.status(400).json({ error: 'Título obrigatório' })
    }

    if (!GENIUS_API_KEY) {
      return res.status(500).json({ 
        error: 'Genius API key não configurada' 
      })
    }

    const options = {
      apiKey: GENIUS_API_KEY,
      title,
      artist,
      optimizeQuery: true
    }

    const song = await getSong(options)

    if (!song) {
      return res.status(404).json({ 
        error: 'Música não encontrada',
        query: { title, artist }
      })
    }

    res.json({
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      albumArt: song.albumArt,
      lyrics: song.lyrics?.substring(0, 1000) || null
    })

  } catch (error) {
    console.error('❌ Genius song error:', error.message)
    res.status(500).json({ error: 'Erro ao buscar música' })
  }
})

module.exports = router