require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

const proxy = require('express-http-proxy')

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { validateToken } = require('./middleware/authMiddleware');

const port = process.env.PORT || 30001
const app = express();

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PW
});


// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet()); // add extra http headers protection

//rate limit // API RATE LIMITING 
const ratelimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000, //15min
    max: 1000, // number of maxreq
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP ${req.ip}`)
        res.status(429).json({
            success: false,
            message: "Too many Requests"
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

//USING RATE LIMIT MIDDLEWARE
app.use(ratelimitOptions);



// Logging req info
app.use((req, res, next) => {
    logger.info(`
            Received ${req.method}
            request to ${req.url}
            `);
    logger.info(`
            Request body ${JSON.stringify(req.body)}
            `);

    next();
});


///CREATING PORXY TO REDIRECT API GATEWAY  TO THE DIFF SERVICES  using express-http-proxy

// api-gatway =>/v1/auth/register -> 3000 and user ->/api/auth/register
//so basicaly we have to api gateway to user ie
// loclahost:3000/v1/auth/register -> loclahost:3001/api/auth/register

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api") // replace v1 with api
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error : ${err.message}`);
        res.status(500).json({
            message: 'Internal Server error',
            error: err.message
        })
    }
}


//Setting Proxy for User-Service

app.use('/v1/auth', proxy(process.env.USER_SERVICE_URL, {

    ...proxyOptions,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = 'application/json'
        return proxyReqOpts
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from user Service : ${proxyRes.statusCode}`)
        return proxyResData
    }
}));

//Setting Proxy for Post-Service

app.use('/v1/posts', validateToken, proxy(process.env.POST_SERVICE_URL, {

    ...proxyOptions,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = 'application/json';

        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId

        return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Post Service : ${proxyRes.statusCode}`)
        return proxyResData
    }
}));

app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Api Gateway running on ${port}`)
    logger.info(`User Service running on ${process.env.USER_SERVICE_URL}`);
    logger.info(`Post Service running on ${process.env.POST_SERVICE_URL}`)
})