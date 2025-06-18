require('dotenv').config({ path: __dirname + '/info.env' });
const { Telegraf } = require('telegraf');
const botHandlers = require('./handlers');

if (!process.env.BOT_TOKEN) {
  console.error('⛔ BOT_TOKEN не встановлено в .env');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
botHandlers(bot);

bot.launch()
  .then(() => console.log('✅ Telegram-бот запущений'))
  .catch(err => console.error('❌ Помилка запуску бота', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
