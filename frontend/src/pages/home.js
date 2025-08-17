import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();

  // Автоматична перевірка при завантаженні компонента
  useEffect(() => {
    const telegramId = localStorage.getItem('telegram_id');
    if (telegramId) {
      // Якщо користувач уже зареєстрований, одразу редірект на профіль
      navigate('/profile-main');
    }
  }, [navigate]);
  const handleCreateProfile = () => {
    localStorage.setItem('visitedOnboarding', 'true');  // 💾 Фіксуємо, що користувач натиснув кнопку
    navigate('/onboarding');
  };

  return (
    <div className="home-container">
      {/* 🔥 Логотип */}
      <div className="logo-container">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Чоловічий символ" className="logo-male" />
          <img src="/images/logo-female.png" alt="Жіночий символ" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      {/* 📝 Головний слоган */}
      <h1 className="tagline">Бот для Ваших потаємних бажань</h1>

      {/* 🚀 Кнопка створення профілю */}
      <button className="create-profile-btn" onClick={handleCreateProfile}>
        СТВОРИТИ ПРОФІЛЬ
      </button>
    </div>
  );
};

export default Home;
