import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { BazaButton } from './button';
import { useNavigate } from 'react-router-dom';
import { getReceivedLikes } from '../api/api';
import '../styles/likes.css';

const LikesPage = () => {
  const { telegramId } = useAuth();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramId) {
      setError('Please log in through Telegram first.');
      setLoading(false);
      return;
    }

    const loadLikes = async () => {
      try {
        const data = await getReceivedLikes(telegramId);
        setLikes(data.likes || []);
      } catch (err) {
        setError(`Failed to load likes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadLikes();
  }, [telegramId]);

  const handleProfileClick = (userId) => {
    navigate(`/likes/${userId}`);
  };

  return (
    <div className="likes-page">
      {/* GORA Token Header */}
      <div className="gora-header">
        <span className="gora-token">50,000 GORA Token</span>
      </div>

      <div className="likes-header">
        <h1 className="likes-title">Who Liked You</h1>
      </div>

      <div className="likes-content">
        {loading && <p className="loading-text">Loading likes...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && likes.length === 0 && (
          <div className="no-likes">
            <p>No one has liked you yet.</p>
            <p>Keep swiping to find matches!</p>
          </div>
        )}
        {!loading && !error && likes.map(user => (
          <div
            key={user.user_id}
            className="like-item"
            onClick={() => handleProfileClick(user.user_id)}
          >
            <div className="like-avatar">
              {user.profile_photos && user.profile_photos.length > 0 ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${user.profile_photos[0]}`}
                  alt="Profile" 
                  className="like-avatar-img"
                />
              ) : (
                <div className="like-avatar-placeholder">
                  {(user.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="like-info">
              <h3 className="like-name">{user.name || 'Anonymous'}</h3>
              <p className="like-details">{user.age} years old</p>
              <p className="like-bio">{user.bio || 'No description available'}</p>
            </div>
            <div className="like-actions">
              <span className="view-profile">View Profile →</span>
            </div>
          </div>
        ))}
      </div>

      <BazaButton />
    </div>
  );
};

export default LikesPage;