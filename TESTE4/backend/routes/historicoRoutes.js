const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const controller = require('../controllers/historicoController')

router.get('/', auth, controller.getHistorico)
router.post('/', auth, controller.addHistorico)
router.delete('/', auth, controller.clearHistorico)

module.exports = router
