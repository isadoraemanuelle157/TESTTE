const express = require('express')
const router = express.Router()
const spotifyController = require('../controllers/spotifyController')

router.get('/search', spotifyController.search)
router.get('/artist/:id', spotifyController.getArtist)
router.get('/artist/:id/top-tracks', spotifyController.getArtistTopTracks)
router.get('/artist/:id/albums', spotifyController.getArtistAlbums)
router.get('/artist/:id/related-artists', spotifyController.getRelatedArtists)
router.get('/album/:id', spotifyController.getAlbum)
router.get('/playlist/:id', spotifyController.getPlaylist)
router.get('/artists/popular', spotifyController.getPopularArtists)

module.exports = router