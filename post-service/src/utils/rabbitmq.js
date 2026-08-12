const amqp = require('amqplib');

const logger = require('../utils/logger');
let connection = null;
let channel = null;

const EXCHANGE_NAME = "sm_events";

async function connetToRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);

        channel = await connection.createChannel();

        await channel.assertExchange('EXCHANGE_NAME', "topic", { durable: false });

        logger.info('RabbitMQ conection success');

        return channel;

    } catch (error) {

    }
}