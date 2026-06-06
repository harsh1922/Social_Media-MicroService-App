const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../model/refreshToken');

//Creaing Accees_Token using JWT 
//Creaing Refresh_Token using crypto random bytes().toSring('HEx') 
const generateTokens = async(user) => {
    const accessToken = jwt.sign({
        userId: user._id,
        username: user.username
    }, process.env.JWT_SECRET, { expiresIn: "30m" });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7) // referesh token will expires in 7 days

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt
    });

    return { accessToken, refreshToken }
};
module.exports = generateTokens;