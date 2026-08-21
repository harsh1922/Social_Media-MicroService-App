require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./utils/logger.js');
const mediaRoutes = require('./routes/route.js');
const errorHandler = require('./middleware/errorHandler.js');
const { consumeEvent } = require('./utils/rabbitmq.js');
const { handlePostDeleted } = require('./eventHandlers/media-eventHandler.js');
const {
    connectToRabbitMQ
} = require('./utils/rabbitmq.js')

const app = express();
const port = process.env.PORT;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
        console.log('MongoDb Connected');
    })
    .catch((e) => logger.error('Failed to connect MongoDB', e));


app.use(cors());
app.use(helmet());
app.use((express.json()));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`  Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${JSON.stringify(req.body)} `);

    next();
});

app.use('/api/media', mediaRoutes);

app.use(errorHandler);

async function startServer() {
    try {
        await connectToRabbitMQ();

        //consume all the event here
        await consumeEvent('post.deleted', handlePostDeleted)



        app.listen(port, () => {
            logger.info(`Media service running on ${port}`)
        })
    } catch (error) {
        logger.info(`Failed to Conect Media Service on Port:${port}`, error);
        process.exit(1);
    }
}

startServer();


///handling Uncaught/Unhandled Promise
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at', promise, "reason:", reason)
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    process.exit(1);
});