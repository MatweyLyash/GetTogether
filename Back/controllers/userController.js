const UserRepository = require('../repository/userRepository');
const validators = require('../services/baseValidators');

class UserController {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getCategories(req, res) {
        try {
            const categories = await this.userRepository.getCategories();
            return res.json(categories);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getEvents(req, res) {
        try {
            const events = await this.userRepository.getEvents();
            return res.json(events);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getEvent(req, res) {
        try {
            const { event_id } = req.params;
            
            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'Event ID is required' });
            }
            
            const event = await this.userRepository.getEvent(event_id);
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }
            
            return res.json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createEventRegistration(req, res) {
        try {
            const { user_id, event_id } = req.body;
            
            if (!validators.validatePresence(user_id) || !validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'User ID and Event ID are required' });
            }
            
            const registration = await this.userRepository.createEventRegistration(user_id, event_id);
            return res.status(201).json(registration);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createReview(req, res) {
        try {
            const { user_id, event_id, rating, text } = req.body;
            
            if (!validators.validatePresence(user_id) || !validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'User ID and Event ID are required' });
            }
            
            if (!validators.validateRating(rating)) {
                return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
            }
            
            if (!validators.validateText(text)) {
                return res.status(400).json({ error: 'Text must be between 1 and 255 characters' });
            }
            
            const review = await this.userRepository.createReview(user_id, event_id, rating, text);
            return res.status(201).json(review);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getReviews(req, res) {
        try {
            const { event_id } = req.params;
            
            if (!validators.validatePresence(event_id)) {
                return res.status(400).json({ error: 'Event ID is required' });
            }
            
            const reviews = await this.userRepository.getReviews(event_id);
            return res.json(reviews);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getOwnEventsRegistration(req, res) {
        try {
            const { user_id } = req.params;
            
            if (!validators.validatePresence(user_id)) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const registrations = await this.userRepository.getOwnEventsRegistration(user_id);
            return res.json(registrations);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createOrganizerRequest(req, res) {
        try {
            const { user_id } = req.body;
            
            if (!validators.validatePresence(user_id)) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const request = await this.userRepository.createOrganizerRequest(user_id);
            return res.status(201).json(request);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getOwnOrganizerRequests(req, res) {
        try {
            const { user_id } = req.params;
            
            if (!validators.validatePresence(user_id)) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const requests = await this.userRepository.getOwnOrganizerRequests(user_id);
            return res.json(requests);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();