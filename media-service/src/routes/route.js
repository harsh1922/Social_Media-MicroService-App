const express = require('express');
const multer = require('Multer');

const { uploadMedia, getAllMedia } = require('../controllers/mediaController');
const logger = require('../utils/logger');
const { authRequest } = require('../middleware/authMiddleware');

const router = express.Router();


///Configure Multer For file upload and add file property in request(req) object so that weget file from req.file


///Multer Config ->
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb
    }
}).single('file');


// Post Route to Upload MEdia
router.post('/upload', authRequest, (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            logger.error('Multer err while uploading', err);
            return res.status(400).json({
                message: 'Multer error while Uploading',
                error: err.message,
                stack: err.stack
            })
        } else if (err) {
            logger.error('Unknown err while uploading', err);
            return res.status(500).json({
                message: 'Unknown error while Uploading',
                error: err.message,
                stack: err.stack
            })
        }
        if (!req.file) {
            return res.status(400).json({
                message: 'req.file if not found/present in thr req object',
            })
        }

        next();
    })
}, uploadMedia);

//Get All Media Route
router.get('/getMedias', authRequest, getAllMedia)

module.exports = router;