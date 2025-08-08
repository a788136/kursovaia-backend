const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// API роуты
app.use('/auth', require('./routes/auth'));
app.use('/inventories', require('./routes/inventories'));
app.use('/tags', require('./routes/tags'));

// Раздаём статические файлы фронтенда
const clientPath = path.join(__dirname, 'client', 'dist'); // если билд React в client/dist
app.use(express.static(clientPath));

// Для всех остальных маршрутов отдаём index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Запуск сервера
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
});
