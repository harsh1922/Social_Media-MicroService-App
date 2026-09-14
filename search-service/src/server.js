require('dotenv').config()
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('./utils/logger.js');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const errorHandler = require('./middleware/errorHandler.js');

const { connectToRabbitMQ, consumeEvent } = require('./utils/rabbitmq');

const searchRoutes = require('./routes/search');
const { handlePostCreated } = require('./eventHandler/search-handler.js');


const app = express();
const Port = procees.env.PORT || 3004;

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
    logger.info(`  Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${JSON.stringify(req.body)} `);

    next();
});

//use routes

app.use('/api/search', searchRoutes);
app.use(errorHandler);

async function startServer() {
    try {
        await connectToRabbitMQ();

        // Consume/Subscribe to the Events

        await consumeEvent('post.created', handlePostCreated())


        app.listen(port, () => {
            logger.info(`Search service running on ${port}`)
        })

    } catch (e) {
        logger.error('Error starting the Search Service')
    }
}