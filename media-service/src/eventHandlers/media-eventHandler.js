const logger = require('../utils/logger')
const Media = require('../models/media')
const { deleteMediaFromCloudinary } = require('../utils/cloudinary')


const handlePostDeleted = async(event) => {
    console.log(event, 'Post Deletion Event ') /// Just for debug/check that our event is being consumed or not

    // in this handler we are bascially consuming ther post delete event , so here we get posId,user,id,and medaiIDs from Delete Post Event

    const { postId, mediaIds } = event // this medai ids we are geytting from elete post publsiuh evet n;ie post have this all medias
    try {

        const mediaToDelete = await Media.find({ //It is the array with all mediaIds related to the post, so we are creating a array where _id is in mediaIDs, so we can get arrayfoa ll mediaIds related to that post so we can delete all that medais related to Post from db as weel adn cloudinary cloud and at last we can finally delete that post as well

            _id: { $in: mediaIds }
        })

        // Direct Interview Question ************
        ///  we use for of loop bbcoz it awaits for the async callback while for each doest wait for async call back, 
        for (const media of mediaToDelete) {
            try {
                await deleteMediaFromCloudinary(media.publicId);
                await Media.findByIdAndDelete(media._id);

                logger.info(
                    `Deleted media ${media._id} from Media Service and Cloudinary`
                );
            } catch (error) {
                logger.error(
                    `Failed to delete media ${media._id}`,
                    error
                );
            }
        }

        logger.info(
            `Successfully processed post.deleted event for post ${postId}`
        );
    } catch (error) {

        logger.error('Error occured while consumig Delete Post  event', error)
    }
}

module.exports = { handlePostDeleted };