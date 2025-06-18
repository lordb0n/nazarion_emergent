// src/pages/button.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";  // ← додаємо useLocation
import "../styles/button.css";

export const BazaButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Функція, що зіставляє поточний шлях імені кнопки
  const getActiveFromPath = (path) => {
    if (path.startsWith("/settings"))    return "settings";
    if (path.startsWith("/likes"))       return "likes";
    if (path.startsWith("/search-main")) return "heart";
    if (path.startsWith("/chats"))       return "chat";
    if (path.startsWith("/profile-main"))return "profile";
    return ""; 
  };

  const activeBottomButton = getActiveFromPath(location.pathname);

  // Навігація при кліку
  const handleBottomClick = (buttonName) => {
    // тільки навігація — стан активної кнопки тепер бере з URL
    switch (buttonName) {
      case "settings":    return navigate("/settings");
      case "likes":       return navigate("/likes");
      case "heart":       return navigate("/search-main");
      case "chat":        return navigate("/chats");
      case "profile":     return navigate("/profile-main");
    }
  };

  return (
    <div className="bottom-nav">
      <button
        className={`nav-btn ${activeBottomButton === "settings" ? "active" : ""}`}
        onClick={() => handleBottomClick("settings")}
      >
        <img src="/images/baza-1.png" alt="Settings" />
      </button>
      <button
        className={`nav-btn ${activeBottomButton === "likes" ? "active" : ""}`}
        onClick={() => handleBottomClick("likes")}
      >
        <img src="/images/baza-2.png" alt="Likes" />
      </button>
      <button
        className={`nav-btn ${activeBottomButton === "heart" ? "active" : ""}`}
        onClick={() => handleBottomClick("heart")}
      >
        <img src="/images/baza-3.png" alt="Heart" />
      </button>
      <button
        className={`nav-btn ${activeBottomButton === "chat" ? "active" : ""}`}
        onClick={() => handleBottomClick("chat")}
      >
        <img src="/images/baza-4.png" alt="Chat" />
      </button>
      <button
        className={`nav-btn ${activeBottomButton === "profile" ? "active" : ""}`}
        onClick={() => handleBottomClick("profile")}
      >
        <img src="/images/baza-5.png" alt="Profile" />
      </button>
    </div>
  );
};
