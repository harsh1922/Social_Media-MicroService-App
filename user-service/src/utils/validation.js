const Joi = require('joi');

const validateRegistration = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })

    return schema.validate(data); // will reutn an error obj if an error occurs
};

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })

    return schema.validate(data); // will reutn an error obj if an error occurs
}

module.exports = { validateRegistration, validateLogin };