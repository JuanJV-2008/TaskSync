const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/analytics', (req, res) => {
    res.render('analytics');
});

app.get('/task-manager', (req, res) => {
    res.render('task-manager');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
