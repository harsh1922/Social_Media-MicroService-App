const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    mediaIds: [{
        type: String,
    }],

}, { timestamps: true });



//Db Indexing =>Text Index baneyga content field pe. Example ->
// harsh - > post1, post3 -
// sharma > post2
//  So now if user search harsh in content so mongo db wiill only check post1 and post 3 documnent , iw it will not serach whole post collection ie COLLSCAN(CollectionScan), so indexing solves COLLSCAN prob and will make our mongodb query faster.
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;