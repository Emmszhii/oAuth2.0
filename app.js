require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,
    cookie: {},
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });

// mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // required: [true, 'Please insert a username!'],
  },
  password: {
    type: String,
    // required: [true, 'Please insert a password!'],
  },
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/secrets');
  } else {
    res.render('home');
  }
});

app.get('/secrets', (req, res) => {
  // session user algorithm
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});

app
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post(
    passport.authenticate('local', {
      successRedirect: '/secrets',
      failureRedirect: '/login',
    }),
    (req, res) => {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });

      // login algorithm
      req.login(user, (err) => {
        err && console.log(err);
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets');
        });
      });
    }
  );

app
  .route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    //register algorithm
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect('/register');
        } else {
          passport.authenticate('local')(req, res, function () {
            res.redirect('/secrets');
          });
        }
      }
    );
  });

app.get('/logout', (req, res) => {
  req.logout((err) => {
    err && console.log(err);

    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
