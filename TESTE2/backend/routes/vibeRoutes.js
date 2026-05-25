const express = require('express')
const router = express.Router()
const vibeController = require('../controllers/vibeController')

router.post('/', vibeController.create)
router.get('/', vibeController.list)
router.get('/:id', vibeController.getById)
router.put('/:id', vibeController.update)
router.delete('/:id', vibeController.remove)

module.exports = router