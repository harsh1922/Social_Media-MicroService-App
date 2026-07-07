const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');

const uploadMedia = async(req, res) => {
    logger.info('Media Upload Endpoint Hit');
    try {
        if (!req.file) {
            logger.error('No file is present in the req ')
            return res.status(400).json({
                success: false,
                message: 'No file is present in the req'
            })
        }

        const { originalName, mimeType } = req.file;
        const userId = req.user.userId // userId we already store in req.user object  in authMiddleware.

        logger.info(`File details: name${originalName}, mime:${mimeType}`);
        logger.info('Uploading to Cloudinary Started');
        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info('Uploading to Cloudinary Successfully');

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResultpublic_id,
            originalName,
            mimeType,
            userId
        });

        await newlyCreatedMedia.save();
        return res.status(201).json({
            success: true,
            mediaId: ,
            message: 'No file is present in the req'
        })

    } catch (error) {

    }
}