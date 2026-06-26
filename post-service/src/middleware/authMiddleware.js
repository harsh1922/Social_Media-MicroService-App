const logger = require('../utils/logger');

const authRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'] //api gateway will set this header and from that wee get the user Id in diff services

    if (!userId) {
        logger.warn('Access attempted withour user ID');
        res.status(401).json({
            success: false,
            mesaage: 'Auth required! Please Login to continue',

        })
    }

    req.user = userId; // storing userId in req object so that post service can have iserID  that which user is posting the content in socail-media-app
    next();
}

module.exports = { authRequest };