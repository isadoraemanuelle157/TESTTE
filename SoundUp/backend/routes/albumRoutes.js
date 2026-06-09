const express = require('express')
const router = express.Router()

const albumController = require('../controllers/albumController')

// CRUD
router.post('/', albumController.create)
router.get('/', albumController.list)
router.get('/search', albumController.search)
router.get('/:id', albumController.getById)
router.put('/:id', albumController.update)
router.delete('/:id', albumController.remove)

module.exports = router