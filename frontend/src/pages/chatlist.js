// src/pages/chatlist.js

import React, { useEffect, useState, useMemo } from 'react';
import '../styles/chatlist.css';
import { useAuth }    from '../AuthContext';
import { BazaButton } from './button';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const ChatList = () => {
  const { telegramId } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramId) {
      setError('Спочатку увійдіть через Telegram.');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/chats?userId=${telegramId}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => setChats(data))
      .catch(err => setError(`Не вдалося завантажити чати: ${err}`))
      .finally(() => setLoading(false));
  }, [telegramId]);

  const openChat = async (chatId) => {
    await fetch(`${API_BASE}/chats/${chatId}/read?userId=${telegramId}`, {
      method: 'PATCH'
    }).catch(console.error);

    navigate(`/chat/${chatId}`); // 🟢 внутрішній перехід на сторінку чату
  };

  const filteredChats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter(c =>
      c.other_username.toLowerCase().includes(term) ||
      (c.last_message || '').toLowerCase().includes(term)
    );
  }, [searchTerm, chats]);

  return (
    <div className="chat-list-page" style={{ paddingBottom: '70px' }}>
      <div className="settings-header">
        <img src="/images/222.png" alt="Чати" className="header-image" />
        <div className="header-overlay">
          <h1 className="settings-title">Ваші чати</h1>
        </div>
      </div>

      <div className="chat-search-container">
        <input
          className="chat-search-input"
          type="text"
          placeholder="🔍 Пошук чату…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="chat-list-content">
        {loading && <p className="loading-text">Завантаження чатів…</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && filteredChats.length === 0 && (
          <p className="no-chats-text">
            {chats.length
              ? 'Нічого не знайдено за вашим запитом.'
              : 'У вас ще немає чатів.'}
          </p>
        )}
        {!loading && !error && filteredChats.map(chat => {
          const isNew = chat.unread_count > 0 &&
                        chat.last_sender_id !== Number(telegramId);

          return (
            <div
              key={chat.chat_id}
              className={`chat-list-item ${chat.unread_count > 0 ? 'unread' : ''}`}
              onClick={() => openChat(chat.chat_id)}
            >
              <div className="chat-list-avatar">
                <span className={chat.is_online ? 'online-dot' : ''}>
                  {chat.other_username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="chat-list-info">
                <div className="chat-list-name-time">
                  <span className="chat-list-name">@{chat.other_username}</span>
                  <span className="chat-list-time">
                    {chat.last_message_time
                      ? new Date(chat.last_message_time)
                          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                <div className="chat-list-last-message">
                  {chat.last_message || 'Немає повідомлень'}
                </div>
              </div>

              {isNew && <span className="new-chat-indicator" />}
              {chat.unread_count > 0 && (
                <div className="chat-list-unread-badge">
                  {chat.unread_count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BazaButton />
    </div>
  );
};

export default ChatList;
