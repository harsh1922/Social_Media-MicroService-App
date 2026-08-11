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

        const { originalname, mimetype } = req.file;
        const userId = req.user.userId // userId we already store in req.user object  in authMiddleware.

        logger.info(`File details: name${originalname}, mime:${mimetype}`);
        logger.info('Uploading to Cloudinary Started');

        // Uplodaing MEdia FIle to Coudinary
        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);

        logger.info('Uploading to Cloudinary Successfully');

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId,
        });

        await newlyCreatedMedia.save();

        return res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            message: 'Media Uploaded Successfully'
        })

    } catch (e) {
        logger.error('Error Creating Media', e);
        res.status(500).json({
            success: false,
            message: 'Error Creating Media'
        })
    }
};

module.exports = { uploadMedia };