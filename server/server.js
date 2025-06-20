// server/server.js

const express  = require('express');
const dotenv   = require('dotenv');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const multer   = require('multer');

// контролери та роутери
const authController   = require('./controllers/authController');
const authRoutes       = require('./routes/authRoutes');
const profileRoutes    = require('./routes/profileRoutes');
const likeRoutes       = require('./routes/likeRoutes');
const likeyouRoutes    = require('./routes/likeyouRoutes');
const chatRoutes       = require('./routes/chatRoutes');

dotenv.config();
const app = express();

// ——————————————————————————————————————————————
// 1) Папка для завантажень
// ——————————————————————————————————————————————
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Папку `uploads/` створено!");
} else {
  console.log("📂 Папка `uploads/` вже існує.");
}
app.use('/uploads', express.static(uploadDir));

// ——————————————————————————————————————————————
// 2) CORS та парсинг body
// ——————————————————————————————————————————————
app.use(cors({
  origin: [ 'http://localhost:3000', process.env.RAILWAY_PUBLIC_DOMAIN ], 
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ——————————————————————————————————————————————
// 3) Multer для фото
// ——————————————————————————————————————————————
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ——————————————————————————————————————————————
// 4) Роут реєстрації (multipart/form-data)
// ——————————————————————————————————————————————
app.post(
  '/auth/register',
  upload.array('photos', 4),
  authController.registerUser
);

// ——————————————————————————————————————————————
// 5) Інші API-роути
// ——————————————————————————————————————————————
app.use('/auth',       authRoutes);
app.use('/profile',    profileRoutes);
app.use('/like',       likeRoutes);
app.use('/like/likeyou', likeyouRoutes);
app.use('/api/chats',  chatRoutes);

// ——————————————————————————————————————————————
// 6) Статичні файли фронтенду
//    (переданий React-білд має лежати в client/build)
// ——————————————————————————————————————————————
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// на всі інші GET-запити віддаємо index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ——————————————————————————————————————————————
// 7) Старт сервера
// ——————————————————————————————————————————————
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
