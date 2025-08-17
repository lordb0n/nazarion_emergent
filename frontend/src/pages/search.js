// src/pages/search.js
import React, { useState, useEffect, useCallback } from 'react';
import { BazaButton } from './button';
import { useNavigate } from 'react-router-dom';
import '../styles/search.css';
import { getRecommendations, sendSwipe } from '../api/likeapi';
import { useAuth } from '../AuthContext';

const SearchMain = () => {
  const navigate = useNavigate();
  const { telegramId } = useAuth();

  // Локальний state (масив кандидатів і поточний індекс)
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 1) Функція, яка намагається завантажити кандидата(ів) із sessionStorage
  const loadFromSession = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('searchCandidates');
      const storedIndex = sessionStorage.getItem('searchCurrentIndex');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCandidates(parsed);
        if (storedIndex !== null) {
          setCurrentIndex(parseInt(storedIndex, 10));
        }
        return true; // дані взято з кешу, новий fetch не потрібен
      }
    } catch (e) {
      console.warn('Якщо sessionStorage не читається:', e);
    }
    return false;
  }, []);

  // 2) Функція, що робить запит на бекенд і відразу зберігає в sessionStorage
  const fetchRecommendationsAndSave = useCallback(async () => {
    if (!telegramId) return;
    setIsLoading(true);
    try {
      const data = await getRecommendations(telegramId);
      if (Array.isArray(data)) {
        setCandidates(data);
        setCurrentIndex(0);
        setPhotoIndex(0);
        // Зберігаємо масив і індекс у sessionStorage
        sessionStorage.setItem('searchCandidates', JSON.stringify(data));
        sessionStorage.setItem('searchCurrentIndex', '0');
      } else {
        setCandidates([]);
        sessionStorage.removeItem('searchCandidates');
        sessionStorage.removeItem('searchCurrentIndex');
      }
    } catch (error) {
      console.error('Помилка getRecommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [telegramId]);

  // 3) useEffect
  // При першому рендері (або коли змінюється telegramId) спочатку намагаємось завантажити з кешу,
  // якщо кеша немає — робимо fetchRecommendationsAndSave().
  useEffect(() => {
    if (!telegramId) return;
    const fromCache = loadFromSession();
    if (!fromCache) {
      fetchRecommendationsAndSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramId]);

  // 4) Обробка свайпу (лайк/дізлайк/суперлайк)
  const handleSwipe = async (action) => {
    const user = candidates[currentIndex];
    if (!user) return;

    try {
      await sendSwipe(telegramId, user.telegram_id, action);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= candidates.length) {
        // Якщо більше немає кандидатів — очищаємо кеш і підвантажуємо новий набір
        sessionStorage.removeItem('searchCandidates');
        sessionStorage.removeItem('searchCurrentIndex');
        await fetchRecommendationsAndSave();
      } else {
        // Інакше просто переходимо до наступного і зберігаємо новий індекс у кеш
        setCurrentIndex(nextIndex);
        setPhotoIndex(0);
        sessionStorage.setItem('searchCurrentIndex', nextIndex.toString());
      }
    } catch (err) {
      console.error('Помилка при відправленні свайпу:', err);
    }
  };

  const handleDislike = () => handleSwipe('dislike');
  const handleLike = () => handleSwipe('like');
  const handleSuperLike = () => handleSwipe('superlike');

  // 5) Якщо потрібно зробити ручне оновлення списку
  const handleRefresh = async () => {
    sessionStorage.removeItem('searchCandidates');
    sessionStorage.removeItem('searchCurrentIndex');
    await fetchRecommendationsAndSave();
  };

  // 6) Логіка перемикання фото
  const handleNextPhoto = () => {
    const user = candidates[currentIndex];
    if (!user?.profile_photo?.length) return;
    const photos = user.profile_photo;
    setPhotoIndex(prev => (prev + 1) % photos.length);
  };
  const handlePrevPhoto = () => {
    const user = candidates[currentIndex];
    if (!user?.profile_photo?.length) return;
    const photos = user.profile_photo;
    setPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  // Поточний кандидат і фото
  const currentUser = candidates[currentIndex];
  const photos = Array.isArray(currentUser?.profile_photo) ? currentUser.profile_photo : [];
  const photosCount = photos.length;

  return (
    <div className="search-container">
      {/** Інші елементи UI (шапка, панелі, тощо) */}
      <div className="photo-progress-bar">
        {photosCount > 0 && photos.map((_, idx) => (
          <div
            key={idx}
            className={`progress-step ${idx === photoIndex ? 'active' : ''}`}
          ></div>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-text">Завантаження...</div>
      ) : currentUser ? (
        <>
          <div className="image-container" style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '50%', height: '100%',
                cursor: 'pointer', zIndex: 2
              }}
              onClick={handlePrevPhoto}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '50%', height: '100%',
                cursor: 'pointer', zIndex: 2
              }}
              onClick={handleNextPhoto}
            />
            {photosCount > 0 ? (
              <img
                src={photos[photoIndex]}
                alt="Profile"
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#2e2e3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                Нема фотографії
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{currentUser.name || 'Анонім'}</h2>
            <p className="profile-details">
              {currentUser.age} років | {currentUser.orientation} | {currentUser.distance || '–'} км
            </p>
            <p className="profile-description" style={{ whiteSpace: 'normal' }}>
              {currentUser.bio || 'Тут можна додати опис...'}
            </p>
          </div>
        </>
      ) : (
        <div className="no-more-candidates">
          <h2>Нема більше профілів</h2>
          <button onClick={handleRefresh}>Оновити</button>
        </div>
      )}

      <div className="middle-nav">
        <button className="round-btn" onClick={handleRefresh}>
          <img src="/images/search-1.png" alt="Refresh" />
        </button>
        <button className="round-btn1" onClick={handleDislike}>
          <img src="/images/search-2.png" alt="Dislike" />
        </button>
        <button className="round-btn" onClick={handleLike}>
          <img src="/images/search-3.png" alt="Like" />
        </button>
        <button className="round-btn2" onClick={handleSuperLike}>
          <img src="/images/search-4.png" alt="SuperLike" />
        </button>
        <button className="round-btn0" onClick={() => { /* Flash logic */ }}>
          <img src="/images/search-5.png" alt="Flash" />
        </button>
      </div>

      <BazaButton />
    </div>
  );
};

export default SearchMain;
