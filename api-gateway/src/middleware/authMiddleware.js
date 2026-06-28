const logger = require('../utils/logger');
const jwt = require('jsonwebtoken')

const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // headers is an object and here w are fetching authrization key value from header object
    const token = authHeader && authHeader.split(" ")[1]; // spliitng the bearer token
    if (!token) {
        logger.warn('Access ateempt without valid token')
        return res.status(401).json({
            success: false,
            message: 'Auth required'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn('Invalid token')
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            })
        }
        req.user = user;
        next();
    })
}

module.exports = { validateToken };