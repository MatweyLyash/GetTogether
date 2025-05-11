const express = require('express');
const userController = require('../controllers/userController');
const AdminController = require('../controllers/adminController').controller;
const organizerController = require('../controllers/organizerController');

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
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get('/categories', userController.getCategories);
router.get('/events', userController.getEvents);
router.post('/categories', AdminController.addCategory);
router.put('/categories/:category_id', AdminController.renameCategory);
router.delete('/categories/:category_id', AdminController.deleteCategory);

router.get('/users', AdminController.getUsers);
router.put('/users/:user_id/ban', AdminController.userBan);

router.get('/organizers/request', AdminController.getOrganizerRequests);
router.put('/organizer/request/:request_id', AdminController.organizerResponse);
router.put('/organizer/unassign/:user_id', AdminController.unassignOrganizer);

router.put('/event/:event_id', upload.single('image'), AdminController.updateEvent);
router.delete('/event/:event_id', AdminController.deleteEvent);



module.exports = router;