const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.homePage = (req, res) => {
    const userId = req.cookies.userId;
    // console.log(userId);
    res.render('index',{userId:userId}); //TODO: Remove cookie from here and pass something else for the user validation
}
exports.gamePage = (req, res) => {
    res.render('game');
}

exports.loginPage = (req, res) => {
    res.render('login', { usernameError: '', passwordError: '' ,emailError:''});
}

exports.leaderboardPage = (req, res) => {
    const db = req.db;
    const sql = `
    SELECT g.timeTaken, g.result, u.username, u.email 
    FROM gameStats g 
    JOIN users u ON g.userId = u.id 
    WHERE g.result = 'WIN'
    ORDER BY g.timeTaken ASC;`
    db.query(sql, (err, results) => {
        if(err) throw err;
        res.render('leaderboard', {leaderboard:results});
    });
}


exports.signupPage = (req, res) => {
    res.render('signup', { usernameError: '', emailError:''});
}

exports.loginUtils = (req, res) => {
    const {email,password} = req.body;
    const db = req.db;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    const token = jwt.sign({id: result[0].id}, 'your-secret-key');
                    // console.log(token);
                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + 100*60*60*1000 // 100 hours
                        ),
                        httpOnly: true
                    }
                    res.cookie('userId', result[0].id);
                    res.cookie('jwt', token, cookieOptions);
                    // console.log('Logged in successfully')
                    res.status(200).redirect('/');
                } else {
                    res.render('login', { usernameError: '', passwordError: 'Incorrect password' ,emailError:''});
                }
            });
        } else {
            res.render('login', { usernameError: 'No user with this email exists', passwordError: '',emailError:'' });
        }
    });
}

    

exports.signupUtils = (req, res) => { 
    const {username, email, password} = req.body;

    const checkUserExistsQuery = 'SELECT * FROM users WHERE email = ?';
    const checkUsernameExistsQuery = 'SELECT * FROM users WHERE username = ?';
    const db = req.db;
    db.query(checkUserExistsQuery, [email,username], (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            res.render('signup', {emailError: 'User with this email already exists' });
            return;
        }
    });

    bcrypt.hash(password, 8, (err, hashedPassword) => {
        if(err) throw err; //TODO Handle error properly by sending a response
        const db = req.db;
        const sql = 'INSERT INTO users(username,email,password) VALUES(?,?,?)';
        db.query(sql,[username, email, hashedPassword], (err, result) => {
            if(err) throw err;
            // console.log(result);
            res.status(200).redirect('/');
        });
    });
}