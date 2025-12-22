const models = require('../models');
const validators = require('../services/baseValidators');

class TagController {
    async createTag(req, res) {
        try {
            const { name } = req.body;
            if (!validators.validatePresence(name)) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const existing = await models.Tag.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ error: 'Tag already exists' });
            }

            const tag = await models.Tag.create({ name });
            return res.status(201).json(tag);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllTags(req, res) {
        try {
            // Default behavior is paranoid: true (only active tags)
            const tags = await models.Tag.findAll({
                order: [['name', 'ASC']]
            });
            return res.json(tags);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateTag(req, res) {
        try {
            const { tag_id } = req.params;
            const { name } = req.body;

            if (!validators.validatePresence(name)) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const tag = await models.Tag.findByPk(tag_id);
            if (!tag) {
                return res.status(404).json({ error: 'Tag not found' });
            }

            // Check name uniqueness if changed
            if (name !== tag.name) {
                const existing = await models.Tag.findOne({ where: { name } });
                if (existing) {
                    return res.status(400).json({ error: 'Tag with this name already exists' });
                }
            }

            tag.name = name;
            await tag.save();
            return res.json(tag);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteTag(req, res) {
        try {
            const { tag_id } = req.params;
            const tag = await models.Tag.findByPk(tag_id);
            if (!tag) {
                return res.status(404).json({ error: 'Tag not found' });
            }
            // Soft delete
            await tag.destroy();
            return res.status(200).json({ message: 'Tag deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TagController();
