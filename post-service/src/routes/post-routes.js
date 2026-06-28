const express = require('express')
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const { authRequest } = require('../middleware/authMiddleware')

const router = express.Router();

router.use(authRequest); // its  willl pass uuser_id to post service so that we can authenticate that post service is only applicable for authnticated user, kits done by api-gateway (x-user-data) heders
router.post('/create-post', createPost);
router.get('/all-posts', getAllPosts);
router.get('/post:${id}', getPost);
router.delete('/delete:${id}', deletePost);


module.exports = router;