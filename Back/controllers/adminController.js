const adminRepository = require('./../repository/adminRepository');
const AdminRepository = adminRepository.repository;

const UserRepository = require('./../repository/userRepository').repository;
const AchievementRepository = require('./../repository/achievementRepository').repository;

const validators = require('../services/baseValidators');
const eventValidator = require('../services/eventValidator');
const models = require('../models');


class AdminController {


  async addCategory(req, res) {
    try {
      const { category_name } = req.body;
      if (!category_name) {
        return res.status(400).json({ error: 'Название категории обязательно' });
      }
      await AdminRepository.addCategory({ category_name });
      res.status(201).json({ message: 'Категория добавлена' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async renameCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { category_name } = req.body;
      if (!category_name) {
        return res.status(400).json({ error: 'Новое название категории обязательно' });
      }
      await AdminRepository.renameCategory(category_id, category_name);
      res.status(200).json({ message: 'Категория переименована' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  async deleteCategory(req, res) {
    try {
      const { category_id } = req.params;
      await AdminRepository.deleteCategory(category_id);
      res.status(200).json({ message: 'Категория удалена' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await AdminRepository.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async userBan(req, res) {
    try {
      const { user_id } = req.params;
      const { isBan } = req.body;
      await AdminRepository.userBan(user_id, isBan);
      res.status(200).json({ message: 'Статус блокировки пользователя обновлён' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrganizerRequests(req, res) {
    try {
      const requests = await AdminRepository.getOrganizerRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async organizerResponse(req, res) {
    try {
      const { request_id } = req.params;
      const { status_id } = req.body;
      await AdminRepository.organizerResponse(request_id, status_id);
      res.status(200).json({ message: 'Статус заявки организатора обновлён' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async unassignOrganizer(req, res) {
    try {
      const { user_id } = req.params;
      await AdminRepository.unassignOrganizer(user_id);
      res.status(200).json({ message: 'Роль пользователя обновлена на организатора' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEvents(req, res) {
    try {
      const events = await AdminRepository.getEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const { title, description, date, location, category_id, price, capacity, telegram_chat_link, tags, latitude, longitude } = req.body;
      const image = req.file?.buffer;
      const { event_id } = req.params;

      let parsedTags = undefined;
      if (tags !== undefined) {
        try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        } catch (e) {
          console.warn('Error parsing tags:', e);
        }
      }

      const validation = eventValidator.validateEvent({
        title, description, date, location, category_id, price, capacity, telegram_chat_link
      });

      if (!eventValidator.validateId(event_id) || !validation.valid) {
        return res.status(400).json({ error: validation.errors ? validation.errors.join(', ') : 'Все поля должны быть заполнены и валидны' });
      }

      const event = await AdminRepository.updateEvent(event_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, image, parsedTags, latitude, longitude);

      if (event == 1) {
        const updatedEvent = await UserRepository.getEvent(event_id, null);
        if (updatedEvent.image) {
          const { getMimeType } = require('../utils/fileUtils');
          const mime = await getMimeType(updatedEvent.image);
          updatedEvent.dataValues.image = `data:${mime};base64,${updatedEvent.image.toString('base64')}`;
        }
        return res.status(200).json({ message: 'Мероприятие обновлено', event: updatedEvent });
      }
      return res.status(404).json({ error: "Мероприятие не найдено", event });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { event_id } = req.params;

      if (!eventValidator.validateId(event_id)) {
        return res.status(400).json({ error: 'Некорректный ID мероприятия' });
      }

      await AdminRepository.deleteEvent(event_id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Achievements CRUD
  async listAchievements(req, res) {
    try {
      const items = await AchievementRepository.list();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAchievement(req, res) {
    try {
      const { name, description, score, image, trigger, condition_event_id, condition_category_id, condition_payload } = req.body;
      if (!name || !score) {
        return res.status(400).json({ error: 'name и score обязательны' });
      }
      let imageBuffer = null;
      if (image) {
        try {
          const base64 = image.startsWith('data:') ? image.split(',')[1] : image;
          imageBuffer = Buffer.from(base64, 'base64');
        } catch (e) {
          return res.status(400).json({ error: 'image должен быть base64' });
        }
      }
      const item = await AchievementRepository.create({
        name,
        description,
        score,
        image: imageBuffer,
        trigger,
        condition_event_id,
        condition_category_id,
        condition_payload,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAchievement(req, res) {
    try {
      const { achievement_id } = req.params;
      const { name, description, score, image, trigger, condition_event_id, condition_category_id, condition_payload } = req.body;
      if (!achievement_id) {
        return res.status(400).json({ error: 'achievement_id обязателен' });
      }
      let imageBuffer = undefined;
      if (image !== undefined) {
        if (image === null || image === '') {
          imageBuffer = null;
        } else {
          try {
            const base64 = image.startsWith('data:') ? image.split(',')[1] : image;
            imageBuffer = Buffer.from(base64, 'base64');
          } catch (e) {
            return res.status(400).json({ error: 'image должен быть base64' });
          }
        }
      }
      await AchievementRepository.update(achievement_id, { name, description, score, image: imageBuffer, trigger, condition_event_id, condition_category_id, condition_payload });
      const updated = await AchievementRepository.get(achievement_id);
      if (!updated) return res.status(404).json({ error: 'Достижение не найдено' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAchievement(req, res) {
    try {
      const { achievement_id } = req.params;
      await AchievementRepository.delete(achievement_id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports.controller = new AdminController();
