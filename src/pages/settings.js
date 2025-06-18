import React, { useState, useEffect } from 'react';
import { BazaButton } from './button';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import '../styles/settings.css';

const Settings = () => {
  const { telegramId } = useAuth();
  const [userName, setUserName] = useState('');
  const [userTokens, setUserTokens] = useState(0); // Стан для кількості токенів
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Укр");

  // Стан для підписок
  const [currentSubscription, setCurrentSubscription] = useState({
    name: "Безкінечні лайки",
    price: "5$"
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const subscriptionOptions = [
    { id: 1, name: "Безкінечні лайки", price: "10$" },
    { id: 2, name: "Безкінечні лайки", price: "15$" },
  ];

  // Завантаження поточного імені + токенів з БД
  useEffect(() => {
    if (!telegramId) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/profile/${telegramId}`);
        if (res.data) {
          // Зчитуємо ім'я
          if (res.data.name) {
            setUserName(res.data.name);
          }
          // Зчитуємо токени (якщо вони є)
          if (typeof res.data.tokens === 'number') {
            setUserTokens(res.data.tokens);
          }
        }
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      }
    };
    fetchUser();
  }, [telegramId]);

  // Редагування імені
  const handleEditName = () => {
    setIsEditingName(true);
  };

// src/pages/settings.js
  const handleSaveName = async () => {
    // Валідація: мінімум 2 букви
    if (userName.length < 2) {
      alert("Ім'я повинно містити мінімум 2 букви");
      return;
    }
    try {
      // ▶ Зараз ми надсилаємо тільки поле { name: userName }
      await axios.put(`http://localhost:5000/profile/${telegramId}`, { name: userName });
      setIsEditingName(false);
    } catch (err) {
      console.error('Помилка оновлення імені:', err);
    }
  };


  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    }
  };

  // Дозволяємо лише букви
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-zА-Яа-яЁёІіЇїЄє]*$/.test(value)) {
      setUserName(value);
    }
  };

  // Тогл для показу/приховування варіантів підписки
  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  const handleOptionSelect = (option) => {
    setCurrentSubscription(option);
    setShowMoreOptions(false);
  };

  return (
    <div className="settings-page">
      {/* Шапка */}
      <div className="settings-header">
        <img src="/images/222.png" alt="Header" className="header-image" />
        <div className="header-overlay">
          <h1 className="settings-title">Налаштування</h1>
          {/* Відображаємо реальну кількість токенів */}
          <div className="token-amount">{userTokens} GORA Token</div>
        </div>
      </div>

      {/* Основний контент */}
      <div className="settings-content">
        {/* Блок: Загальні */}
        <section className="section-block">
          <h2>Загальні</h2>
          <div className="info-row">
            <span className="label">Акаунт</span>
            <span className="value account-name">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    className="name-input"
                    value={userName}
                    onChange={handleNameChange}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    pattern="^[A-Za-zА-Яа-яЁёІіЇїЄє]{2,}$"
                    title="Введіть лише букви, мінімум 2 символи"
                  />
                  <button className="save-name-btn" onClick={handleSaveName}>
                    Зберегти
                  </button>
                </>
              ) : (
                <>
                  {userName || 'Без імені'}
                  <span className="edit-icon" onClick={handleEditName}>
                    <img src="/images/pencil-pink.png" alt="Редагувати" className="pencil-icon" />
                  </span>
                </>
              )}
            </span>
          </div>

          <div className="info-row">
            <span className="label">Мова</span>
            <div className="language-options">
              <button
                className={`lang-btn ${selectedLanguage === "Укр" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Укр")}
              >
                Укр
              </button>
              <button
                className={`lang-btn ${selectedLanguage === "Рус" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Рус")}
              >
                Рус
              </button>
              <button
                className={`lang-btn ${selectedLanguage === "Eng" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Eng")}
              >
                Eng
              </button>
            </div>
          </div>
        </section>

        {/* Блок: Інформація */}
        <section className="section-block">
          <h2>Інформація</h2>
          <div className="info-link">Політика конфіденційності</div>
          <div className="info-link">Правила та умови</div>
          <div className="info-link">Тех підтримка</div>
        </section>

        {/* Блок: Підписка */}
        <section className="section-block">
          <h2 className="subscription-title">
            Підписка
            <button className="change-subscription" onClick={toggleMoreOptions}>
              Змінити
            </button>
          </h2>
          <div className="subscription-box">
            <span className="sub-name">{currentSubscription.name}</span>
            <span className="sub-price">{currentSubscription.price} тиждень</span>
          </div>
          {showMoreOptions && (
            <div className="subscription-options">
              {subscriptionOptions.map(option => (
                <div
                  key={option.id}
                  className="subscription-box"
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="sub-name">{option.name}</span>
                  <span className="sub-price">{option.price} тиждень</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Блок: Соц мережі */}
        <section className="section-block">
          <h2>Соц мережі</h2>
          <div className="social-icons">
            <div className="social-circle">
              <img src="/images/social1.png" alt="Social 1" className="social-icon" />
            </div>
            <div className="social-circle">
              <img src="/images/social2.png" alt="Social 2" className="social-icon" />
            </div>
            <div className="social-circle">
              <img src="/images/social3.png" alt="Social 3" className="social-icon" />
            </div>
            <div className="social-circle">
              <img src="/images/social4.png" alt="Social 4" className="social-icon" />
            </div>
            <div className="social-circle">
              <img src="/images/social5.png" alt="Social 5" className="social-icon" />
            </div>
          </div>
        </section>
      </div>

      {/* Нижня панель навігації */}
      <BazaButton />
    </div>
  );
};

export default Settings;
