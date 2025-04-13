const OrganizerRepository = require('./../repository/organizerRepository').repository;
const validators = require('../services/baseValidators');
const eventValidator = require('../services/eventValidator');

class OrganizerController {
    constructor() {
        this.organizerRepository = new OrganizerRepository();
    }

    async createEvent(req, res) {
        try {
            const { user_id, title, description, date, location, category_id, price, capacity } = req.body;
            
            if (!validators.validatePresence(user_id) || !eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity
            })) {
                return res.status(400).json({ error: 'All fields are required and must be valid' });
            }
            
            const event = await this.organizerRepository.createEvent(user_id, title, description, date, location, category_id, price, capacity);
            return res.status(201).json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getOwnEvents(req, res) {
        try {
            const { user_id } = req.params;
            
            if (!validators.validatePresence(user_id)) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const events = await this.organizerRepository.getOwnEvents(user_id);
            return res.json(events);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getOwnEvent(req, res) {
        try {
            const { event_id } = req.params;
            
            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }
            
            const event = await this.organizerRepository.getOwnEvent(event_id);
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
            const { event_id, title, description, date, location, category_id, price, capacity } = req.body;
            
            if (!eventValidator.validateId(event_id) || !eventValidator.validateEvent({
                title, description, date, location, category_id, price, capacity
            })) {
                return res.status(400).json({ error: 'All fields are required and must be valid' });
            }
            
            const event = await this.organizerRepository.updateEvent(event_id, title, description, date, location, category_id, price, capacity);
            return res.json(event);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async deleteEvent(req, res) {
        try {
            const { event_id } = req.params;
            
            if (!eventValidator.validateId(event_id)) {
                return res.status(400).json({ error: 'Valid Event ID is required' });
            }
            
            await this.organizerRepository.deleteEvent(event_id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async responseToEventRequest(req, res) {
        try {
            const { user_id, event_id, status_id } = req.body;
            
            if (!validators.validatePresence(user_id) || 
                !eventValidator.validateId(event_id) || 
                !validators.validatePresence(status_id)) {
                return res.status(400).json({ error: 'User ID, Event ID and Status ID are required' });
            }
            
            const response = await this.organizerRepository.responseToEventRequest(user_id, event_id, status_id);
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
module.exports = new OrganizerController();
