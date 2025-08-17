// src/pages/profile.js
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../api/api';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import '../styles/profile.css';
import { BazaButton } from './button'; // Імпорт нижньої навігації


// Локальний масив спокус
const spokyItems = [
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

const UserProfile = () => {
  const { telegramId } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Поля для редагування
  const [bio, setBio] = useState('');
  // Це ТІЛЬКИ «види стосунків» (один з варіантів)
  const [relationshipType, setRelationshipType] = useState("Без зобов’язань");
  // Окреме поле для спокус (масив id)
  const [selectedSpokies, setSelectedSpokies] = useState([]);

  const [needsSave, setNeedsSave] = useState(false);

  // Стан для модального вікна перегляду фото
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Завантаження профілю з БД
  useEffect(() => {
    if (!telegramId) {
      console.error("❌ 'telegramId' не знайдено");
      setError("Не знайдено ваш ID");
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile(telegramId);
        if (!userData) {
          setError("Користувача не знайдено");
          return;
        }

        // Парсимо поле profile_photo (JSON)
        let photos = userData.profile_photo;
        if (photos && typeof photos === 'string') {
          try {
            photos = JSON.parse(photos);
          } catch (err) {
            console.error("Помилка парсингу profile_photo:", err);
          }
        }

        // Зчитуємо звичайне поле relationship_type (рядок)
        const relType = userData.relationship_type || "Без зобов’язань";

        // Парсимо selected_spokies (JSON-масив)
        let spokies = [];
        if (userData.selected_spokies && typeof userData.selected_spokies === 'string') {
          try {
            spokies = JSON.parse(userData.selected_spokies);
          } catch (err) {
            console.error("Помилка парсингу selected_spokies:", err);
          }
        }

        setUser({ ...userData, profile_photo: photos });
        setBio(userData.bio || '');
        setRelationshipType(relType);
        setSelectedSpokies(spokies);
      } catch (error) {
        console.error("❌ Помилка завантаження профілю:", error);
        setError("Не вдалося завантажити профіль");
      }
    };
    fetchUserProfile();
  }, [telegramId]);

  // Debounce збереження – 3 секунди після останньої зміни
  useEffect(() => {
    if (!needsSave) return;
    const timeoutId = setTimeout(() => {
      handleSaveProfile();
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [bio, relationshipType, selectedSpokies, needsSave]);

  // Зміна біографії
  const handleBioChange = (e) => {
    setBio(e.target.value);
    setNeedsSave(true);
  };

  // Зміна «видів стосунків»
  const handleRelationshipChange = (e) => {
    setRelationshipType(e.target.value);
    setNeedsSave(true);
  };

  // Тогл «спокуси»
  const toggleSpoky = (id) => {
    setSelectedSpokies((prev) =>
      prev.includes(id)
        ? prev.filter((spokyId) => spokyId !== id)
        : [...prev, id]
    );
    setNeedsSave(true);
  };

  // Збереження профілю (відправляємо 2 поля: relationship_type і selected_spokies)
  const handleSaveProfile = async () => {
    try {
      const updatedData = {
        bio,
        relationship_type: relationshipType,          // Рядок, напр. "Без зобов’язань"
        selected_spokies: JSON.stringify(selectedSpokies) // JSON-масив ідентифікаторів
      };

      await axios.put(`http://localhost:5000/profile/${telegramId}`, updatedData);
      console.log("✅ Профіль оновлено!", updatedData);
      setNeedsSave(false);
    } catch (err) {
      console.error("❌ Помилка збереження профілю:", err);
    }
  };

  // === Модальне вікно перегляду фото ===
  const openModal = (index) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleNextPhoto = () => {
    if (!user || !user.profile_photo) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % user.profile_photo.length);
  };
  const handlePrevPhoto = () => {
    if (!user || !user.profile_photo) return;
    setCurrentPhotoIndex((prev) =>
      (prev - 1 + user.profile_photo.length) % user.profile_photo.length
    );
  };

  if (error) return <p className="error-text">{error}</p>;
  if (!user) return <p className="loading-text">Завантаження профілю...</p>;

  // ====== РОЗМІТКА ======
  return (
    <div className="profile-container">
      {/* Верхня панель з токенами */}
      <div className="profile-top">
        <div className="gora-token">10 GORA Token</div>

      </div>
      <div className="logo-photo">
          <img src="/images/background-image.png" alt="Background" />
        </div>
        
      <div className="profile-header">

        <div className="profile-image-container">
          {/* Головне фото (перше) у збільшеному колі */}
          {user.profile_photo && user.profile_photo.length > 0 ? (
            <div className="main-photo-wrapper">
              <img
                src={user.profile_photo[0]}
                alt="Main Photo"
                className="main-photo-circle"
                onClick={() => openModal(0)} // Клік -> модальне вікно
              />
            </div>
          ) : (
            <img
              src="/images/default-profile.png"
              alt="Default"
              className="main-photo-circle"
            />
          )}
        </div>

        <h1 className="profile-name">{user.name || "Невідомий користувач"}</h1>
        <p className="profile-details">
          {user.age ? `${user.age} років` : "Вік не вказаний"} |{" "}
          {user.orientation || "Орієнтація не вказана"} | 2 км
        </p>
      </div>

      <div className="profile-content">
        <textarea
          maxLength={300}
          placeholder="Введіть свою біографію (до 300 символів)"
          className="bio-input"
          value={bio}
          onChange={handleBioChange}
        />

        {/* Select для вибору виду стосунків */}
        <select
          className="relationship-select"
          value={relationshipType}
          onChange={handleRelationshipChange}
        >
          <option value="Без зобов’язань">Без зобов’язань</option>
          <option value="Серйозні наміри">Серйозні наміри</option>
          <option value="Вірт">Вірт</option>
          <option value="Все і одразу">Все і одразу</option>
        </select>

        <div className="spoky-grid">
          {spokyItems.map((item) => {
            const isSelected = selectedSpokies.includes(item.id);
            return (
              <div
                key={item.id}
                className={`spoky-item ${isSelected ? "selected" : ""}`}
                onClick={() => toggleSpoky(item.id)}
              >
                <div className="spoky-image-container1">
                  <img
                    src={item.src}
                    alt={item.title}
                    className={`spoky-image ${isSelected ? "image-selected" : ""}`}
                  />
                </div>
                <p className="spoky-title">{item.title}</p>
                <p className="spoky-description">{item.description}</p>
                
              </div>
            );
          })}
                <BazaButton />

        </div>
      </div>

      {/* Модальне вікно перегляду фото */}
      {isModalOpen && user.profile_photo && user.profile_photo.length > 0 && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={user.profile_photo[currentPhotoIndex]}
              alt="Modal Photo"
              className="modal-photo"
            />

            {/* Індикатор "N / M" */}
            <div className="photo-progress">
              {currentPhotoIndex + 1} / {user.profile_photo.length}
            </div>

            {/* Якщо більше 1 фото, додаємо кнопки */}
            {user.profile_photo.length > 1 && (
              <>
                <button className="modal-nav-btn prev-btn" onClick={handlePrevPhoto}>
                  &lt;
                </button>
                <button className="modal-nav-btn next-btn" onClick={handleNextPhoto}>
                  &gt;
                </button>
              </>
            )}

            <button className="close-modal-btn" onClick={closeModal}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
