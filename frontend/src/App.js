import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import {
  Onboarding, OnboardingAge, OnboardingGender, OnboardingOrientation,
  OnboardingInterest, AddPhotos, SubscriptionPage, SpokySelection, SearchRegistr
} from './pages/onboarding';
import UserProfile from './pages/profile';
import { BazaButton } from './pages/button';
import SearchMain from './pages/search';
import Notification from './pages/notifications';

// Import chat components
import ChatList from './pages/chatlist';
import ChatRoom from './pages/chat';
import SocialPage from './pages/settings';
import { AuthProvider } from './AuthContext';
import LikesPage from './pages/likes';
import LikeYou from './pages/likeyou';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding-age" element={<OnboardingAge />} />
          <Route path="/onboarding-gender" element={<OnboardingGender />} />
          <Route path="/onboarding-orientation" element={<OnboardingOrientation />} />
          <Route path="/onboarding-interest" element={<OnboardingInterest />} />
          <Route path="/add-photos" element={<AddPhotos />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/spoky-selection" element={<SpokySelection />} />
          <Route path="/search-registr" element={<SearchRegistr />} />
          <Route path="/profile-main" element={<UserProfile />} />
          <Route path="/button" element={<BazaButton />} />
          <Route path="/search-main" element={<SearchMain />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
          <Route path="/settings" element={<SocialPage />} />
          <Route path="/likes" element={<LikesPage />} />
          <Route path="/likes/:userId" element={<LikeYou />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;