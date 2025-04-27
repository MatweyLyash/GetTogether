const OrganizerRepository = require('./../repository/organizerRepository');
const validators = require('../services/baseValidators');
const eventValidator = require('../services/eventValidator');

class OrganizerController {
    constructor() {
        this.organizerRepository = OrganizerRepository.repository;

        this.createEvent = this.createEvent.bind(this);
        this.getOwnEvents = this.getOwnEvents.bind(this);
        this.getOwnEvent = this.getOwnEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.responseToEventRequest = this.responseToEventRequest.bind(this);
    }

    async createEvent(req, res) {
        try {
            const { title, description, date, location, category_id, price, capacity, telegramGroup } = req.body;
            const creator_id = req.user.id;
            
            if (!eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity, telegramGroup
            })) {
                return res.status(400).json({ error: 'All fields are required and must be valid' });
            }
            
            const event = await this.organizerRepository.createEvent(creator_id, title, description, date, location, category_id, price, capacity, telegramGroup);
            return res.status(201).json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getOwnEvents(req, res) {
        try {
            const creater_id = req.user.id
            const events = await this.organizerRepository.getOwnEvents(creater_id);
            return res.json(events);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getOwnEvent(req, res) {
        try {
            const { event_id } = req.params;
            const creater_id = req.user.id
            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }
            
            const event = await this.organizerRepository.getOwnEvent(creater_id, event_id);
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }
            
            return res.json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async updateEvent(req, res) {
        try {
            const { event_id, title, description, date, location, category_id, price, capacity, telegramGroup } = req.body;
            const creator_id = req.user.id;
            if (!eventValidator.validateId(event_id) || !eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity, telegramGroup
            })) {
                return res.status(400).json({ error: 'All fields are required and must be valid' });
            }
            
            const event = await this.organizerRepository.updateEvent(creator_id, event_id, title, description, date, location, category_id, price, capacity, telegramGroup);
            
            if(event === 1) {
                return res.status(204).json({message: "Event updated successfully"});
            }
            return res.status(404).json({error: "Event not found"});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async deleteEvent(req, res) {
        try {
            const { event_id } = req.params;
            const creator_id = req.user.id;

            
            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }
            
            await this.organizerRepository.deleteEvent(creator_id, event_id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async responseToEventRequest(req, res) {
        try {
            const { user_id, status_id } = req.body;
            const { event_id } = req.params;
            const creator_id = req.user.id;
    
            if (!eventValidator.validateId(event_id) || !eventValidator.validateId(user_id) || !validators.validatePresence(status_id)) {
                return res.status(400).json({ error: 'Event ID, User ID, and Status ID are required and must be valid' });
            }
            
            const response = await this.organizerRepository.responseToEventRequest(creator_id, user_id, event_id, status_id);
            return res.json(response);
        } catch (error) {
            if (error.message === 'Event not found or not owned by organizer' || error.message === 'Registration not found') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrganizerController();
