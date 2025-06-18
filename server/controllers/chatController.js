// server/controllers/chatController.js
const pool = require('../db/db');

/**
 * Створити новий чат або повернути існуючий
 */
exports.createChat = async (req, res) => {
  const { user1_id, user2_id } = req.body;
  if (!user1_id || !user2_id) {
    return res.status(400).json({ error: 'Missing user1_id or user2_id' });
  }
  const [a, b] = [Number(user1_id), Number(user2_id)].sort((x, y) => x - y);
  try {
    // Вставка або повернення існуючого chat_id
    const insertRes = await pool.query(
      `INSERT INTO chats (user_a, user_b)
       VALUES ($1, $2)
       ON CONFLICT ON CONSTRAINT chats_user_pair_unique
       DO NOTHING
       RETURNING chat_id`,
      [a, b]
    );
    let chatId;
    if (insertRes.rows.length) {
      chatId = insertRes.rows[0].chat_id;
    } else {
      const exist = await pool.query(
        `SELECT chat_id FROM chats
         WHERE user_a = $1 AND user_b = $2`,
        [a, b]
      );
      chatId = exist.rows[0].chat_id;
    }
    return res.json({ chat_id: chatId });
  } catch (err) {
    console.error('❌ createChat error:', err);
    return res.status(500).json({ error: 'Failed to create chat' });
  }
};

/**
 * Повернути список чатів для користувача з іменами співрозмовників
 */
exports.getChats = async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { rows } = await pool.query(
      `SELECT
         c.chat_id,
         CASE WHEN c.user_a=$1 THEN c.user_b ELSE c.user_a END        AS other_user_id,
         u.name                                                        AS other_username,
         -- останнє повідомлення
         m.content                                                     AS last_message,
         m.created_at                                                  AS last_message_time,
         -- непрочитані
         ( SELECT COUNT(*) FROM messages
           WHERE chat_id = c.chat_id
             AND sender_id <> $1
             AND created_at > 
               CASE WHEN c.user_a=$1 THEN c.last_read_a ELSE c.last_read_b END
         )                                                             AS unread_count,
         -- онлайн, якщо last_online < 5 хвилин
         ( u.last_online > now() - INTERVAL '5 minutes' )              AS is_online
       FROM chats c
       JOIN users u
         ON u.telegram_id = CASE WHEN c.user_a=$1 THEN c.user_b ELSE c.user_a END
       LEFT JOIN LATERAL (
         SELECT content, created_at
         FROM messages
         WHERE chat_id = c.chat_id
         ORDER BY created_at DESC
         LIMIT 1
       ) m ON TRUE
       WHERE c.user_a=$1 OR c.user_b=$1
       ORDER BY m.created_at DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('❌ getChats error:', err);
    return res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

/**
 * Повернути історію повідомлень чату з sender_name
 */
exports.getMessages = async (req, res) => {
  const chatId = req.params.chatId;
  // приймаємо пагінацію з query
  const limit  = parseInt(req.query.limit, 10)  || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  try {
    const { rows } = await pool.query(
      `SELECT
         id AS message_id,
         sender_id,
         sender_name,
         content,
         content_type,
         created_at
       FROM messages
       WHERE chat_id = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [chatId, limit, offset]
    );
    return res.json(rows);
  } catch (err) {
    console.error('❌ getMessages error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Надіслати повідомлення в чат: вставити з sender_name та оновити last_activity
 */
exports.sendMessage = async (req, res) => {
  const chatId     = req.params.chatId;
  const { sender_id, content, content_type } = req.body;
  if (!sender_id || !content) {
    return res.status(400).json({ error: 'Missing sender_id or content' });
  }

  try {
    // 1) Дістаємо ім'я відправника
    const userRes = await pool.query(
      `SELECT name FROM users WHERE telegram_id = $1`,
      [sender_id]
    );
    const senderName = userRes.rows[0]?.name || 'Анонім';

    // 2) Вставляємо повідомлення з sender_name
    const insertRes = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, sender_name, content, content_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id AS message_id, created_at`,
      [chatId, sender_id, senderName, content, content_type || 'text']
    );
    const { message_id, created_at } = insertRes.rows[0];

    // 3) Оновлюємо last_activity у чаті
    await pool.query(
      `UPDATE chats
       SET last_message_id = $1,
           last_activity   = $2
       WHERE chat_id = $3`,
      [message_id, created_at, chatId]
    );

    return res.json({ message_id, created_at });
  } catch (err) {
    console.error('❌ sendMessage error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.markChatAsRead = async (req, res) => {
  const { chatId } = req.params;
  try {
    await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE chat_id = $1`,
      [chatId]
    );
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('❌ Error updating message read status:', error);
    res.status(500).json({ error: 'Failed to update read status' });
  }
};

