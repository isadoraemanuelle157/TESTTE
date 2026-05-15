const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth') // ← ADICIONAR
const spotifyController = require('../controllers/spotifyController')

// ============================================
// 🎵 SPOTIFY — TUDO REQUER LOGIN
// ============================================

router.get('/search', requireAuth, spotifyController.search)
router.get('/artist/:id', requireAuth, spotifyController.getArtist)
router.get('/artist/:id/top-tracks', requireAuth, spotifyController.getArtistTopTracks)
router.get('/artist/:id/albums', requireAuth, spotifyController.getArtistAlbums)
router.get('/artist/:id/related-artists', requireAuth, spotifyController.getRelatedArtists)
router.get('/album/:id', requireAuth, spotifyController.getAlbum)
router.get('/playlist/:id', requireAuth, spotifyController.getPlaylist)
router.get('/artists/popular', requireAuth, spotifyController.getPopularArtists)
router.get('/vibes', requireAuth, spotifyController.getVibes)

module.exports = router