// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Існуючі контролери та маршрути
const authController   = require('./controllers/authController');
const authRoutes       = require('./routes/authRoutes');
const profileRoutes    = require('./routes/profileRoutes');
const likeRoutes       = require('./routes/likeRoutes');
const likeyouRoutes    = require('./routes/likeyouRoutes');
const chatRoutes       = require('./routes/chatRoutes');

dotenv.config();
const app = express();

// Перевірка/створення папки uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Папку `uploads/` створено!");
} else {
  console.log("📂 Папка `uploads/` вже існує.");
}
app.use('/uploads', express.static(uploadDir));

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS', 'PATCH'],
  credentials: true
}));

// Парсинг body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Налаштування multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Роут реєстрації
app.post(
  '/auth/register',
  upload.array('photos', 4),
  authController.registerUser
);

// Інші роутери
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/like', likeRoutes);
app.use('/like/likeyou', likeyouRoutes);
app.use('/api/chats', chatRoutes);



// Статичні файли фронтенду (якщо є)
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

