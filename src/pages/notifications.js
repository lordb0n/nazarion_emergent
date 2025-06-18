// Import necessary React dependencies
import React, { useState } from 'react';
import '../styles/notifications.css'; // Import the CSS file for styling

const Notification = () => {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [currentMessage, setCurrentMessage] = useState(''); // State to store the current input text

  // Handle input change
  const handleInputChange = (event) => {
    setCurrentMessage(event.target.value);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (currentMessage.trim() !== '') {
      setMessages([...messages, { text: currentMessage, user: 'You' }]);
      setCurrentMessage('');
    }
  };

  // Handle key press for Enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Chat list section */}
      <div className="chat-list">
        <h2>Chats</h2>
        <ul>
          {/* Map through an array of chats */}
          {["John", "Anna", "Mike"].map((chat, index) => (
            <li key={index} className="chat-item">
              {chat}
            </li>
          ))}
        </ul>
      </div>

      {/* Single chat section */}
      <div className="chat-window">
        <div className="chat-header">Chat with John</div>
        <div className="chat-messages">
          {/* Display chat messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.user === 'You' ? 'sent' : 'received'}`}
            >
              <span>{message.text}</span>
            </div>
          ))}
        </div>

        {/* Message input and send button */}
        <div className="chat-input">
          <input
            type="text"
            value={currentMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
