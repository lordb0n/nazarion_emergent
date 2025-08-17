// src/pages/chat.js

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import { useAuth } from '../AuthContext';

const API_BASE = 'http://localhost:5000/api';

const ChatRoom = () => {
  const { chatId } = useParams();
  const { telegramId } = useAuth();
  const navigate = useNavigate();
  const chatBodyRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState(null);

  useEffect(() => {
    if (!chatId || !telegramId) return;

    fetch(`${API_BASE}/chats/${chatId}/messages?limit=50&offset=0`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => setMessages(data))
      .catch(err => console.error('❌ Failed to fetch messages:', err));

    fetch(`${API_BASE}/chats?userId=${telegramId}`)
      .then(res => res.json())
      .then(data => {
        const chat = data.find(c => String(c.chat_id) === String(chatId));
        if (chat) setOtherUserName(chat.other_username);
      })
      .catch(console.error);
  }, [chatId, telegramId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    fetch(`${API_BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: telegramId,
        content: trimmed,
        content_type: 'text'
      })
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(() => {
        setMessages(prev => [...prev, {
          sender_id: telegramId,
          sender_name: 'Ви',
          content: trimmed,
          created_at: new Date().toISOString(),
          is_read: false
        }]);
        setNewMessage('');
      })
      .catch(err => {
        console.error('❌ Не вдалося надіслати повідомлення:', err);
        alert('Помилка при надсиланні.');
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📎 Uploaded file:', file);
    }
  };

  const handleBubbleClick = (msgId) => {
    setActiveMessageMenuId(activeMessageMenuId === msgId ? null : msgId);
  };

  const handleMessageAction = (action, msgId) => {
    alert(`${action} для повідомлення ID ${msgId}`);
    setActiveMessageMenuId(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header-with-bg">
        <img src="/images/222.png" alt="Header" className="header-image" />
        <div className="header-overlay">
          <button className="back-button" onClick={() => navigate('/chats')}>←</button>
          <div className="chat-header-user">
            <img src="/images/avatar.png" alt="User avatar" className="chat-avatar" />
            <h2 className="header-username">{otherUserName || 'Чат'}</h2>
          </div>
          <span className="gora-token">50 000 GORA Token</span>
          <div className="chat-menu-trigger" onClick={() => setShowMenu(!showMenu)}>⋮</div>
          {showMenu && (
            <div className="chat-dropdown-menu">
              <div>Залишити чат</div>
              <div>Поскаржитись</div>
              <div className="highlight">Заблокувати</div>
              <div>Видалити історію</div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender_id === telegramId ? 'sent' : 'received'}`}
            onClick={() => handleBubbleClick(index)}
          >
            <div className="bubble-inner">
              <span className="bubble-text">{msg.content}</span>
              <div className="bubble-meta">
                <span className="bubble-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender_id === telegramId && (
                  <span className={`bubble-check ${msg.is_read ? 'read' : 'unread'}`}>✔</span>
                )}
              </div>
            </div>
            {activeMessageMenuId === index && (
              <div className="message-menu">
                <div className="message-menu-item" onClick={() => handleMessageAction('Відповісти', index)}>Відповісти</div>
                <div className="message-menu-item" onClick={() => handleMessageAction('Редагувати', index)}>Редагувати</div>
                <div className="message-menu-item" onClick={() => handleMessageAction('Видалити', index)}>Видалити</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-footer">
        <label className="chat-input-plus">
          <input type="file" onChange={handleFileUpload} hidden />
          <img src="/images/plus-icon.png" alt="Add" />
        </label>
        <input
          className="chat-input-field"
          type="text"
          placeholder="Напишіть повідомлення..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend} className="send-button">
          <img src="/images/send-icon.png" alt="Send" />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
