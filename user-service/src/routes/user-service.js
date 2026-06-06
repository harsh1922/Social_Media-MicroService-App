const express = require('express')
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController')


router.post('/register', registerUser);
router.post('/login', loginUser(req, res));

module.exports = router;