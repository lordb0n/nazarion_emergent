import React, { useState, useEffect } from 'react';
import { BazaButton } from './button';
import { useAuth } from '../AuthContext';
import { getUserProfile, updateUserProfile } from '../api/api';
import '../styles/settings.css';

const Settings = () => {
  const { telegramId } = useAuth();
  const [userName, setUserName] = useState('');
  const [userTokens, setUserTokens] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Eng");
  const [loading, setLoading] = useState(true);

  // Subscription state
  const [currentSubscription, setCurrentSubscription] = useState({
    name: "Unlimited Likes",
    price: "$5"
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const subscriptionOptions = [
    { id: 1, name: "Unlimited Likes", price: "$10" },
    { id: 2, name: "Premium Features", price: "$15" },
    { id: 3, name: "VIP Access", price: "$25" }
  ];

  // Load current user data
  useEffect(() => {
    if (!telegramId) return;
    
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile(telegramId);
        if (profile) {
          setUserName(profile.name || '');
          setUserTokens(profile.tokens || 0);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [telegramId]);

  // Name editing handlers
  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (userName.length < 2) {
      alert("Name must contain at least 2 characters");
      return;
    }
    
    try {
      await updateUserProfile(telegramId, { name: userName });
      setIsEditingName(false);
      alert('Name updated successfully!');
    } catch (err) {
      console.error('Error updating name:', err);
      alert('Failed to update name');
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setUserName(value);
    }
  };

  // Subscription handlers
  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  const handleOptionSelect = (option) => {
    setCurrentSubscription(option);
    setShowMoreOptions(false);
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="gora-token">{userTokens} GORA Token</div>
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-content">
        {/* General Section */}
        <section className="section-block">
          <h2>General</h2>
          <div className="info-row">
            <span className="label">Account</span>
            <span className="value account-name">
              {isEditingName ? (
                <div className="edit-name-container">
                  <input
                    type="text"
                    className="name-input"
                    value={userName}
                    onChange={handleNameChange}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    placeholder="Enter your name"
                  />
                  <button className="save-name-btn" onClick={handleSaveName}>
                    Save
                  </button>
                  <button className="cancel-name-btn" onClick={() => setIsEditingName(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="name-display">
                  <span>{userName || 'No name set'}</span>
                  <button className="edit-icon" onClick={handleEditName}>
                    ✏️
                  </button>
                </div>
              )}
            </span>
          </div>

          <div className="info-row">
            <span className="label">Language</span>
            <div className="language-options">
              <button
                className={`lang-btn ${selectedLanguage === "Eng" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Eng")}
              >
                Eng
              </button>
              <button
                className={`lang-btn ${selectedLanguage === "Ukr" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Ukr")}
              >
                Укр
              </button>
              <button
                className={`lang-btn ${selectedLanguage === "Rus" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("Rus")}
              >
                Рус
              </button>
            </div>
          </div>
        </section>

        {/* Information Section */}
        <section className="section-block">
          <h2>Information</h2>
          <div className="info-link">Privacy Policy</div>
          <div className="info-link">Terms and Conditions</div>
          <div className="info-link">Technical Support</div>
        </section>

        {/* Subscription Section */}
        <section className="section-block">
          <h2 className="subscription-title">
            Subscription
            <button className="change-subscription" onClick={toggleMoreOptions}>
              Change
            </button>
          </h2>
          <div className="subscription-box">
            <span className="sub-name">{currentSubscription.name}</span>
            <span className="sub-price">{currentSubscription.price} / week</span>
          </div>
          {showMoreOptions && (
            <div className="subscription-options">
              {subscriptionOptions.map(option => (
                <div
                  key={option.id}
                  className="subscription-box clickable"
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="sub-name">{option.name}</span>
                  <span className="sub-price">{option.price} / week</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Social Networks Section */}
        <section className="section-block">
          <h2>Social Networks</h2>
          <div className="social-icons">
            <a href="#" className="social-circle">
              <span className="social-icon">📷</span>
            </a>
            <a href="#" className="social-circle">
              <span className="social-icon">📱</span>
            </a>
            <a href="#" className="social-circle">
              <span className="social-icon">🎵</span>
            </a>
            <a href="#" className="social-circle">
              <span className="social-icon">🐦</span>
            </a>
            <a href="#" className="social-circle">
              <span className="social-icon">💬</span>
            </a>
          </div>
        </section>
      </div>

      <BazaButton />
    </div>
  );
};

export default Settings;