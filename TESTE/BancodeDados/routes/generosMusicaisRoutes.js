const express = require('express')
const router = express.Router()

const generoController = require('../controllers/GenerosMusicaisController')

// CRUD
router.post('/', generoController.create)
router.get('/', generoController.list)
router.get('/:id', generoController.getById)
router.put('/:id', generoController.update)
router.delete('/:id', generoController.remove)

module.exports = router