const User = require('../model/user')
const logger = require('../utils/logger');
const {
    validateRegistration,
    validateLogin
} = require('../utils/validation');


const generateTokens = require('../utils/generateToken');
const RefreshToken = require('../model/refreshToken');

//user register
const registerUser = async(req, res) => {
    logger.info("Registratoion Endpoint hit ...")
    try {
        //Validate the schema creditals
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        //Check if user already existes
        const { email, password, username } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            logger.warn("User already exists");
            return res.status(409).json({
                success: false,
                message: "USer already exists"
            })
        }

        //Create  and save  new user
        user = new User({
            username,
            email,
            password
        });
        await user.save();
        logger.info("User successfully registered", user._id);


        ///Generate Access Token and REfresh Token
        const { accessToken, refreshToken } = await generateTokens(user);
        res.status(201).json({
            success: true,
            message: 'User registered Successfully',
            accessToken,
            refreshToken,
            userId: user._id
        })
    } catch (e) {
        logger.error('Registration Error', e);
        res.status(500).json({
            success: false,
            message: ' Interrnal Server error'
        })
    }
}

//user login
const loginUser = async(req, res) => {
    logger.info('Login Endpont Hit...');
    try {
        // validate login credentilas
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn("Invalid email or password")
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        // validate p/w if user found
        const isValidatePassword = await user.comparePassword(password);
        if (!isValidatePassword) {
            logger.warn("Invalid email or password")
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        //  IF email N p/w are correct then create accessand Refresh token for user
        const { accessToken, refreshToken } = await generateTokens(user);
        res.json({
            success: true,
            accessToken,
            refreshToken,
            userId: user._id
        })

    } catch (error) {
        logger.error('Login Error Occured', error);
        res.status(500).json({
            success: false,
            message: ' Interrnal Server error'
        })
    }
}


// referesh token 
//this emndpoint is used to create new refresh token , when user hit this endpoint a new refresh token will be generated for next 7days and using this refrresh token we can genmerate new accesss token 
const refreshTokenUser = async(req, res) => {
    logger.info('RefreshToken Endpont Hit...');
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn('RefreshToken is not present ...');
            return res.status(400).json({
                success: false,
                message: ' RefreshToken is not present'
            });
        }

        //Find user refresh tokken in RefreshToken Schema/model
        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        //Stored token is our refresh token schema
        //if user refreshToken is not FOund in RefreshToken Schema
        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn('Invalid or expired Refresh Token');


            return res.status(401).json({
                success: false,
                message: ' Invalid or expired Refresh Token'
            })
        }

        // We have storeuser id in RefreshToken schema so from therr we will dey user id
        const user = await User.findById(storedToken.user);
        if (!user) {
            logger.warn('User not Found');

            return res.status(401).json({
                success: false,
                message: ' User not Found'
            })
        }

        /// if user found , then delete old refresh token and generate new refrehToken 

        //delete the existing/old refresh token
        await RefreshToken.deleteOne({ _id: storedToken._id });

        //Create new token
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);



        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })
    } catch (error) {
        logger.error('RefreshToken Creation Error Occured', error);
        res.status(500).json({
            success: false,
            message: ' Interrnal Server error'
        })
    }
}


//user logout

//For logut just fin dand delete refresh token so that no new acces token is gemnerated and user will get unauthrized automatically one nacces token is expired 
const logoutUser = async(req, res) => {
    logger.info('Logout Endpont Hit...');
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn('RefreshToken is not present ...');
            return res.status(400).json({
                success: false,
                message: ' RefreshToken is not present'
            });
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info('RefreshToken deleted for logout ...');
        res.json({
            success: true,
            message: 'user Logout Successfully'
        })

    } catch (error) {
        logger.error('Error while logging out', error)
        res.status(500).json({
            success: false,
            message: ' Interrnal Server error'
        })

    }
}

module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };