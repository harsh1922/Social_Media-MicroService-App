const express = require('express')
const { createPost } = require('../controllers/postController');
const { authRequest } = require('../middleware/authMiddleware')

const router = express.Router();

router.use(authRequest);
router.post('/create-post', createPost);
module.exports = router;