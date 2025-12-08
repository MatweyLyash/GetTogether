const SubscriptionRepository = require('../repository/subscriptionRepository');
const validators = require('../services/baseValidators');

class SubscriptionController {
    constructor() {
        this.subscriptionRepository = SubscriptionRepository.repository;
        this.createSubscription = this.createSubscription.bind(this);
        this.deleteSubscription = this.deleteSubscription.bind(this);
        this.getSubscriptions = this.getSubscriptions.bind(this);
    }

    async createSubscription(req, res) {
        try {
            const { subscription_type, target_id, notification_method } = req.body;
            const user_id = req.user.id;

            if (!['organizer', 'category'].includes(subscription_type)) {
                return res.status(400).json({ error: 'Invalid subscription_type' });
            }
            if (!['telegram', 'browser'].includes(notification_method)) {
                return res.status(400).json({ error: 'Invalid notification_method' });
            }
            if (!validators.validatePresence(target_id)) {
                return res.status(400).json({ error: 'target_id is required' });
            }

            const subscription = await this.subscriptionRepository.createSubscription(
                user_id, subscription_type, target_id, notification_method
            );
            return res.status(201).json(subscription);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Subscription already exists' });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteSubscription(req, res) {
        try {
            const { subscription_id } = req.params;
            const user_id = req.user.id;

            const deleted = await this.subscriptionRepository.deleteSubscription(user_id, subscription_id);
            if (deleted === 0) {
                return res.status(404).json({ error: 'Subscription not found' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getSubscriptions(req, res) {
        try {
            const user_id = req.user.id;
            const subscriptions = await this.subscriptionRepository.getSubscriptions(user_id);
            return res.json(subscriptions);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SubscriptionController();
