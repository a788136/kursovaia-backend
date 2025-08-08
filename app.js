// app.js
const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport');
const cors = require('cors');

const app = express();

/** ---------- CORS ---------- **/
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
console.log('[CORS] allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Чтобы браузер принимал куки между доменами
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

/** ---------- Сессии ---------- **/
// Render за прокси — нужно для корректной работы secure cookie
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,                   // в проде обязательно HTTPS
    sameSite: isProd ? 'none' : 'lax',// для разных доменов нужен 'none'
    maxAge: 1000 * 60 * 60 * 24 * 7   // 7 дней
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/** ---------- Роуты ---------- **/
app.use('/auth', require('./routes/auth'));
app.use('/inventories', require('./routes/inventories'));
app.use('/tags', require('./routes/tags'));

/** ---------- Запуск ---------- **/
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});
