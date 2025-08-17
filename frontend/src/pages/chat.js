import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import { useAuth } from '../AuthContext';
import { getChatMessages, sendMessage } from '../api/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !telegramId) return;

    const loadMessages = async () => {
      try {
        const data = await getChatMessages(chatId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('❌ Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    // TODO: Set up WebSocket or polling for real-time messages
  }, [chatId, telegramId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    try {
      const response = await sendMessage(chatId, trimmed, telegramId);
      
      // Add message to local state immediately for better UX
      const newMsg = {
        message_id: response.message_id,
        sender_id: telegramId,
        message: trimmed,
        timestamp: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📎 Uploaded file:', file);
      // TODO: Implement file upload functionality
    }
  };

  const handleBubbleClick = (msgId) => {
    setActiveMessageMenuId(activeMessageMenuId === msgId ? null : msgId);
  };

  const handleMessageAction = (action, msgId) => {
    alert(`${action} for message ID ${msgId}`);
    setActiveMessageMenuId(null);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/chats')}>←</button>
        <div className="chat-header-info">
          <div className="chat-avatar">
            <img src="/images/avatar.png" alt="User avatar" className="chat-avatar-img" />
          </div>
          <div className="chat-header-text">
            <h2 className="header-username">{otherUserName || 'Chat'}</h2>
            <span className="user-status">Online</span>
          </div>
        </div>
        <div className="gora-token">50,000 GORA Token</div>
        <div className="chat-menu-trigger" onClick={() => setShowMenu(!showMenu)}>⋮</div>
        {showMenu && (
          <div className="chat-dropdown-menu">
            <div>Leave Chat</div>
            <div>Report</div>
            <div className="highlight">Block</div>
            <div>Delete History</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-body" ref={chatBodyRef}>
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.message_id || index}
              className={`chat-bubble ${msg.sender_id === telegramId ? 'sent' : 'received'}`}
              onClick={() => handleBubbleClick(msg.message_id || index)}
            >
              <div className="bubble-inner">
                <span className="bubble-text">{msg.message}</span>
                <div className="bubble-meta">
                  <span className="bubble-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {msg.sender_id === telegramId && (
                    <span className={`bubble-check ${msg.is_read ? 'read' : 'unread'}`}>✔</span>
                  )}
                </div>
              </div>
              {activeMessageMenuId === (msg.message_id || index) && (
                <div className="message-menu">
                  <div className="message-menu-item" onClick={() => handleMessageAction('Reply', msg.message_id)}>Reply</div>
                  <div className="message-menu-item" onClick={() => handleMessageAction('Edit', msg.message_id)}>Edit</div>
                  <div className="message-menu-item" onClick={() => handleMessageAction('Delete', msg.message_id)}>Delete</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="chat-input-footer">
        <label className="chat-input-plus">
          <input type="file" onChange={handleFileUpload} hidden />
          <span className="plus-icon">+</span>
        </label>
        <input
          className="chat-input-field"
          type="text"
          placeholder="Write a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} className="send-button" disabled={!newMessage.trim()}>
          <span className="send-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;