const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// アップロードフォルダ設定（Renderでは一時保存）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// データ保存（今回はメモリ上）
let data = [];

// 登録API（画像は任意）
app.post('/register', upload.single('image'), (req, res) => {
  const { artist, album } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!artist || !album) {
    return res.status(400).json({ error: 'アーティスト名とアルバム名は必須です' });
  }

  const entry = { artist, album, image };
  data.push(entry);

  res.status(200).json({ message: '登録完了', entry });
});

// 検索API
app.get('/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = data.filter(entry =>
    entry.artist.toLowerCase().includes(query) ||
    entry.album.toLowerCase().includes(query)
  );
  res.json(results);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
