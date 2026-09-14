const express = require('express');
const { searchPost } = require('../controllers/search');
const { authRequest } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authRequest);

router.get('/posts', searchPost);

module.exports = router;