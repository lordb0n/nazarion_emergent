import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getUserProfile,createChat  } from '../api/likeyouapi';
import { BazaButton } from './button';
import '../styles/likeyou.css';

const ALL_SPOKIES = [
  { id: 1, src: "/images/spoky-1.png", title: "Обійми", description: "Дотик душі" },
  { id: 2, src: "/images/spoky-2.png", title: "Поцілунки", description: "Мова кохання" },
  { id: 3, src: "/images/spoky-3.png", title: "Масаж", description: "Магія рук" },
  { id: 4, src: "/images/spoky-4.png", title: "Футплей", description: "Вибирай в якому ритмі" },
  { id: 5, src: "/images/spoky-5.png", title: "Іграшки", description: "Інструменти радості" },
  { id: 6, src: "/images/spoky-6.png", title: "Оральний секс", description: "Ніжність губ" },
  { id: 7, src: "/images/spoky-7.png", title: "Домашнє відео", description: "Моя власна історія" },
  { id: 8, src: "/images/spoky-8.png", title: "Стриптиз", description: "Танець спокуси" },
  { id: 9, src: "/images/spoky-9.png", title: "Фантазії", description: "Світ уяви" },
  { id: 10, src: "/images/spoky-10.png", title: "Брудні розмови", description: "Вибирай в якому ритмі" },
  { id: 11, src: "/images/spoky-11.png", title: "Інтелект", description: "Розум - найкраща прелюдія" },
  { id: 12, src: "/images/spoky-12.png", title: "Секстинг", description: "Технології бажання" },
  { id: 13, src: "/images/spoky-13.png", title: "Фемдом", description: "Сила у витонченості" },
  { id: 14, src: "/images/spoky-14.png", title: "Спанкінг", description: "Удар задоволення" },
  { id: 15, src: "/images/spoky-15.png", title: "Домінування", description: "Я — твій господар" },
  { id: 16, src: "/images/spoky-16.png", title: "Підпорядкування", description: "Солодкий смак контролю" },
  { id: 17, src: "/images/spoky-17.png", title: "Свічки", description: "Зміна ролей" },
  { id: 18, src: "/images/spoky-18.png", title: "Гік вайб", description: "Чарівні дивізатива" },
  { id: 19, src: "/images/spoky-19.png", title: "Куколд", description: "Інший погляд на задоволення" },
  { id: 20, src: "/images/spoky-20.png", title: "Ігри з воском", description: "Тепло пристрасті" },
  { id: 21, src: "/images/spoky-21.png", title: "Рольові ігри", description: "Втілення фантазій" },
  { id: 22, src: "/images/spoky-22.png", title: "Позашлюб", description: "Таємна позиція" },
  { id: 23, src: "/images/spoky-23.png", title: "Еджинг", description: "Мистецтво стриманості" },
  { id: 24, src: "/images/spoky-24.png", title: "Вспілку", description: "Темрява відкриває" },
  { id: 25, src: "/images/spoky-25.png", title: "Шоколад", description: "Солодка спокуса" },
  { id: 26, src: "/images/spoky-26.png", title: "Тату & Пірсинг", description: "Знакове тіло" },
  { id: 27, src: "/images/spoky-27.png", title: "Свінг", description: "Обмін емоціями" },
  { id: 28, src: "/images/spoky-28.png", title: "Ваніль", description: "Класика у простоті" },
];

const LikeYou = () => {
  const { telegramId: currentUserId } = useAuth();
  const { userId } = useParams();       // Telegram ID співрозмовника
  const navigate = useNavigate();

  const [user, setUser]             = useState(null);
  const [userSpokies, setUserSpokies] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const BOT = process.env.REACT_APP_BOT_USERNAME; // без @

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserProfile(userId)
      .then(profile => {
        setUser(profile);
        let sp = profile.selected_spokies || [];
        if (typeof sp === 'string') {
          try { sp = JSON.parse(sp); } catch { sp = []; }
        }
        setUserSpokies(Array.isArray(sp) ? sp : []);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setError('Не вдалося завантажити профіль.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="loading">Завантаження профілю…</div>;
  if (error)   return <div className="error-message">{error}</div>;

  // Відкриває deep link з telegramId співрозмовника
  const handleSendMessage = async () => {
    try {
      // створити або отримати чат на бекенді
      const res = await createChat(currentUserId, Number(userId));
      const chatId = res.data.chat_id;
      // відкриваємо бот з chatId
      const link = `https://t.me/${BOT}?start=${chatId}`;
      window.open(link, '_blank');
    } catch (err) {
      console.error('Не вдалося створити/відкрити чат', err);
      alert('Не вдалося створити чат. Перевірте консоль.');
    }
  };

  return (
    <div className="likeyou-page-container">
      {/* 1. Шапка */}
      <div className="likeyou-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="likeyou-title">Профіль користувача</h1>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '50%' }} />
      </div>

      {/* 2. Фото */}
      <div className="likeyou-photo-container">
        {user.profile_photo?.length
          ? <img src={user.profile_photo[0]} alt={user.name} className="likeyou-photo" />
          : <div className="likeyou-photo default">No Photo</div>
        }
      </div>

      {/* 3. Інфо */}
      <div className="likeyou-info">
        <h2 className="likeyou-name">{user.name}</h2>
        <p className="likeyou-meta">
          {user.age ? `${user.age} років` : '— років'} | {user.orientation || '—'} | {user.distance ? `${user.distance} км` : '— км'}
        </p>
        <p className="likeyou-bio">{user.bio || 'Біографія відсутня.'}</p>
      </div>

      {/* 4. Спокуси */}
      <div className="likeyou-spokies-container">
        <h3 className="likeyou-spokies-title">Спокуси</h3>
        <div className="likeyou-spokies-list">
          {ALL_SPOKIES.filter(s => userSpokies.includes(s.id)).map(item => (
            <div key={item.id} className="likeyou-spoky-item">
              <img src={item.src} alt={item.title} className="likeyou-spoky-icon" />
              <span className="likeyou-spoky-text">{item.title}</span>
            </div>
          ))}
          {userSpokies.length === 0 && <p className="likeyou-no-spokies">Користувач не вибирав спокус.</p>}
        </div>
      </div>

      {/* 5. Дії */}
      <div className="likeyou-actions">
        <button className="likeyou-message-btn" onClick={handleSendMessage}>
          Написати повідомлення
        </button>
        <button className="likeyou-report-btn" onClick={() => setIsReportOpen(true)}>
          Report user
        </button>
      </div>

      {/* 6. Модалка репорту */}
      {isReportOpen && (
        <div className="report-modal-overlay" onClick={() => setIsReportOpen(false)}>
          <div className="report-modal-content" onClick={e => e.stopPropagation()}>
            {/* …форма репорту… */}
            <button onClick={() => setIsReportOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* 7. Нижня навігація */}
      <BazaButton />
    </div>
  );
};

export default LikeYou;
