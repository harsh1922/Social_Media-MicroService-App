const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
    publicId: { // cloudinary user id ,so tha twe can add or remove fle from cludinary/s3
        type: String,
        required: true
    },

    originalName: { // fil name ie rersume.pdf, pic.png..etc
        type: String,
        required: true,
    },

    mimeType: { // type of file image/jpeg, video/mp4..etc, useful for validating media type
        type: String,
        required: true,
    },

    url: { //Image ka accessible URL. ie eg -> https://res.cloudinary.com/demo/image/upload/abc.jpg
        type: String,
        required: true,
    },

    userId: { // Tells which users image/media data is this.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

}, { timestamps: true });


// Examplke of this modle created data({
//             "_id": "6860a2d....",
//             "publicId": "users/123/profile_abc123",
//             "originalName": "profile.jpg",
//             "mimeType": "image/jpeg",
//             "url": "https://res.cloudinary.com/.../profile.jpg",
//             "userId": "6859b1c...",
//             "createdAt": "...",
//             "updatedAt": "...")

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;