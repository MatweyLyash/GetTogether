const express = require('express')
const UserController = require('../controllers/userController');
const TagController = require('../controllers/tagController');
const PromotionController = require('../controllers/promotionController');
const EventViewController = require('../controllers/eventViewController');

const router = express.Router();

router.get('/categories', UserController.getCategories);
router.get('/events', UserController.getEvents);
router.get('/event/:event_id', UserController.getEvent);
router.get('/tags', TagController.getAllTags);
router.get('/promotion/prices', PromotionController.getPrices);
router.post('/event/:event_id/view', EventViewController.recordView);

module.exports = router;
