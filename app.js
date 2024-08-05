const express = require('express'); // server framework
const path = require('path'); // path 
const homeRoute = require('./routes/homeRoute.js'); // route handler
const userRoute = require('./routes/userRoute.js');
const mysql = require('mysql2'); // interaction with database
const app = express(); // creating server instance
const cors = require('cors'); // cross origin resource sharing
app.use(cors()); 

const bodyParser = require('body-parser'); // middleware
// Middleware to parse the form data
app.use(bodyParser.urlencoded({ extended: true })); //makes form data available in req.body

const PORT = process.env.PORT || 3000; // 
const auth = require('./middleware/auth.js'); // jwt auth

const cookieParser = require('cookie-parser'); 
app.use(cookieParser()); // use to store cookie in easier format

app.use(express.static('public')); // store the frontend js and styles 

app.set('view engine', 'ejs'); // sets ejs as view engine
app.set('views', path.join(__dirname, 'views'));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'ridhan',
    database: 'radon',
    
});

db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to the database');
});

app.use((req, res, next) => {
    req.db = db;
    next();
}); // look into disadvantages

app.use(express.json()); // json formatting

// app.get('/clear', (req, res) => {
//     res.clearCookie('jwt');
//     res.clearCookie('userId');
//     res.redirect('/');
// });

app.use('/', homeRoute);

app.use(auth);

app.get('/startGame',  (req, res) => {
    res.render('game');
});

app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.clearCookie('userId');
    res.redirect('/');
});


app.use('/user',userRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});