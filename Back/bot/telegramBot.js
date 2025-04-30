const TelegramBot = require('node-telegram-bot-api');
// const { sequelize } = require('./models');
// const Event = sequelize.models.Event;
// const User = sequelize.models.User;
const models = require('../models/relations');
const { v4: uuidv4 } = require('uuid');

// Замени на свой токен
const token = '7583742094:AAGU85WdKHQBr_vnVsEomjMp1dj8mtZXZdU';

const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /verify <key>
bot.onText(/\/verify (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const key = match[1];
  const username = msg.from.username;

  try {
    // Проверяем, является ли сообщение из группы
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return bot.sendMessage(chatId, 'Команда /verify должна быть отправлена в группе.');
    }

    // Находим событие по ключу
    const event = await models.Event.findOne({ where: { organizer_verification_key: key } });
    if (!event) {
      return bot.sendMessage(chatId, 'Неверный ключ.');
    }

    // Проверяем, является ли отправитель организатором
    const organizer = await models.User.findByPk(event.creator_id);
    if (!organizer || !username || organizer.telegram !== `@${username}`) {
      return bot.sendMessage(chatId, 'Только организатор может привязать группу.');
    }

    const admins = await bot.getChatAdministrators(chatId);
    console.log('Admins:', admins); // Отладка: список администраторов
    const botInfo = await bot.getMe();
    console.log('Bot ID:', botInfo.id); // Отладка: ID бота
    const isBotAdmin = admins.some(admin => admin.user.id === botInfo.id);
    if (!isBotAdmin) {
      return bot.sendMessage(chatId, 'Сделайте бота администратором с правом приглашать пользователей.');
    }

    // Проверяем конкретное право can_invite_users
    const botAdmin = admins.find(admin => admin.user.id === botInfo.id);
    if (!botAdmin || !botAdmin.can_invite_users) {
      return bot.sendMessage(chatId, 'Боту необходимо право приглашать пользователей.');
    }

    // Сохраняем chat_id и деактивируем ключ
    event.telegram_chat_id = chatId;
    event.organizer_verification_key = null; // Ключ одноразовый
    await event.save();

    bot.sendMessage(chatId, `Группа успешно привязана к мероприятию "${event.title}"!`);
  } catch (error) {
    console.error('Ошибка верификации:', error);
    bot.sendMessage(chatId, `Ошибка: ${error.message}`);
  }
});

// Функция для генерации одноразовой ссылки
async function generateInviteLink(eventId, userId) {
  try {
    const event = await models.Event.findByPk(eventId);
    if (!event || !event.telegram_chat_id) {
      throw new Error('Мероприятие не найдено или не имеет Telegram-группы');
    }

    const user = await models.User.findByPk(userId);
    const username = user?.telegram || 'unknown';

    const inviteLink = await bot.createChatInviteLink(event.telegram_chat_id, {
      member_limit: 1,
      name: `Invite for ${username} to event ${eventId}`,
    });

    return { success: true, inviteLink: inviteLink.invite_link };
  } catch (error) {
    console.error('Ошибка генерации ссылки:', error);
    return { success: false, message: error.message };
  }
}

// Обработчик ошибок polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

module.exports = { generateInviteLink };

console.log('Telegram-бот запущен...');