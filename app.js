const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport');

const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));
app.use('/inventories', require('./routes/inventories'));
app.use('/tags', require('./routes/tags'));

connectDB().then(() => {
  app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
});
