const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const requireSpotifyAuth = require('../middleware/requireSpotifyAuth')
const spotifyController = require('../controllers/spotifyController')

// ============================================
// 🔓 ROTAS PÚBLICAS (não precisam de login)
// ============================================
router.get('/artists/popular', spotifyController.getPopularArtists)  // ✅ REMOVIDO requireAuth
router.get('/vibes', spotifyController.getVibes)                      // ✅ REMOVIDO requireAuth

// ============================================
// 🔓 ROTAS PÚBLICAS COM PREVIEW (app token)
// ============================================
router.get('/search', spotifyController.search)  // ✅ REMOVIDO requireAuth (ou mantenha se quiser)

// ============================================
// 🔒 ROTAS QUE REQUEREM SPOTIFY CONECTADO (user token = full tracks)
// ============================================
router.get('/search/full', requireAuth, requireSpotifyAuth, spotifyController.searchFullTracks)
router.get('/artist/:id', requireAuth, requireSpotifyAuth, spotifyController.getArtist)
router.get('/artist/:id/top-tracks', requireAuth, requireSpotifyAuth, spotifyController.getArtistTopTracks)
router.get('/artist/:id/albums', requireAuth, requireSpotifyAuth, spotifyController.getArtistAlbums)
router.get('/artist/:id/related-artists', requireAuth, requireSpotifyAuth, spotifyController.getRelatedArtists)
router.get('/album/:id', requireAuth, requireSpotifyAuth, spotifyController.getAlbum)
router.get('/albums/:id/tracks', requireAuth, requireSpotifyAuth, spotifyController.getAlbumTracks)
router.get('/playlist/:id', requireAuth, requireSpotifyAuth, spotifyController.getPlaylist)

// ============================================
// 🎵 OAUTH DO SPOTIFY
// ============================================
router.get('/auth', requireAuth, spotifyController.initiateAuth)
router.get('/callback', spotifyController.callback)
router.post('/refresh', requireAuth, spotifyController.refreshUserToken)
router.get('/status', requireAuth, spotifyController.getSpotifyStatus)

module.exports = router