const logger = require('../utils/logger.js')
const Search = require('../models/search.js')


const searchPost = async(req, res) => {
    logger.info('searchPost endpoint Hit');
    try {
        const { query } = req.query;

        const results = await Search.find({
                $text: { $search: query }
            }, {
                score: { $meta: 'textScore' }
            })
            .sort({ score: { $meta: 'textScore' } }).limit(10);
        res.json(results);


    } catch (e) {
        logger.error(`Error while searching Post`, e)
        res.status(500).json({
            success: false,
            message: "Error while searching Post"
        });
    }
};

module.exports = { searchPost };