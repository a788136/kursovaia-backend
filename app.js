// app.js
const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport');
const cors = require('cors');

const app = express();

/** ---------- ENV / CONST ---------- **/
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
const isProd = process.env.NODE_ENV === 'production';

/** ---------- CORS ---------- **/
console.log('[CORS] allowed origins:', allowedOrigins);
app.set('trust proxy', 1); // Render за прокси — нужно для secure cookie

app.use(cors({
  origin(origin, cb) {
    // Разрешаем запросы с указанных фронтов и без Origin (например, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// На всякий случай явно отвечаем на preflight
app.options('*', cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// Чтобы браузер принимал куки между доменами
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  next();
});

app.use(express.json());

/** ---------- Сессии ---------- **/
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,                     // на Render — true
    sameSite: isProd ? 'none' : 'lax',  // кросс-доменно — только 'none'
    maxAge: 1000 * 60 * 60 * 24 * 7     // 7 дней
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/** ---------- Роуты ---------- **/
app.get('/', (req, res) => res.json({ ok: true, service: 'backend' }));

app.use('/auth', require('./routes/auth'));
app.use('/inventories', require('./routes/inventories'));
app.use('/tags', require('./routes/tags'));

/** ---------- Ошибки CORS (чтоб не падал процесс) ---------- **/
app.use((err, req, res, next) => {
  if (err && /Not allowed by CORS/.test(err.message)) {
    return res.status(403).json({ ok: false, error: 'CORS_FORBIDDEN', message: err.message });
  }
  next(err);
});

/** ---------- Запуск ---------- **/
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});
