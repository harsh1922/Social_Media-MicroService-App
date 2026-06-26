const logger = require('../utils/logger');
const Post = require('../models/Post')



const createPost = async(req, res) => {
    logger.info('Post Creation endpoint hit...');
    try {
        const { content, mediaIds } = req.body;

        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []
        });

        await newPost.save();
        logger.info('Post Created Successfully', newPost);

        res.status(201).json({
            success: true,
            message: 'Post Created Successfully'
        })



    } catch (e) {
        logger.error('Error Creating Post', e);
        res.status(500).json({
            success: false,
            message: 'Error Creating Post'
        })
    }
}

const getAllPosts = async(req, res) => {
    logger.info('Get all Posts endpoint hit...');
    try {

    } catch (e) {
        logger.error('Error fetching Post', e);
        res.status(500).json({
            success: false,
            message: 'Error fetching Post'
        })
    }
}

const deletePost = async(req, res) => {
    logger.info('Delete Post endpoint hit...');
    try {

    } catch (e) {
        logger.error('Error deleting Post', e);
        res.status(500).json({
            success: false,
            message: 'Error deleting Post'
        })
    }
}

module.exports = { createPost, getAllPosts, deletePost }