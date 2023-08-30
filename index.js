const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const axios = require('axios');
const app = express();

// Firebase Admin SDK setup
const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Routes
app.get('/signin', (req, res) => {
  res.render('signin');
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    // Handle user retrieval success
    res.redirect('/');
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.redirect('/signin');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    // Handle user creation success
    res.redirect('/signin');
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.redirect('/signup');
  }
});

// Movie API configuration
const OMDB_API_KEY = '12ccd257';
const OMDB_API_BASE_URL = 'http://www.omdbapi.com/apikey.aspx?VERIFYKEY=51682777-0b45-4ad8-8ee4-057d8c82ea06';

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${OMDB_API_BASE_URL}/movie/popular`, {
      params: {
        api_key: OMDB_API_KEY,
      },
    });
    const movies = response.data.results;
    res.render('index', { movies });
  } catch (error) {
    console.error(error);
    res.render('index', { movies: [] });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
