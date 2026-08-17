dotenv.config();
const cloudinary = require('cloudinary').v2;
const express = require('express');
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`)) = require('express');
const logger = require('./logger');


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})


const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
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
        uploadStream.end(file.buffer); // cloudinary recieves data in buffer 
    })
};

const deleteMediaFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info('Media deleted successfully from Cloudinary');
        return result;

    } catch (error) {
        logger.error("Error deletingmdida from Cloudoinary", error);
        throw error;
    }
}



module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };