// server/controllers/profileController.js
const userModel = require('../models/userModel');

exports.getProfile = async (req, res) => {
  const telegram_id = req.params.id;

  try {
    console.log(`🔍 Спроба отримати профіль для telegram_id: ${telegram_id}`);
    const profile = await userModel.getUserById(telegram_id);
    if (!profile) {
      console.warn(`⚠️ Користувач із telegram_id ${telegram_id} не знайдений.`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`✅ Профіль знайдено:`, profile);
    res.status(200).json(profile);
  } catch (error) {
    console.error('❌ Помилка отримання профілю:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const telegram_id = req.params.id;

  // Зчитуємо з тіла ті поля, які користувач хоче змінити
  // Зверніть увагу: якщо їх немає в req.body, то вони будуть undefined
  let { name, bio, relationship_type, selected_spokies } = req.body;

  // Якщо selected_spokies прийшло у вигляді масиву – серіалізуємо його; 
  // якщо рядок (JSON) – перевіряємо, чи він валідний. Інакше залишаємо його null/undefined.
  if (selected_spokies && typeof selected_spokies !== 'string') {
    // Якщо це вже масив, JSON-рядок зробимо тільки зараз
    if (Array.isArray(selected_spokies)) {
      selected_spokies = JSON.stringify(selected_spokies);
    }
  } else if (typeof selected_spokies === 'string') {
    try {
      // Якщо в тілі вже була строка, перевіримо: це валідний JSON?
      JSON.parse(selected_spokies);
      // якщо парсинг пройшов успішно — залишаємо як є
    } catch {
      // якщо строка некоректна – серіалізуємо її знову (щоб запобігти помилці)
      selected_spokies = JSON.stringify(selected_spokies);
    }
  }

  try {
    // 1) Спершу дізнаємося поточний запис із БД
    const existingUser = await userModel.getUserById(telegram_id);
    if (!existingUser) {
      console.warn(`⚠️ Не знайдено користувача для оновлення: ${telegram_id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // 2) Формуємо остаточні значення полів:
    //    Якщо в req.body ми отримали конкретне нове значення — беремо його,
    //    інакше використаємо старі (existingUser.<поле>)
    const finalName  = name  !== undefined ? name : existingUser.name;
    const finalBio   = bio   !== undefined ? bio  : existingUser.bio;
    const finalRelation = relationship_type !== undefined
                           ? relationship_type
                           : existingUser.relationship_type;
    const finalSpokies  = selected_spokies !== undefined
                           ? selected_spokies
                           : existingUser.selected_spokies;

    // 3) Викликаємо у userModel.updateUserFields вже з повним набором (усі 4 поля):
    await userModel.updateUserFields(telegram_id, {
      name: finalName,
      bio: finalBio,
      relationship_type: finalRelation,
      selected_spokies: finalSpokies
    });

    console.log(`✅ Профіль ${telegram_id} успішно оновлено`);
    return res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    console.error('❌ Помилка оновлення профілю:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
