const express = require('express')
const UserController = require('../controllers/userController');
const SubscriptionController = require('../controllers/subscriptionController');
const webPushService = require('../services/webPushService');

const router = express.Router();

router.get('/categories', UserController.getCategories);
router.get('/events', UserController.getEvents);
router.get('/event/:event_id', UserController.getEvent);

router.post('/events/registration', UserController.createEventRegistration);
router.put('/events/registration/:event_id/cancel', UserController.cancelEventRegistration);
router.get('/events/registration/:registration_id/qrcode', UserController.getRegistrationQRCode);
router.post('/reviews', UserController.createReview);
router.get('/events/registration', UserController.getOwnEventsRegistration);
router.post('/organizer/request', UserController.createOrganizerRequest);
router.get('/organizer/request', UserController.getOwnOrganizerRequests);
router.get('/achievements', UserController.getAchievementsProgress);

router.post('/link-telegram', UserController.linkTelegram);
router.get('/me', UserController.getMe);

// Subscription routes
router.post('/subscriptions', SubscriptionController.createSubscription);
router.get('/subscriptions', SubscriptionController.getSubscriptions);
router.delete('/subscriptions/:subscription_id', SubscriptionController.deleteSubscription);

// Web Push routes
router.get('/push/vapid-public-key', (req, res) => {
    const publicKey = webPushService.getPublicKey();
    if (!publicKey) {
        return res.status(503).json({ error: 'Web Push уведомления недоступны: VAPID ключи не настроены' });
    }
    res.json({ publicKey });
});

router.post('/push/subscribe', async (req, res) => {
    try {
        const user_id = req.user.id;
        const subscription = req.body;
        await webPushService.savePushSubscription(user_id, subscription);
        res.status(201).json({ message: 'Push subscription saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/push/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;
        await webPushService.removePushSubscription(endpoint);
        res.status(200).json({ message: 'Push subscription removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;