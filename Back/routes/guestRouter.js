const express = require('express')
const UserController = require('../controllers/userController');

const router = express.Router();

router.get('/categories', UserController.getCategories);
router.get('/events', UserController.getEvents);
router.get('/event/:event_id', UserController.getEvent);

module.exports = router;
