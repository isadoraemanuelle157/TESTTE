const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const requireSpotifyAuth = require('../middleware/requireSpotifyAuth')
const spotifyController = require('../controllers/spotifyController')

// ============================================
// 🔓 ROTAS PÚBLICAS (não precisam de login)
// ============================================
router.get('/artists/popular', spotifyController.getPopularArtists)
router.get('/vibes', spotifyController.getVibes)

// ============================================
// 🔓 ROTAS PÚBLICAS COM PREVIEW (app token)
// ============================================
router.get('/search', spotifyController.search)
router.get('/artist/:id', spotifyController.getArtist)
router.get('/artist/:id/top-tracks', spotifyController.getArtistTopTracks)
router.get('/artist/:id/albums', spotifyController.getArtistAlbums)
router.get('/artist/:id/related-artists', spotifyController.getRelatedArtists)
router.get('/album/:id', spotifyController.getAlbum)
router.get('/albums/:id/tracks', spotifyController.getAlbumTracks)
router.get('/playlist/:id', spotifyController.getPlaylist)

// ============================================
// 🔒 ROTAS QUE REQUEREM SPOTIFY CONECTADO (user token = full tracks)
// ============================================
router.get('/search/full', requireAuth, requireSpotifyAuth, spotifyController.searchFullTracks)

// ============================================
// 🎵 OAUTH DO SPOTIFY
// ============================================
router.get('/auth', requireAuth, spotifyController.initiateAuth)
router.get('/callback', spotifyController.callback)
router.post('/refresh', requireAuth, spotifyController.refreshUserToken)
router.get('/status', requireAuth, spotifyController.getSpotifyStatus)

// ============================================
// 🎵 SPOTIFY WEB PLAYBACK SDK
// ============================================
router.put('/transfer-playback', requireAuth, requireSpotifyAuth, spotifyController.transferPlayback)

module.exports = router