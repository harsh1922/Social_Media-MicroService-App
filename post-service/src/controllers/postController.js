const logger = require('../utils/logger');
const Post = require('../models/Post');
const { validateCreatePost } = require('../utils/validation');

// Invalind Cache if Key is updated or deleted
async function invalidatePostCache(req, input) {
    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey);

    const keys = await req.redisClient.keys("posts:*");
    if (keys.length > 0) {
        await req.redisClient.del(keys);
    }
}

const createPost = async(req, res) => {
    logger.info('Post Creation endpoint hit...');
    try {
        //Validate the schema creditals
        const { error } = validateCreatePost(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        const { content, mediaIds } = req.body;
        console.log("REQ.USER =", req.user);
        const newPost = new Post({
            user: req.user,
            content,
            mediaIds: mediaIds || []
        });

        await newPost.save();
        await invalidatePostCache(req, newPost._id.toString());
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // amount of data u want from that page ie if page=3 and imit=10 ,it simply means we want 10 posts from page 3
        const startIdx = (page - 1) * limit; // formula to cal start dx which decides your cuurent page ,and based on this we skip the pages

        const cacheKey = `posts:${page}:${limit}`; // eg  (posts:1:10)its  key which will be stored in redis
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts)); //redis have json data as tring so we parseit to gat data i n json object form
        }

        const posts = await Post.find({}).sort({ createdAt: -1 }).skip(startIdx).limit(limit);

        const totalPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit), // Math.ceil bascially round of krke int value dedega cuz total pages can;t be a decimal val
            totalPosts,
        }

        //save All posts in redis cache
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result)); // using stringfy cuz redis only stored data in strings

        //REdis will store data like this eg 
        // Key:
        //     posts: 1: 10

        // Value: {
        //     posts: [...],
        //     currentPage: 1,
        //     totalPages: 6,
        //     totalPosts: 57
        // }


        res.json(result);

    } catch (e) {
        logger.error('Error fetching Post', e);
        res.status(500).json({
            success: false,
            message: 'Error fetching Post'
        })
    }
}

const getPost = async(req, res) => {
    logger.info('Get Post by id endpoint hit...');
    try {
        const postId = req.params.id;
        const cachekey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cachekey);

        if (cachedPost) {
            return res.json(JSON.parse(cachedPost));
        }

        const singlePostDetailsbyId = await Post.findById(postId);

        if (!singlePostDetailsbyId) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }

        await req.redisClient.setex(
            cachedPost,
            3600,
            JSON.stringify(singlePostDetailsbyId)
        );

        res.json(singlePostDetailsbyId);
    } catch (e) {
        logger.error("Error fetching post", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post by ID",
        });
    }
};

const deletePost = async(req, res) => {
    logger.info('Delete Post endpoint hit...');
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId, // used for autharization ie ths user belongs to this ost /creaed this post only then it can delete it
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }

        // delete from redis aswell
        await invalidatePostCache(req, req.params.id);
        res.json({
            message: "Post deleted successfully",
        });
    } catch (e) {
        logger.error('Error deleting Post', e);
        res.status(500).json({
            success: false,
            message: 'Error deleting Post'
        })
    }
}

module.exports = { createPost, getAllPosts, deletePost }