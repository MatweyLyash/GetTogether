const TelegramBot = require('node-telegram-bot-api');

const models = require('../models');
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
      return bot.sendMessage(chatId, 'Только организатор может привязать группу. Перейдите в личный чат с ботом и используйте команду /link <login> для привязки вашего телеграмм аккаунта.');
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

bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const login = match[1].trim();
  const telegramTag = `@${msg.from.username}`;
  const pendingTelegramTag = `PENDING_${telegramTag}`;
  const telegramUserId = msg.from.id; // ID пользователя в Telegram (user.id)

  try {
    if (msg.chat.type !== 'private') {
      return bot.sendMessage(chatId, 'Команда /link должна быть отправлена в личном чате с ботом.');
    }

    const user = await models.User.findOne({ where: { login } });
    if (!user) {
      return bot.sendMessage(chatId, `Пользователь с логином "${login}" не найден. Проверьте правильность логина.`);
    }

    const existingUser = await models.User.findOne({
      where: { telegram: telegramTag }
    });
    if (existingUser && existingUser.id !== user.id) {
      return bot.sendMessage(chatId, `Тег ${telegramTag} уже привязан к другому аккаунту.`);
    }

    // Сохраняем chat_id (который равен telegramUserId для личных чатов) в специальное хранилище
    // Используем формат: сохраняем в поле telegram как @username и отдельно chat_id
    // Для упрощения: будем использовать chatId напрямую при отправке через username
    const originalUpdatedAt = user.updatedAt.getTime();
    user.telegram = pendingTelegramTag;
    user.updatedAt = new Date();
    await user.save();
    
    // Сохраняем связь telegramUserId -> chatId для отправки уведомлений
    // Используем простой объект в памяти или можно создать отдельную таблицу
    // Пока используем глобальный объект для хранения соответствий
    if (!global.telegramChatIds) {
      global.telegramChatIds = new Map();
    }
    global.telegramChatIds.set(telegramTag, chatId);

    bot.sendMessage(
      chatId,
      `Запрос на привязку аккаунта "${login}" отправлен. Перейдите в личный кабинет на сайте и подтвердите привязку, указав ваш Telegram-тег (${telegramTag}).`
    );

    setTimeout(async () => {
      try {
        const updatedUser = await models.User.findByPk(user.id);
        if (!updatedUser) {
          console.error(`Пользователь с ID ${user.id} не найден при проверке таймера`);
          return;
        }

        const currentUpdatedAt = updatedUser.updatedAt.getTime();
        if (currentUpdatedAt === originalUpdatedAt) {
          updatedUser.telegram = null;
          updatedUser.updatedAt = new Date();
          await updatedUser.save();
          await bot.sendMessage(
            chatId,
            `Привязка аккаунта "${login}" отменена, так как не была подтверждена в течение 2 минут.`
          );
        } else if (!updatedUser.telegram.startsWith('PENDING_')) {
          // Сохраняем chat_id при успешной привязке
          if (!global.telegramChatIds) {
            global.telegramChatIds = new Map();
          }
          global.telegramChatIds.set(updatedUser.telegram, chatId);
          
          await bot.sendMessage(
            chatId,
            `Привязка аккаунта "${login}" успешна!`
          );
        }
      } catch (error) {
        console.error(`Ошибка в таймере для пользователя ${user.id}:`, error);
      }
    }, 120000);
  } catch (error) {
    console.error('Ошибка привязки аккаунта:', error);
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

// Функция для отправки уведомления пользователю по Telegram username
async function sendNotificationToUser(telegramUsername, message) {
  try {
    // Получаем chat_id из сохраненных соответствий
    if (!global.telegramChatIds) {
      global.telegramChatIds = new Map();
    }
    
    const chatId = global.telegramChatIds.get(telegramUsername);
    if (!chatId) {
      console.warn(`Chat ID не найден для пользователя ${telegramUsername}. Пользователь должен был написать боту ранее.`);
      return false;
    }
    
    await bot.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    return false;
  }
}

module.exports = { generateInviteLink, sendNotificationToUser, bot };

console.log('Telegram-бот запущен...');