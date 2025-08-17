import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getUserProfile } from '../api/api';
import { BazaButton } from './button';
import '../styles/likeyou.css';

const ALL_SPOKIES = [
  { id: 1, src: "/images/spoky-1.png", title: "Hugs", description: "Touch of the soul" },
  { id: 2, src: "/images/spoky-2.png", title: "Kisses", description: "Language of love" },
  { id: 3, src: "/images/spoky-3.png", title: "Massage", description: "Magic of hands" },
  { id: 4, src: "/images/spoky-4.png", title: "Foreplay", description: "Choose your rhythm" },
  { id: 5, src: "/images/spoky-5.png", title: "Toys", description: "Tools of joy" },
  { id: 6, src: "/images/spoky-6.png", title: "Oral Sex", description: "Tenderness of lips" },
  { id: 7, src: "/images/spoky-7.png", title: "Home Video", description: "My own story" },
  { id: 8, src: "/images/spoky-8.png", title: "Striptease", description: "Dance of temptation" },
  { id: 9, src: "/images/spoky-9.png", title: "Fantasies", description: "World of imagination" },
  { id: 10, src: "/images/spoky-10.png", title: "Dirty Talk", description: "Choose your rhythm" },
  { id: 11, src: "/images/spoky-11.png", title: "Intelligence", description: "Mind is the best foreplay" },
  { id: 12, src: "/images/spoky-12.png", title: "Sexting", description: "Technology of desire" },
  { id: 13, src: "/images/spoky-13.png", title: "Femdom", description: "Power in refinement" },
  { id: 14, src: "/images/spoky-14.png", title: "Spanking", description: "Strike of pleasure" },
  { id: 15, src: "/images/spoky-15.png", title: "Domination", description: "I am your master" },
  { id: 16, src: "/images/spoky-16.png", title: "Submission", description: "Sweet taste of control" },
  { id: 17, src: "/images/spoky-17.png", title: "Candles", description: "Role change" },
  { id: 18, src: "/images/spoky-18.png", title: "Geek Vibe", description: "Charming diversions" },
  { id: 19, src: "/images/spoky-19.png", title: "Cuckold", description: "Another view of pleasure" },
  { id: 20, src: "/images/spoky-20.png", title: "Wax Play", description: "Heat of passion" },
  { id: 21, src: "/images/spoky-21.png", title: "Role Play", description: "Embodiment of fantasies" },
  { id: 22, src: "/images/spoky-22.png", title: "Extramarital", description: "Secret position" },
  { id: 23, src: "/images/spoky-23.png", title: "Edging", description: "Art of restraint" },
  { id: 24, src: "/images/spoky-24.png", title: "Together", description: "Darkness reveals" },
  { id: 25, src: "/images/spoky-25.png", title: "Chocolate", description: "Sweet temptation" },
  { id: 26, src: "/images/spoky-26.png", title: "Tattoo & Piercing", description: "Marked body" },
  { id: 27, src: "/images/spoky-27.png", title: "Swinging", description: "Exchange of emotions" },
  { id: 28, src: "/images/spoky-28.png", title: "Vanilla", description: "Classic in simplicity" },
];

const LikeYou = () => {
  const { telegramId: currentUserId } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userSpokies, setUserSpokies] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        setUser(profile);
        
        let sp = profile.selected_spokies || [];
        if (typeof sp === 'string') {
          try { sp = JSON.parse(sp); } catch { sp = []; }
        }
        setUserSpokies(Array.isArray(sp) ? sp : []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="error-message">User not found</div>;

  const handleSendMessage = () => {
    // TODO: Create chat and navigate to it
    alert('Chat functionality will be implemented');
  };

  const handleReport = () => {
    setIsReportOpen(false);
    alert('Report submitted');
  };

  return (
    <div className="likeyou-page-container">
      {/* Header */}
      <div className="likeyou-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="likeyou-title">User Profile</h1>
        <div className="gora-token">50,000 GORA Token</div>
      </div>

      {/* Photo */}
      <div className="likeyou-photo-container">
        {user.profile_photos?.length ? (
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL}${user.profile_photos[0]}`} 
            alt={user.name} 
            className="likeyou-photo" 
          />
        ) : (
          <div className="likeyou-photo default">No Photo</div>
        )}
      </div>

      {/* User Info */}
      <div className="likeyou-info">
        <h2 className="likeyou-name">{user.name}</h2>
        <p className="likeyou-meta">
          {user.age ? `${user.age} years old` : '— years'} | {user.orientation || '—'} | {user.distance ? `${user.distance} km` : '— km'}
        </p>
        <p className="likeyou-bio">{user.bio || 'No biography available.'}</p>
      </div>

      {/* Spokies */}
      <div className="likeyou-spokies-container">
        <h3 className="likeyou-spokies-title">Interests</h3>
        <div className="likeyou-spokies-list">
          {ALL_SPOKIES.filter(s => userSpokies.includes(s.id)).map(item => (
            <div key={item.id} className="likeyou-spoky-item">
              <img src={item.src} alt={item.title} className="likeyou-spoky-icon" />
              <span className="likeyou-spoky-text">{item.title}</span>
            </div>
          ))}
          {userSpokies.length === 0 && (
            <p className="likeyou-no-spokies">User hasn't selected any interests.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="likeyou-actions">
        <button className="likeyou-message-btn" onClick={handleSendMessage}>
          Send Message
        </button>
        <button className="likeyou-report-btn" onClick={() => setIsReportOpen(true)}>
          Report User
        </button>
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="report-modal-overlay" onClick={() => setIsReportOpen(false)}>
          <div className="report-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Report User</h3>
            <div className="report-reasons">
              <button onClick={handleReport}>Inappropriate content</button>
              <button onClick={handleReport}>Fake profile</button>
              <button onClick={handleReport}>Harassment</button>
              <button onClick={handleReport}>Spam</button>
              <button onClick={handleReport}>Other</button>
            </div>
            <button className="close-modal" onClick={() => setIsReportOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <BazaButton />
    </div>
  );
};

export default LikeYou;