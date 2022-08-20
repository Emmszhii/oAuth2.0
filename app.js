require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const md5 = require('md5');

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please insert a username!'],
  },
  password: {
    type: String,
    required: [true, 'Please insert a password!'],
  },
});

const User = new mongoose.model('User', userSchema);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

app
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    User.findOne(
      {
        email: req.body.username,
      },
      (err, result) => {
        err && console.log(err);

        if (result) {
          result.password === md5(req.body.password)
            ? res.render('secrets')
            : res.render('login');
        }
      }
    );
  });

app
  .route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password),
    });

    newUser.save((err) => {
      !err ? res.render('secrets') : console.log(err);
    });
  });

app.get('/logout', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
