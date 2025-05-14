const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kelime-uygulamasi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  kelimeler: [{
    kelime: String,
    anlam: String
  }]
});

const User = mongoose.model('User', userSchema);

// API endpoint'leri
app.post('/api/register', async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    const user = new User({ username, kelimeler: [] });
    await user.save();
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
  } catch (error) {
    console.error("[REGISTER ERROR]:", error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ username: user.username, kelimeler: user.kelimeler });
  } catch (error) {
    console.error("[LOGIN ERROR]:", error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/kelime-ekle', async (req, res) => {
  try {
    const { username, kelime, anlam } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.kelimeler.push({ kelime, anlam });
    await user.save();
    res.json({ kelimeler: user.kelimeler });
  } catch (error) {
    console.error("[KELIME EKLE ERROR]:", error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.delete('/api/kelime-sil', async (req, res) => {
  try {
    const { username, kelimeIndex } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.kelimeler.splice(kelimeIndex, 1);
    await user.save();
    res.json({ kelimeler: user.kelimeler });
  } catch (error) {
    console.error("[KELIME SIL ERROR]:", error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = app; 