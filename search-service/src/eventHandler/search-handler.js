const logger = require('../utils/logger.js');
const Search = require('../models/search.js')


const handlePostCreated = async(event) => {
    console.log(event, 'Post Creation Event ') /// Just for debug/check that our event is being consumed or not

    const { postId, content, userId, createdAt } = event; // we are fetching this detail from even publish by post on postCreation
    try {

        const newSearchPost = new Search({
            postId,
            userId,
            content,
            createdAt
        });

        await newSearchPost.save();
        logger.info(`Search post created: ${postId}, ${newSearchPost._id.toString()}`);

    } catch (e) {
        logger.error('Error handling post creation event', e);
    }
}

module.exports = { handlePostCreated };