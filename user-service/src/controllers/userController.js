const User = require('../model/user')
const logger = require('../utils/logger');
const validateRegistration = require('../utils/validation');
const generateTokens = require('../utils/generateToken')

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
            return res.status(400).json({
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
            refreshToken
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
            logger.warn("Invalid User")
            return res.status(400).json({
                success: false,
                message: "Invalid user Credentiasl"
            })
        }

        // validate p/w if user found
        const isValidatePassword = await user.comparePassword(password);
        if (!isValidatePassword) {
            logger.warn("Invalid User password")
            return res.status(400).json({
                success: false,
                message: "Invalid user password"
            })
        }

        //  IF email N p/w are correct then create accessand Refresh token for user
        const { accessToken, refreshToken } = await generateTokens(user);
        res.json({
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





//user logout
module.exports = { registerUser, loginUser };