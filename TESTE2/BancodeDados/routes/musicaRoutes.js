const express = require('express')
const router = express.Router()

const musicaController = require('../controllers/musicaController')

// CRUD
router.post('/', musicaController.create)
router.get('/', musicaController.list)
router.get('/:id', musicaController.getById)
router.put('/:id', musicaController.update)
router.delete('/:id', musicaController.remove)

module.exports = router