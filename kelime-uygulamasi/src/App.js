import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = '/api';

function App() {
  const [kelimeler, setKelimeler] = useState([]);
  const [yeniKelime, setYeniKelime] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnlam, setShowAnlam] = useState(false);
  const [showList, setShowList] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      handleLogin(savedUsername);
    }
  }, []);

  const handleLogin = async (username) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username });
      setUsername(response.data.username);
      setKelimeler(response.data.kelimeler);
      setIsLoggedIn(true);
      localStorage.setItem('username', response.data.username);
      setError('');
    } catch (error) {
      if (error.response?.status === 404) {
        // Kullanıcı bulunamadıysa kayıt ol
        try {
          await axios.post(`${API_URL}/register`, { username });
          setUsername(username);
          setKelimeler([]);
          setIsLoggedIn(true);
          localStorage.setItem('username', username);
          setError('');
        } catch (registerError) {
          setError('Kayıt işlemi başarısız oldu');
        }
      } else {
        setError('Giriş yapılamadı');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setKelimeler([]);
    localStorage.removeItem('username');
  };

  const kelimeEkle = async () => {
    if (yeniKelime) {
      try {
        const translatedAnlam = await ceviriYap(yeniKelime);
        const response = await axios.post(`${API_URL}/kelime-ekle`, {
          username,
          kelime: yeniKelime,
          anlam: translatedAnlam
        });
        
        setKelimeler(response.data.kelimeler);
        setCurrentIndex(response.data.kelimeler.length - 1);
        setShowAnlam(true);
        setYeniKelime('');
        setError('');
      } catch (error) {
        setError('Kelime eklenirken bir hata oluştu');
      }
    }
  };

  const ceviriYap = async (kelime) => {
    try {
      const response = await axios.get('https://translation.googleapis.com/language/translate/v2', {
        params: {
          q: kelime,
          target: 'tr',
          key: 'AIzaSyDK5KPv8FSzpgxDCuSslUWwhflCDLT9Eeo',
        },
      });
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Çeviri hatası:', error.message);
      return 'Çeviri yapılamadı';
    }
  };

  const anlamGosterGizle = () => {
    setShowAnlam(!showAnlam);
  };

  const sonrakiKart = () => {
    setShowAnlam(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % kelimeler.length);
  };

  const listeyiGosterGizle = () => {
    setShowList(!showList);
  };

  const kelimeSil = async (index) => {
    try {
      const response = await axios.delete(`${API_URL}/kelime-sil`, {
        data: { username, kelimeIndex: index }
      });
      
      setKelimeler(response.data.kelimeler);
      if (currentIndex >= response.data.kelimeler.length) {
        setCurrentIndex(0);
      }
      setError('');
    } catch (error) {
      setError('Kelime silinirken bir hata oluştu');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Kelime Uygulaması</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(username);
          }}>
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Giriş Yap</button>
          </form>
          {error && <p className="error">{error}</p>}
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kelime Uygulaması</h1>
        <div className="user-info">
          <span>Hoş geldin, {username}!</span>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Kelime"
          value={yeniKelime}
          onChange={(e) => setYeniKelime(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && kelimeEkle()}
        />
        <button onClick={kelimeEkle}>Ekle</button>

        {kelimeler.length > 0 && (
          <div>
            <h2>Flash Card</h2>
            <div>
              <p>{kelimeler[currentIndex].kelime}</p>
              {showAnlam && <p>{kelimeler[currentIndex].anlam}</p>}
              <button onClick={anlamGosterGizle}>
                {showAnlam ? 'Anlamı Gizle' : 'Anlamı Göster'}
              </button>
              <button onClick={sonrakiKart}>Sonraki Kart</button>
            </div>
          </div>
        )}

        <button onClick={listeyiGosterGizle}>
          {showList ? 'Listeyi Gizle' : 'Listeyi Göster'}
        </button>

        {showList && (
          <ul>
            {kelimeler.map((item, index) => (
              <li key={index}>
                {item.kelime} - {item.anlam}
                <button onClick={() => kelimeSil(index)}>Sil</button>
              </li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;
