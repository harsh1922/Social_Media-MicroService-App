const amqp = require('amqplib');

const logger = require('../utils/logger');
let connection = null;
let channel = null;

const EXCHANGE_NAME = "sm_events";

async function connectToRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);

        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

        logger.info('RabbitMQ conection success');

        return channel;

    } catch (error) {
        logger.error("Error connecting RabbitMQ");
        throw error;
    }
}


async function publishEvent(routingKey, message) {
    if (!channel) {
        await connectToRabbitMQ()
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));

    logger.info(`Event Published: ${routingKey}`);
}

async function consumeEvent(routingKey, message) {
    if (!channel) {
        await connectToRabbitMQ()
    }

    const queue = await channel.assertQueue("")
}

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };