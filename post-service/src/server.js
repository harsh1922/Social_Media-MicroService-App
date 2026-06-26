require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('./utils/logger.js');
const { rateLimit } = require('express-rate-limit');
const {
    RedisStore
} = require('rate-limit-redis');
const postRoutes = require('./routes/post-routes');
const errorHandler = require('./middleware/errorHandler.js');


const app = express();
const port = process.env.PORT || 3002

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
        console.log('MongoDb Connected');
    })
    .catch((e) => logger.error('Failed to connect MongoDB', e));


// Redis Connection
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: 'default',
    password: process.env.REDIS_PW
});

redisClient.on('connect', () => {
    console.log('Redis Connected ');
});

redisClient.on('error', (err) => {
    console.log('Redis Error', err);
});

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet()); //extra http header for protection


// Logging middleware
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
//Additional Rate Limitor specially for APi secuity and Protection usig redis-client -> rate-limit-redis -> express-rate-limit
const postLimiter = rateLimit({ //   rateLimit we got from express-rate-limit
    windowMs: 15 * 60 * 1000, //15min
    max: 50, // number of maxreq
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ //Redis Store we got rom reds-rate-limit,here we store count of req
        sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP ${req.ip}`)
        res.status(429).json({
            success: false,
            message: "Too many Requests"
        });
    },
});

//Apply this Authlimiter to your routes/endpont
app.use('/api/posts', postLimiter);

//  using routes and passing redis client to all routes cuz we neee dredi client to use redis catching in all routes
app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, postRoutes);


app.use(errorHandler);


app.listen(port, () => {
    logger.info(`Post service running on ${port}`)
})


///handling Uncaught/Unhandled Promise
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at', promise, "reason:", reason)
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    process.exit(1);
});