const express  = require('express')
const OrganizerController = require('../controllers/organizerController').controller;

const router = express.Router();

router.post('/event', OrganizerController.createEvent);
router.get('/events', OrganizerController.getOwnEvents);
router.get('/event/:event_id', OrganizerController.getOwnEvent);
router.put('/event/:event_id', OrganizerController.updateEvent);
router.delete('/event/:event_id', OrganizerController.deleteEvent);
router.put('/event/request/:event_id', OrganizerController.responseToEventRequest);

module.exports = router;
