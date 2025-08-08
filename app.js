const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS с поддержкой cookies
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), // защита от undefined
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// API роуты
app.use('/auth', require('./routes/auth'));
app.use('/inventories', require('./routes/inventories'));
app.use('/tags', require('./routes/tags'));

// Запуск сервера
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
});
