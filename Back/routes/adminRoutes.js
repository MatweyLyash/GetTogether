const express = require('express')
const AdminController = require('../controllers/adminController').controller;

const router = express.Router();

router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.addCategory);
router.put('/categories/:category_id', AdminController.renameCategory);
router.delete('/categories/:category_id', AdminController.deleteCategory);

router.get('/users', AdminController.getUsers);
router.put('/users/:user_id/ban', AdminController.userBan);

router.put('/organizer/request/:request_id', AdminController.organizerResponse);
router.put('/organizer/take/:user_id', AdminController.unassignOrganizer);

router.get('/events', AdminController.getEvents);

module.exports = router;