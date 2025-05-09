import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [kelimeler, setKelimeler] = useState([]);
  const [yeniKelime, setYeniKelime] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnlam, setShowAnlam] = useState(false);
  const [showList, setShowList] = useState(false);

  const kelimeEkle = async () => {
    if (yeniKelime) {
      const translatedAnlam = await ceviriYap(yeniKelime);
      setKelimeler([...kelimeler, { kelime: yeniKelime, anlam: translatedAnlam }]);
      setCurrentIndex(kelimeler.length);
      setShowAnlam(true);
      setYeniKelime('');
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

  const kelimeSil = (index) => {
    const yeniKelimeler = kelimeler.filter((_, i) => i !== index);
    setKelimeler(yeniKelimeler);
    if (currentIndex >= yeniKelimeler.length) {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kelime Uygulaması</h1>
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
