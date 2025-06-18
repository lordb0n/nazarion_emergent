import React, { useState, useEffect } from 'react';
import '../styles/likes.css';
import { BazaButton } from './button';
import { useAuth }   from '../AuthContext';
import { getLikeYou } from '../api/likeyouapi';
import { useNavigate } from 'react-router-dom';

const LikesPage = () => {
  const { telegramId } = useAuth();
  const [likers, setLikers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramId) return;
    setLoading(true);
    getLikeYou(telegramId)
      .then(list => {
        const unique = Array.from(
          new Map(list.map(u => [u.userId, u])).values()
        );
        setLikers(unique);
      })
      .catch(e => {
        console.error(e);
        setError('Не вдалося завантажити список.');
      })
      .finally(() => setLoading(false));
  }, [telegramId]);

  if (loading) return <p>Завантаження…</p>;
  if (error)   return <p>{error}</p>;

  return (
    <div className="likes-page-container">
      <div className="settings-header">
        <img src="/images/222.png" alt="Header" className="header-image" />
        <div className="header-overlay">
          <h1 className="settings-title">Хто лайкнув</h1>
          <div className="token-amount">50,000 GORA Token</div>
        </div>
      </div>

      <div className="likes-list">
        {likers.length === 0
          ? <p>Ніхто вас ще не лайкнув.</p>
          : likers.map(user => (
              <div
                key={user.userId}
                className="like-card"
                onClick={() => navigate(`/likes/${user.userid}`)}
              >
                <div className="avatar-circle">
                  {user.profile_photo?.[0]
                    ? <img src={user.profile_photo[0]} alt={user.name} />
                    : (user.name?.charAt(0).toUpperCase() || '?')}
                </div>
                <div className="like-info">
                  <h3>{user.name || 'Анонім'}</h3>
                  <p className="like-meta">
                    {user.age ?? '—'} років | {user.orientation || '—'} | {user.distance ? `${user.distance} км` : ''}
                  </p>
                  <p className="like-message">{user.bio || ''}</p>
                </div>
              </div>
            ))
        }
      </div>

      <BazaButton/>
    </div>
  );
};

export default LikesPage;
