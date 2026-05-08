const express = require('express')

const router = express.Router()

const deezerController = require('../controllers/deezerController')

router.get('/search', deezerController.search)

module.exports = router