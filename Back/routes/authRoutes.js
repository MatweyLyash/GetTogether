const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.controller.register);

router.post('/authenticate', authController.controller.authenticate);

module.exports = router;