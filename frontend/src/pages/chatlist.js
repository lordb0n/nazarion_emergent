import React, { useEffect, useState, useMemo } from 'react';
import '../styles/chatlist.css';
import { useAuth } from '../AuthContext';
import { BazaButton } from './button';
import { useNavigate } from 'react-router-dom';
import { getUserChats } from '../api/api';

const ChatList = () => {
  const { telegramId } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramId) {
      setError('Please log in through Telegram first.');
      setLoading(false);
      return;
    }

    const loadChats = async () => {
      try {
        const data = await getUserChats(telegramId);
        setChats(data.chats || []);
      } catch (err) {
        setError(`Failed to load chats: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [telegramId]);

  const openChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const filteredChats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter(c =>
      (c.participant_name || '').toLowerCase().includes(term) ||
      (c.last_message || '').toLowerCase().includes(term)
    );
  }, [searchTerm, chats]);

  return (
    <div className="chat-list-page">
      {/* GORA Token Header */}
      <div className="gora-header">
        <span className="gora-token">50,000 GORA Token</span>
      </div>

      <div className="chat-header">
        <h1 className="chat-title">Your Chats</h1>
      </div>

      <div className="chat-search-container">
        <input
          className="chat-search-input"
          type="text"
          placeholder="🔍 Search chats..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="chat-list-content">
        {loading && <p className="loading-text">Loading chats...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && filteredChats.length === 0 && (
          <p className="no-chats-text">
            {chats.length
              ? 'No chats found for your search.'
              : 'You don\'t have any chats yet.'}
          </p>
        )}
        {!loading && !error && filteredChats.map(chat => (
          <div
            key={chat.chat_id}
            className="chat-list-item"
            onClick={() => openChat(chat.chat_id)}
          >
            <div className="chat-avatar">
              {chat.participant_photo ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${chat.participant_photo}`} 
                  alt="Profile" 
                  className="chat-avatar-img"
                />
              ) : (
                <div className="chat-avatar-placeholder">
                  {(chat.participant_name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="chat-info">
              <div className="chat-name-time">
                <span className="chat-name">{chat.participant_name || 'Anonymous'}</span>
                <span className="chat-time">
                  {chat.last_message_time
                    ? new Date(chat.last_message_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : ''}
                </span>
              </div>
              <div className="chat-last-message">
                {chat.last_message || 'No messages yet'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BazaButton />
    </div>
  );
};

export default ChatList;