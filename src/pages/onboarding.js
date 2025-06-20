// src/pages/onboarding.js
import React, { useState, useRef } from 'react'; // Додано useRef
import { useNavigate } from 'react-router-dom';
import '../styles/onboarding.css'; // Підключаємо стилі
import { useEffect } from 'react';
import axios from 'axios';
import { registerUser } from "../api/api"; // Імпортуємо функцію для реєстрації
import { useAuth } from '../AuthContext'; // ✅ Додаємо глобальний контекст


export const Onboarding = () => {
  const [userName, setUserName] = useState(''); 
  const navigate = useNavigate();               

  const isValidName = (name) => {
    const nameRegex = /^[A-Za-zА-Яа-яЁёІіЇїЄє']{2,}$/;
    return nameRegex.test(name.trim());
  };

  const handleNextStep = () => {
    if (isValidName(userName)) {
      localStorage.setItem('userName', userName);  
      navigate('/onboarding-age');                
    } else {
      alert("Ім'я повинно містити тільки літери і бути довжиною не менше 2 символів");
    }
  };

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Давай знайомитися</h1>
      <p className="onboarding-subheading">Як тебе звуть?</p>

      <input 
        type="text" 
        className="onboarding-input" 
        placeholder="Введіть своє ім'я" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}  
      />

      <button className="onboarding-btn" onClick={handleNextStep}>ДАЛІ</button>

      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar-step ${index === 0 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const OnboardingAge = () => {
  const [userAge, setUserAge] = useState('');  
  const navigate = useNavigate();             

  const isValidAge = (age) => {
    const ageNumber = parseInt(age, 10);
    return !isNaN(ageNumber) && ageNumber >= 18 && ageNumber <= 100;  
  };

  const handleNextStep = () => {
    if (isValidAge(userAge)) {
      localStorage.setItem('userAge', userAge);  
      navigate('/onboarding-gender');           
    } else {
      alert('Вік повинен бути від 18 до 100 років');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Скільки тобі років?</h1>
      <p className="onboarding-subheading">Введіть свій вік</p>

      <input 
        type="number" 
        className="onboarding-input" 
        placeholder="Введіть свій вік" 
        value={userAge}
        onChange={(e) => setUserAge(e.target.value)}  
      />

      <button className="onboarding-btn" onClick={handleNextStep}>ДАЛІ</button>

      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar-step ${index <= 1 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const OnboardingGender = () => {
  const [selectedGender, setSelectedGender] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);  

  const genderOptions = [
    { value: 'male', label: 'Чоловік' },
    { value: 'female', label: 'Жінка' },
    { value: 'couple', label: 'Пари' },
    { value: 'nonbinary', label: 'Небінарні' }
  ];

  const handleNextStep = () => {
    if (selectedGender) {
      localStorage.setItem('userGender', selectedGender);  
      navigate('/onboarding-orientation');
    } else {
      alert('Будь ласка, оберіть свою стать');
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleOptionSelect = (value) => {
    setSelectedGender(value);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Обери свою стать</h1>
      <p className="onboarding-subheading">Виберіть свою стать</p>

      <div className="custom-select-container" ref={dropdownRef}>
        <div className="custom-select-header" onClick={toggleDropdown}>
          {selectedGender
            ? genderOptions.find(option => option.value === selectedGender).label
            : 'Оберіть'}
          <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
        </div>

        {isDropdownOpen && (
          <ul className="custom-select-options">
            {genderOptions.map(option => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={selectedGender === option.value ? 'selected' : ''}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="onboarding-btn" onClick={handleNextStep}>ДАЛІ</button>

      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar-step ${index <= 2 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const OnboardingOrientation = () => { 
  const [selectedOrientation, setSelectedOrientation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);  

  const orientationOptions = [
    { value: 'hetero', label: 'Гетеро' },
    { value: 'bisexual', label: 'Бісексуал' },
    { value: 'lesbian', label: 'Лесбі' },
    { value: 'gay', label: 'Гей' },
    { value: 'queer', label: 'Квір' }
  ];

  const handleOptionSelect = (value) => {
    setSelectedOrientation(value);
    setIsDropdownOpen(false);
  };

  const handleNextStep = () => {
    if (selectedOrientation) {
      localStorage.setItem('userOrientation', selectedOrientation);  
      navigate('/onboarding-interest');
    } else {
      alert('Будь ласка, оберіть свою орієнтацію');
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Оберіть Вашу орієнтацію</h1>
      <p className="onboarding-subheading">Виберіть свою орієнтацію</p>

      <div className="custom-select-container" ref={dropdownRef}>
        <div className="custom-select-header" onClick={toggleDropdown}>
          {selectedOrientation
            ? orientationOptions.find(option => option.value === selectedOrientation).label
            : 'Оберіть'}
          <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
        </div>

        {isDropdownOpen && (
          <ul className="custom-select-options">
            {orientationOptions.map(option => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={selectedOrientation === option.value ? 'selected' : ''}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="onboarding-btn" onClick={handleNextStep}>ДАЛІ</button>
      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar-step ${index <= 3 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const OnboardingInterest = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);  // 📌 Для відстеження кліків поза випадаючим списком

  const interestOptions = [
    { value: 'woman', label: 'Жінка' },
    { value: 'man', label: 'Чоловік' },
    { value: 'couple', label: 'Пари' },
    { value: 'nonbinary', label: 'Небінари' }
  ];

  const handleInterestSelect = (value) => {
    if (selectedInterests.includes(value)) {
      setSelectedInterests(selectedInterests.filter(option => option !== value));
    } else {
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  const handleNextStep = () => {
    if (selectedInterests.length > 0) {
      localStorage.setItem('userInterests', JSON.stringify(selectedInterests));  // 💾 Зберігаємо інтереси
      navigate('/add-photos');
    } else {
      alert('Будь ласка, оберіть хоча б один варіант');
    }
  };

  // 🔄 Відкриття/закриття випадаючого списку
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="onboarding-container">
      {/* 🔥 Логотип */}
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Хто вас цікавить?</h1>
      <p className="onboarding-subheading">Виберіть варіанти</p>

      <div className="custom-select-container" ref={dropdownRef}>
        <div className="custom-select-header" onClick={toggleDropdown}>
          {selectedInterests.length > 0
            ? selectedInterests.map(
                option => interestOptions.find(o => o.value === option)?.label
              ).join(', ')
            : 'Оберіть'}
          <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
        </div>

        {isDropdownOpen && (
          <ul className="custom-select-options">
            {interestOptions.map(option => (
              <li
                key={option.value}
                onClick={() => handleInterestSelect(option.value)}
                className={selectedInterests.includes(option.value) ? 'selected' : ''}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="onboarding-btn" onClick={handleNextStep}>ДАЛІ</button>

      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar-step ${index <= 4 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};
export const AddPhotos = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const maxPhotos = 4;

  // Додаємо те, що з AuthContext
  const { setPhotoFiles } = useAuth();

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type === 'image/jpeg' || file.type === 'image/png');

    const allowedFiles = validFiles.slice(0, maxPhotos - photos.length);

    const newPhotos = allowedFiles.map((file, index) => ({
      id: photos.length + index + 1,
      src: URL.createObjectURL(file), // для прев’ю
      file: file                     // справжній File-об’єкт
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    event.target.value = null;
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  const handleNext = () => {
    if (photos.length >= 2) {
      // Ось тут замість sessionStorage — просто пишемо в контекст
      setPhotoFiles(photos.map(p => p.file));

      navigate('/spoky-selection');
    } else {
      alert('Будь ласка, завантажте щонайменше 2 фото.');
    }
  };



  const renderAddPhotoButtons = () => {
    let buttons = [];
    let buttonsCount = 0;

    if (photos.length === 0 || photos.length === 1 || photos.length === 2) {
      buttonsCount = 2;  // Якщо 0 або 1 фото → 2 кнопки
    } else if ( photos.length === 3) {
      buttonsCount = 1;  // Якщо 2 або 3 фото → 1 кнопка
    } else {
      buttonsCount = 0;  // Якщо 4 фото → 0 кнопок
    }

    for (let i = 0; i < buttonsCount; i++) {
      buttons.push(
        <div key={`add-photo-${i}`} className="photo-square add-photo">
          <label htmlFor={`file-input-${i}`}>
            <img src="/images/photo.png" alt="Add Photo" className="add-photo-icon" />
            <span className="add-photo-placeholder">Додати фото</span>
          </label>
          <input
            id={`file-input-${i}`}
            type="file"
            accept="image/jpeg, image/png"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
        </div>
      );
    }

    return buttons;
  };

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Додайте фото</h1>
      <p className="onboarding-subheading">Мінімум 2 фото</p>

      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div key={index} className="photo-square">
            <img
              src={photo.src}
              alt={`Uploaded ${index}`}
              className="user-photo"
            />
            <button onClick={() => handleRemovePhoto(index)} className="remove-photo-btn">
              <img src="/images/musorka.png" alt="Видалити" className="trash-icon" />
            </button>
          </div>
        ))}

        {renderAddPhotoButtons()}
      </div>

      <button className="onboarding-btn" onClick={handleNext}>ДАЛІ</button>

      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className={`progress-bar-step ${index <= 5 ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};
export const SubscriptionPage = () => {
  const navigate = useNavigate();

  const handlePurchase = () => {
    navigate('/profile-main'); // Направляє на іншу сторінку після покупки
  };

  return (
    <div className="subscription-container">
    <div className="logo-container1">
      <span className="logo-g">G</span>
      <div className="logo-images">
        <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
        <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
      </div>
      <span className="logo-ra">RA</span>
    </div>
    <div className="subscription-body">
      <h2>Звичайна підписка — свобода для знайомств!</h2>
      <p>Наша звичайна підписка надає всі необхідні інструменти для пошуку партнерів</p>

      <div className="subscription-content">
        <div className="subscription-slide">
          <ul className="benefits-list">
            <li>
              <img src="/images/heart-icon.png" alt="Heart Icon" />
              <div>
                <span className="benefit-title">Безлімітні лайки</span> — взаємодійте з більшою кількістю профілів щодня.
              </div>
            </li>
            <li>
              <img src="/images/heart-icon.png" alt="Heart Icon" />
              <div>
                <span className="benefit-title">Пошук за інтересами</span> — знаходьте людей, які поділяють ваші хобі та захоплення.
              </div>
            </li>
            <li>
              <img src="/images/heart-icon.png" alt="Heart Icon" />
              <div>
                <span className="benefit-title">Глобальний пошук</span> — шукайте людей у будь-якому місці або країні.
              </div>
            </li>
            <li>
              <img src="/images/heart-icon.png" alt="Heart Icon" />
              <div>
                <span className="benefit-title">Перегляд, хто вас лайкнув</span> — тепер ви завжди знатимете, кому сподобались.
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="price-selection">
        <label>1 день — $2</label>
        <select>
          <option>1 день — $2</option>
          <option>7 днів — $10</option>
          <option>1 місяць — $30</option>
        </select>
      </div>

      <button className="purchase-button" onClick={handlePurchase}>Придбати</button>
    </div>

    <img src="/images/lini-1.png" alt="Line" className="side-line left-line" />
    <img src="/images/lini-1.png" alt="Line" className="side-line right-line" />
  </div>
);
};


export const SpokySelection = () => {
  const [selectedSpokies, setSelectedSpokies] = useState([]);  // Масив для збереження вибраних спокус
  const navigate = useNavigate();

  const handleSpokySelect = (id) => {
    setSelectedSpokies((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };
  

  const handleNextStep = () => {
    if (selectedSpokies.length > 0) {
      localStorage.setItem('selectedSpokies', JSON.stringify(selectedSpokies));  // 💾 Зберігаємо вибір
      navigate('/search-registr');
    } else {
      alert('Будь ласка, оберіть хоча б одну спокусу');
    }
  };

  useEffect(() => {
    document.body.classList.add('scroll-enabled');
    return () => {
      document.body.classList.remove('scroll-enabled');
    };
  }, []);

  const spokyItems = [
    { id: 1, src: "/images/spoky-1.png", title: "Обійми", description: "Дотик душі" },
    { id: 2, src: "/images/spoky-2.png", title: "Поцілунки", description: "Мова кохання" },
    { id: 3, src: "/images/spoky-3.png", title: "Масаж", description: "Магія рук" },
    { id: 4, src: "/images/spoky-4.png", title: "Футплей", description: "Вибирай в якому ритмі" },
    { id: 5, src: "/images/spoky-5.png", title: "Іграшки", description: "Інструменти радості" },
    { id: 6, src: "/images/spoky-6.png", title: "Оральний секс", description: "Ніжність губ" },
    { id: 7, src: "/images/spoky-7.png", title: "Домашнє відео", description: "Моя власна історія" },
    { id: 8, src: "/images/spoky-8.png", title: "Стриптиз", description: "Танець спокуси" },
    { id: 9, src: "/images/spoky-9.png", title: "Фантазії", description: "Світ уяви" },
    { id: 10, src: "/images/spoky-10.png", title: "Брудні розмови", description: "Вибирай в якому ритмі" },
    { id: 11, src: "/images/spoky-11.png", title: "Інтелект", description: "Розум - найкраща прелюдія" },
    { id: 12, src: "/images/spoky-12.png", title: "Секстинг", description: "Технології бажання" },
    { id: 13, src: "/images/spoky-13.png", title: "Фемдом", description: "Сила у витонченості" },
    { id: 14, src: "/images/spoky-14.png", title: "Спанкінг", description: "Удар задоволення" },
    { id: 15, src: "/images/spoky-15.png", title: "Домінування", description: "Я — твій господар" },
    { id: 16, src: "/images/spoky-16.png", title: "Підпорядкування", description: "Солодкий смак контролю" },
    { id: 17, src: "/images/spoky-17.png", title: "Свічки", description: "Зміна ролей" },
    { id: 18, src: "/images/spoky-18.png", title: "Гік вайб", description: "Чарівні дивізатива" },
    { id: 19, src: "/images/spoky-19.png", title: "Куколд", description: "Інший погляд на задоволення" },
    { id: 20, src: "/images/spoky-20.png", title: "Ігри з воском", description: "Тепло пристрасті" },
    { id: 21, src: "/images/spoky-21.png", title: "Рольові ігри", description: "Втілення фантазій" },
    { id: 22, src: "/images/spoky-22.png", title: "Позашлюб", description: "Таємна позиція" },
    { id: 23, src: "/images/spoky-23.png", title: "Еджинг", description: "Мистецтво стриманості" },
    { id: 24, src: "/images/spoky-24.png", title: "Вспілку", description: "Темрява відкриває" },
    { id: 25, src: "/images/spoky-25.png", title: "Шоколад", description: "Солодка спокуса" },
    { id: 26, src: "/images/spoky-26.png", title: "Тату & Пірсинг", description: "Знакове тіло" },
    { id: 27, src: "/images/spoky-27.png", title: "Свінг", description: "Обмін емоціями" },
    { id: 28, src: "/images/spoky-28.png", title: "Ваніль", description: "Класика у простоті" },
  ];

  return (
    <div className="spoky-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="spoky-heading">Обери свої спокуси:</h1>

      <div className="spoky-grid">
        {spokyItems.map((item) => (
          <div
            key={item.id}
            className={`spoky-item ${selectedSpokies.includes(item.id) ? 'selected' : ''}`}
            onClick={() => handleSpokySelect(item.id)}
          >
            <div className="spoky-image-container">
              <img
                src={item.src}
                alt={item.title}
                className={`spoky-image ${selectedSpokies.includes(item.id) ? 'image-selected' : ''}`}
              />
            </div>
            <p className="spoky-title">{item.title}</p>
            <p className="spoky-description">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="progress-bar1">
        {[...Array(8)].map((_, index) => (
          <div key={index} className={`progress-bar-step ${index <= 6 ? 'active' : ''}`}></div>
        ))}
      </div>

      <button className="spoky-btn" onClick={handleNextStep}>ДАЛІ</button>
    </div>
  );
};


export const SearchRegistr = () => {
  const [selectedOptions, setSelectedOptions] = useState([]); // Мультивибір для виду стосунків
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { setTelegramId, photoFiles } = useAuth();

  const searchOptions = [
    { value: 'withoutObligation', label: 'Без зобов’язань' },
    { value: 'seriousIntentions', label: 'Серйозні наміри' },
    { value: 'virt', label: 'Вірт' },
    { value: 'allAtOnce', label: 'Все і одразу' }
  ];

  const handleOptionSelect = (value) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((option) => option !== value)
        : [...prevSelected, value]
    );
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    const handleFinishRegistration = async () => {
      console.log("🔥 Починаю реєстрацію. userData:", userData, "photoFiles:", photoFiles);
      try {
        const response = await registerUser(userData, photoFiles);
        console.log("✅ Відповідь від API:", response);
        navigate("/profile-main");
      } catch (error) {
        console.error("❌ Помилка API:", error);
        alert("Помилка реєстрації");
      }
    };

    // Генеруємо тимчасовий telegram_id
    const generateTemporaryId = () => {
      const now = new Date();
      return (
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0')
      );
    };

    const telegramId = generateTemporaryId();
    setTelegramId(telegramId);
    localStorage.setItem("telegram_id", telegramId);

    // Зберігаємо мультивибір виду стосунків у localStorage
    // Тепер relationshipType – це JSON-рядок, що містить масив вибраних значень
    localStorage.setItem("relationshipType", JSON.stringify(selectedOptions));

    const userData = {
      telegram_id: telegramId,
      name: localStorage.getItem("userName"),
      age: localStorage.getItem("userAge"),
      gender: localStorage.getItem("userGender"),
      orientation: localStorage.getItem("userOrientation"),
      interested_in: JSON.parse(localStorage.getItem("userInterests")) || [],
      // Зчитуємо вид стосунків з localStorage (це мультивибір)
      relationship_type: JSON.parse(localStorage.getItem("relationshipType")) || [],
      // Зчитуємо спокуси (як раніше)
      selectedSpokies: JSON.parse(localStorage.getItem("selectedSpokies")) || []
    };

    try {
      // Передаємо photoFiles як другий параметр, як раніше
      const response = await registerUser(userData, photoFiles);
      console.log("✅ Реєстрація успішна:", response);
      alert("Реєстрація успішна!");
      navigate("/profile-main");
    } catch (error) {
      console.error("❌ Помилка реєстрації:", error);
      alert(`❌ Помилка реєстрації: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="logo-container1">
        <span className="logo-g">G</span>
        <div className="logo-images">
          <img src="/images/logo-male.png" alt="Male Symbol" className="logo-male" />
          <img src="/images/logo-female.png" alt="Female Symbol" className="logo-female" />
        </div>
        <span className="logo-ra">RA</span>
      </div>

      <h1 className="onboarding-heading">Що Ви шукаєте?</h1>
      <p className="onboarding-subheading">Виберіть варіант</p>

      <div className="custom-select-container" ref={dropdownRef}>
        <div className="custom-select-header" onClick={toggleDropdown}>
          {selectedOptions.length > 0
            ? selectedOptions.map(
                (option) => searchOptions.find((o) => o.value === option)?.label
              ).join(', ')
            : 'Оберіть'}
          <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
        </div>

        {isDropdownOpen && (
          <ul className="custom-select-options">
            {searchOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={selectedOptions.includes(option.value) ? 'selected' : ''}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="onboarding-btn" onClick={handleFinishRegistration}>
        ЗАВЕРШЕННЯ РЕЄСТРАЦІЇ
      </button>
      <div className="progress-bar">
        {[...Array(8)].map((_, index) => (
          <div key={index} className={`progress-bar-step ${index <= 7 ? 'active' : ''}`}></div>
        ))}
      </div>
    </div>
  );
};
