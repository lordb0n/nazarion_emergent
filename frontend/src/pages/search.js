import React, { useState, useEffect, useCallback } from 'react';
import { BazaButton } from './button';
import { useNavigate } from 'react-router-dom';
import '../styles/search.css';
import { searchUsers, sendLike } from '../api/api';
import { useAuth } from '../AuthContext';

const SearchMain = () => {
  const navigate = useNavigate();
  const { telegramId } = useAuth();

  // Local state for candidates and current index
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load recommendations from API
  const fetchRecommendations = useCallback(async () => {
    if (!telegramId) return;
    setIsLoading(true);
    try {
      const data = await searchUsers(telegramId, 0, 10);
      if (data.users && Array.isArray(data.users)) {
        setCandidates(data.users);
        setCurrentIndex(0);
        setPhotoIndex(0);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [telegramId]);

  // Load recommendations on component mount
  useEffect(() => {
    if (telegramId) {
      fetchRecommendations();
    }
  }, [telegramId, fetchRecommendations]);

  // Handle swipe actions (like/dislike/super_like)
  const handleSwipe = async (action) => {
    const user = candidates[currentIndex];
    if (!user) return;

    try {
      const response = await sendLike(telegramId, user.user_id, action);
      
      if (response.is_match) {
        alert('🎉 It\'s a match! You can now chat with this person.');
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= candidates.length) {
        // If no more candidates, fetch new ones
        await fetchRecommendations();
      } else {
        // Move to next candidate
        setCurrentIndex(nextIndex);
        setPhotoIndex(0);
      }
    } catch (err) {
      console.error('Error sending swipe:', err);
    }
  };

  const handleDislike = () => handleSwipe('dislike');
  const handleLike = () => handleSwipe('like');
  const handleSuperLike = () => handleSwipe('super_like');

  // Manual refresh
  const handleRefresh = () => {
    fetchRecommendations();
  };

  // Photo navigation
  const handleNextPhoto = () => {
    const user = candidates[currentIndex];
    if (!user?.profile_photos?.length) return;
    const photos = user.profile_photos;
    setPhotoIndex(prev => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    const user = candidates[currentIndex];
    if (!user?.profile_photos?.length) return;
    const photos = user.profile_photos;
    setPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  // Current user and photos
  const currentUser = candidates[currentIndex];
  const photos = Array.isArray(currentUser?.profile_photos) ? currentUser.profile_photos : [];
  const photosCount = photos.length;

  return (
    <div className="search-container">
      {/* GORA Token Header */}
      <div className="gora-header">
        <span className="gora-token">50,000 GORA Token</span>
      </div>

      {/* Photo progress bar */}
      <div className="photo-progress-bar">
        {photosCount > 0 && photos.map((_, idx) => (
          <div
            key={idx}
            className={`progress-step ${idx === photoIndex ? 'active' : ''}`}
          ></div>
        ))}
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-text">Loading...</div>
        </div>
      ) : currentUser ? (
        <>
          <div className="image-container">
            {/* Navigation areas for photo switching */}
            <div
              className="photo-nav-left"
              onClick={handlePrevPhoto}
            />
            <div
              className="photo-nav-right"
              onClick={handleNextPhoto}
            />
            
            {photosCount > 0 ? (
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${photos[photoIndex]}`}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <div className="no-photo">
                No Photo Available
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{currentUser.name || 'Anonymous'}</h2>
            <p className="profile-details">
              {currentUser.age} years old
            </p>
            <p className="profile-description">
              {currentUser.bio || 'No description available...'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="action-btn refresh-btn" onClick={handleRefresh}>
              <img src="/images/refresh.png" alt="Refresh" />
            </button>
            <button className="action-btn dislike-btn" onClick={handleDislike}>
              <img src="/images/dislike.png" alt="Dislike" />
            </button>
            <button className="action-btn superlike-btn" onClick={handleSuperLike}>
              <img src="/images/superlike.png" alt="Super Like" />
            </button>
            <button className="action-btn like-btn" onClick={handleLike}>
              <img src="/images/like.png" alt="Like" />
            </button>
          </div>
        </>
      ) : (
        <div className="no-candidates">
          <h2>No more profiles</h2>
          <p>Check back later for new people to meet!</p>
          <button className="refresh-button" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      )}

      <BazaButton />
    </div>
  );
};

export default SearchMain;