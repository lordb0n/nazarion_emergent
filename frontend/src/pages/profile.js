import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { BazaButton } from './button';
import { getUserProfile, updateUserProfile } from '../api/api';
import '../styles/profile.css';

const UserProfile = () => {
  const { telegramId } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    age: 18
  });

  useEffect(() => {
    if (!telegramId) return;

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(telegramId);
        setUser(profile);
        setFormData({
          name: profile.name || '',
          bio: profile.bio || '',
          age: profile.age || 18
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [telegramId]);

  const handleSave = async () => {
    try {
      await updateUserProfile(telegramId, formData);
      setUser(prev => ({ ...prev, ...formData }));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      age: user?.age || 18
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="gora-token">50,000 GORA Token</div>
        <h1 className="profile-title">Profile</h1>
      </div>

      {/* Profile Photo Section */}
      <div className="profile-photo-section">
        <div className="profile-photos">
          {user.profile_photos && user.profile_photos.length > 0 ? (
            user.profile_photos.map((photo, index) => (
              <div key={index} className="profile-photo">
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${photo}`} 
                  alt={`Profile ${index + 1}`} 
                />
              </div>
            ))
          ) : (
            <div className="no-photos">No photos uploaded</div>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="profile-info-section">
        {editing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-age">{user.age} years old</p>
            <p className="profile-bio">{user.bio || 'No bio added yet'}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{user.tokens || 0}</span>
          <span className="stat-label">GORA Tokens</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.gender || 'Not specified'}</span>
          <span className="stat-label">Gender</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.orientation || 'Not specified'}</span>
          <span className="stat-label">Orientation</span>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="preferences-section">
        <h3>Preferences</h3>
        <div className="preference-item">
          <span>Interested in:</span>
          <span>{Array.isArray(user.interested_in) ? user.interested_in.join(', ') : 'Not specified'}</span>
        </div>
        <div className="preference-item">
          <span>Looking for:</span>
          <span>{Array.isArray(user.relationship_type) ? user.relationship_type.join(', ') : 'Not specified'}</span>
        </div>
      </div>

      <BazaButton />
    </div>
  );
};

export default UserProfile;