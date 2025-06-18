// server/bot_service/handlers.js

// 1. Завантажуємо змінні середовища (BOT_TOKEN, API_BASE, SITE_URL тощо)
require('dotenv').config({ path: __dirname + '/../info.env' });

const { session } = require('telegraf');
const axios       = require('axios');

module.exports = (bot) => {
  // 2. Підключаємо session-middleware для всіх оновлень
  bot.use(session());

  const API      = process.env.API_BASE;    // наприклад: http://localhost:5000/api
  const SITE_URL = process.env.SITE_URL;    // наприклад: https://example.com

  // Допоміжна: показати список чатів
  async function showChats(ctx) {
    const userId = ctx.from.id;
    try {
      const res   = await axios.get(`${API}/chats`, { params: { userId } });
      const chats = res.data;
      if (!chats.length) {
        return ctx.reply('У вас ще немає чатів. Почніть спілкування через сайт.');
      }
      const keyboard = chats.map(c => [
        { text: c.other_username, callback_data: `chat_${c.chat_id}` }
      ]);
      await ctx.reply('Ваші чати:', {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      console.error('❌ Error fetching chats:', err);
      ctx.reply('Не вдалося завантажити список чатів.');
    }
  }

  // Допоміжна: відкрити чат та показати повідомлення
  async function openChat(ctx, chatId, offset = 0) {
    // Сесія може бути ще неініціалізована на callback_query, тому гарантуємо:
    ctx.session = ctx.session || {};
    ctx.session.chatId = chatId;
    ctx.session.offset = offset;

    try {
      const res      = await axios.get(
        `${API}/chats/${chatId}/messages`,
        { params: { offset, limit: 50 } }
      );
      const messages = res.data;

      // Кнопка «Прислати ще» якщо більше 50
      if (messages.length === 50) {
        const moreMsg = await ctx.reply('📄 Завантажити ще:', {
          reply_markup: {
            inline_keyboard: [[
              { text: '📄 Прислати ще', callback_data: `more_${chatId}_${offset + 50}` }
            ]]
          }
        });
        ctx.session.moreMsgId = moreMsg.message_id;
      }

      // Відсилання самої історії
      let lastSender = null;
      for (const m of messages) {
        if (m.sender_name !== lastSender) {
          await ctx.reply(`— ${m.sender_name} —`);
          lastSender = m.sender_name;
        }
        await ctx.reply(m.content);
      }

      // Після першої партії (offset===0) виводимо підпис
      if (offset === 0) {
        await ctx.reply('— Ось розмова з цим користувачем —');
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      ctx.reply('Не вдалося завантажити історію чату.');
    }
  }

  // Головний /start: без payload – тільки кнопка на сайт; з payload – відкриваємо чат
  bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    if (payload) {
      return openChat(ctx, payload, 0);
    }
    // Привітальне повідомлення з єдиною кнопкою на сайт
    try {
      await ctx.reply(
        'Ласкаво просимo! Для подальшого спілкування перейдіть на сайт:',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Відвідати сайт', url: SITE_URL }]
            ]
          }
        }
      );
    } catch (err) {
      console.error('❌ Error in /start handler:', err);
      ctx.reply('Сталася помилка. Спробуйте ще раз пізніше.');
    }
  });

  // Команда і хук для «Меню чатів»
  bot.command('chats',    showChats);
  bot.hears('Меню чатів', showChats);

  // Команда і хук для «Відкрити чат»
  bot.command('open_chat', (ctx) => {
    const chatId = ctx.session?.chatId;
    if (!chatId) return ctx.reply('Спочатку відкрийте чат через /chats або deep-link.');
    return openChat(ctx, chatId, ctx.session.offset || 0);
  });
  bot.hears('Відкрити чат', (ctx) => {
    const chatId = ctx.session?.chatId;
    if (!chatId) return ctx.reply('Спочатку відкрийте чат через /chats або deep-link.');
    return openChat(ctx, chatId, ctx.session.offset || 0);
  });

  // Обробка кліків inline-кнопок chat_... або more_...
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    if (data.startsWith('chat_')) {
      const chatId = data.split('_')[1];
      return openChat(ctx, chatId, 0);
    }
    if (data.startsWith('more_')) {
      const [, chatId, offset] = data.split('_');
      // прибираємо попередню кнопку «Прислати ще»
      if (ctx.session.moreMsgId) {
        await ctx.deleteMessage(ctx.session.moreMsgId).catch(() => {});
      }
      return openChat(ctx, chatId, Number(offset));
    }
  });

  // Обробка будь-якого тексту: збереження і пересилка
  bot.on('text', async (ctx) => {
    const chatId = ctx.session?.chatId;
    if (!chatId) {
      return ctx.reply('Спочатку відкрийте чат через /start <chat_id> або /chats.');
    }
    const userId = ctx.from.id;
    const text   = ctx.message.text;

    // Зберігаємо повідомлення
    try {
      await axios.post(
        `${API}/chats/${chatId}/messages`,
        { sender_id: userId, content: text, content_type: 'text' }
      );
    } catch (err) {
      console.error('❌ Error saving message:', err);
      return ctx.reply('Не вдалося зберегти повідомлення.');
    }

    // Форвард повідомлення співрозмовнику
    try {
      const listRes = await axios.get(`${API}/chats`, { params: { userId } });
      const session = listRes.data.find(c => c.chat_id === chatId);
      if (session?.other_user_id) {
        await ctx.telegram.sendMessage(session.other_user_id, text);
      }
    } catch (err) {
      console.error('❌ Error forwarding message:', err);
    }
  });
};
