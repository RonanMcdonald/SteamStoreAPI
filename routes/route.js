// --- Initialization --- //
const express = require('express')
const controller = require('../controllers/controller')
const router = express.Router()

// --- Routes --- //
// Default
router.get('/', controller.default)

// --- Export --- //
module.exports = router
