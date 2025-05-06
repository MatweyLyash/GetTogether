const models = require('./../models/relations');
const {generateInviteLink} = require('../bot/telegramBot');


class OrganizerRepository {
    async createEvent(creator_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, organizer_verification_key) {
        return await models.Event.create({creator_id, title, description, date, location, category_id, price, capacity, telegram_chat_link, organizer_verification_key});
    }

    async getOwnEvents(creator_id) {
        return await models.Event.findAll({
            where: { creator_id },
            include: {
                model: models.Category,
                as: 'category', // Указываем псевдоним, заданный в belongsTo
                attributes: ['id', 'category_name']
            }
        });
    }

    async getOwnEvent(creator_id, event_id) {
        return await models.Event.findOne({
            where: { creator_id:creator_id, id: event_id },
            include: {
                model: models.Category,
                as: 'category', // Указываем псевдоним, заданный в belongsTo
                attributes: ['id', 'category_name']
            }
        });
    }

    async updateEvent(creator_id, event_id, title, description, date, location, category_id, price, capacity, telegram_chat_link) {
        return await models.Event.update({title, description, date, location, category_id, price, capacity, telegram_chat_link}, {where:{creator_id, id:event_id}});
    }

    async deleteEvent(creator_id, event_id) {
        return await models.Event.destroy({where:{creator_id, id:event_id}});
    }

    async responseToEventRequest(creator_id, user_id, event_id, status_id) {
        console.log("creator_id: " + creator_id, "user_id: " + user_id, "event_id: " + event_id,"status_id" + status_id);
        const event = await models.Event.findOne({ where: { id: event_id, creator_id: creator_id } });
        console.log(event);
        if (!event) {
            throw new Error('Event not found or not owned by organizer');
        }

        const registration = await models.EventRegistration.findOne({
            where: { user_id, event_id },
          });
        
          registration.status_id = status_id;

          // Если статус "approved", генерируем одноразовую ссылку
          if (status_id === 2) {
            if (!event.telegram_chat_id) {
              throw new Error('Telegram group not linked to event');
            }
      
            const inviteResult = await generateInviteLink(event_id, user_id);
            if (!inviteResult.success) {
              throw new Error(`Failed to generate Telegram invite link: ${inviteResult.message}`);
            }
      
            registration.telegram_invite_link = inviteResult.inviteLink;
          }
      
          // Сохраняем изменения
          await registration.save();
    
          await registration.save();

          // Возвращаем обновлённую заявку с включённым статусом
          return await models.EventRegistration.findOne({
            where: { user_id, event_id },
            include: [{ model: models.Status, as: 'status', attributes: ['status_name'] }],
          });
    }

    async getEventRequests(creator_id, event_id) {
        return await models.EventRegistration.findAll({
            where: { event_id },
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'login', 'telegram', 'created_at']
                },
                {
                    model: models.Event,
                    as: 'event',
                    where: { creator_id }, // Проверяем, что событие принадлежит организатору
                    attributes: []
                }
            ]
        });
    }

    async getMe(user_id) {
        return await models.User.findByPk(user_id, {
            attributes: ['id', 'login', 'telegram', 'role_id', 'created_at'], // Выбираем нужные поля
        });
    }
}

module.exports.repository = new OrganizerRepository();