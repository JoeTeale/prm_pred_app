if (process.env.node_env !== 'production') {
    require('dotenv').config();
}
const passport = require('passport')
const express = require('express');
const handleBars = require('express-handlebars')
const users = require('./users/users')
const bcrypt = require('bcrypt')
const app = express(); 
const initialisePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session');

initialisePassport(
    passport, 
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
    );

// init middleware (handlebars)
app.engine('handlebars', handleBars({defaultLayour: 'main'}));
app.set('view engine', 'handlebars');

// init middleware (body parsers)
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))

  
app.use(passport.initialize())
app.use(passport.session())
//Render views
app.get('/', checkAuthenticated,(req,res) => res.render('index', 
{title: 'Premier Prediction App'}));

app.get('/login', checkNotAuthenticated, (req,res) => res.render('login', 
{title: 'Login'}));

app.get('/register', (req,res) => res.render('register', 
{title: 'Register'}));

app.post('/register', async (req,res) => {
    const form = req.body
    try {
        const hashedPassword = await bcrypt.hash(form.password, 10)
        users.push({
            id: Date.now().toString(),
            username: form.username,
            password: hashedPassword
    
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users);    
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
const PORT = process.env.process || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    else {
        res.redirect('/login')
    }
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }
    else {
        next()
    }
}

