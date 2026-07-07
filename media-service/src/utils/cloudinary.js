dotenv.config();
const cloudinary = require('cloudinary').v2;
const logger = require('./logger');


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})


const uploadMediaToCloudinary = (file) => {
    return new promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    logger.error('Error uploading media to cloudinary');
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        uploadStream.end(file.buffer);
    })
};

module.exports = { uploadMediaToCloudinary }