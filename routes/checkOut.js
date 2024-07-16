
const express = require('express')
const router = express.Router()

const checkoutController = require('../controllers/checkoutController')

router.post('/create-checkout', checkoutController.creatCheckOut)


module.exports = router