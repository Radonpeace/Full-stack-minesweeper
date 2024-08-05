const express = require('express');
const path = require('path');

const userController = require('../controllers/userController.js');

const router = express.Router();

router.get('/profile', userController.profilePage);

router.post('/gameOver', userController.gameOver);

module.exports = router;

