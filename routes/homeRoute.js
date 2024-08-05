const express =  require('express');
const router = express.Router();

const homeController = require('../controllers/homeController.js');
router.get('/', homeController.homePage);//homepage

router.post('/login', homeController.loginUtils);//login page

router.get('/login', homeController.loginPage);

router.get('/signup', homeController.signupPage);



router.post('/signup', homeController.signupUtils);

router.get('/leaderboard', homeController.leaderboardPage);

module.exports = router;

