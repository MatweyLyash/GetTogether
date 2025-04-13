const express = require('express')
const UserController = require('../controllers/userController').controller;

const router = express.Router();

router.get('/categories', UserController.getCategories);
router.get('/events', UserController.getEvents);
router.get('/events/:event_id', UserController.getEvent);
router.post('/events/registration', UserController.createEventRegistration);
router.post('/reviews', UserController.createReview);
router.get('/events/registration', UserController.getOwnEventsRegistration);
router.post('/organizer/request', UserController.createOrganizerRequest);
router.get('/organizer/request', UserController.getOwnOrganizerRequests);

module.exports = router;