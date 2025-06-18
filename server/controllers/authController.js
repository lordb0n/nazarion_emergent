// server/controllers/authController.js
const path = require('path');
const userModel = require('../models/userModel');

exports.registerUser = async (req, res) => {
  try {
    console.log("🖼️ Отримані файли:", req.files);

    // З req.body зчитуємо:
    // - relationship_type (рядок, вид стосунків)
    // - selectedSpokies (масив ID спокус)
    // - інші поля (telegram_id, name, age, тощо)
    const {
      telegram_id,
      name,
      age,
      gender,
      orientation,
      interested_in,
      relationship_type, // ТУТ — вид стосунків (рядок)
      bio
    } = req.body;

    // Токени за замовчуванням
    const defaultTokens = 10;

    // Обробка фото (якщо завантажено)
    let profilePhotos = [];
    if (req.files && req.files.length > 0) {
      profilePhotos = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
      console.log("✅ Посилання на фото для запису в БД:", profilePhotos);
    } else {
      console.warn("⚠️ Файли не завантажені або відсутні.");
    }

    // Зчитуємо дані спокус (масив ID) окремо
    let selectedSpokiesJSON = null;
    if (req.body.selectedSpokies) {
      // Якщо selectedSpokies приходить масивом (наприклад, [1,2,3]),
      // робимо JSON-рядок ("[1,2,3]")
      selectedSpokiesJSON = JSON.stringify(req.body.selectedSpokies);
    } else {
      console.warn("⚠️ 'selectedSpokies' відсутнє у даних, буде null.");
    }

    // Якщо interested_in теж масив, робимо JSON
    let interestedJSON = null;
    if (interested_in) {
      interestedJSON = JSON.stringify(interested_in);
    }

    // Виклик функції createUser з userModel
    await userModel.createUser({
      telegram_id,
      name,
      age,
      gender,
      orientation,
      interested_in: interestedJSON,         // JSON-рядок, якщо масив
      relationship_type,                     // ВИД СТОСУНКІВ (рядок)
      selected_spokies: selectedSpokiesJSON, // СПОКУСИ (JSON-масив)
      profile_photo: JSON.stringify(profilePhotos),
      bio: bio || '',
      tokens: defaultTokens
    });

    console.log("✅ Користувача успішно зареєстровано!");
    res.status(201).json({ message: "Користувача зареєстровано успішно!", telegram_id });
  } catch (error) {
    console.error("❌ Помилка реєстрації користувача:", error);
    res.status(500).json({ error: "Не вдалося зареєструвати користувача." });
  }
};
