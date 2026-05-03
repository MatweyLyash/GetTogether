const express = require('express')
const OrganizerController = require('../controllers/organizerController');
const PromotionController = require('../controllers/promotionController');
const EventViewController = require('../controllers/eventViewController');

const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Допустимы только изображения формата JPEG, JPG или PNG'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/event', upload.single('image'), OrganizerController.createEvent);
router.get('/events', OrganizerController.getOwnEvents);
router.get('/event/:event_id', OrganizerController.getOwnEvent);
router.put('/event/:event_id', upload.single('image'), OrganizerController.updateEvent);
router.delete('/event/:event_id', OrganizerController.deleteEvent);
router.put('/event/request/:event_id', OrganizerController.responseToEventRequest);
router.get('/event/requests/:event_id', OrganizerController.getEventRequests);
router.post('/verify-registration', OrganizerController.verifyEventRegistration);

router.post('/promotion/checkout', PromotionController.checkout);
router.get('/promotions', PromotionController.list);
router.get('/stats', EventViewController.getStats);


module.exports = router;
