const express = require('express')

const router = express.Router()

const spotifyController = require('../controllers/spotifyController')

router.get('/search', spotifyController.search)

router.get('/artist/:id', spotifyController.getArtist)

router.get('/album/:id', spotifyController.getAlbum)

router.get('/playlist/:id', spotifyController.getPlaylist)

module.exports = router