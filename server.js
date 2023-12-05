const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const LogInCollection = require("./db/mongo");

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home', { naming: '' }); // Default empty naming
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: '' }); // Pass an error message to display if needed
});

app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: '' }); // Pass an error message to display if needed
});

app.get('/analytics', (req, res) => {
  res.render('analytics');
});

app.get('/task-manager', (req, res) => {
  res.render('task-manager');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.post('/signup', async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      password: req.body.password,
    };

    const checking = await LogInCollection.findOne({ name: req.body.name });

    if (checking) {
      res.render('signup', { errorMessage: 'User details already exist' });
    } else {
      await LogInCollection.insertMany([data]);
      res.status(201).render('home', { naming: req.body.name });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      res.status(201).render('home', { naming: `${req.body.password}+${req.body.name}` });
    } else {
      res.render('login', { errorMessage: 'Incorrect username or password' });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
