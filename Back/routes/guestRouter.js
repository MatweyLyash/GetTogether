const express = require('express')
const UserController = require('../controllers/userController');
const TagController = require('../controllers/tagController');

const router = express.Router();

router.get('/categories', UserController.getCategories);
router.get('/events', UserController.getEvents);
router.get('/event/:event_id', UserController.getEvent);
router.get('/tags', TagController.getAllTags);

module.exports = router;
