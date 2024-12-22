import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Retry } from '../decorators/retry.decorator';
import { RABBITMQ_CONFIG } from '../configs/rabbitmq.config';
import { NewsMessage } from '../types/news.type';
import { BatchPublisherService } from './batch-publisher.service';
import { NewsMessageValidator, ValidationError } from '../validators/news-message.validator';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    constructor(private readonly batchPublisher: BatchPublisherService) {}

    async onModuleInit() {
        await this.initialize();
    }

    async onModuleDestroy() {
        await this.cleanup();
    }

    @Retry({
        maxAttempts: 5,
        delayMs: 5000,
        exponentialBackoff: true,
        maxDelayMs: 30000,
    })
    private async initialize() {
        try {
            // Create connection
            this.connection = await amqp.connect(RABBITMQ_CONFIG.url);
            this.channel = await this.connection.createChannel();

            // Setup exchange and queue
            await this.channel.assertExchange(RABBITMQ_CONFIG.exchangeName, 'direct', {
                durable: true,
            });
            await this.channel.assertQueue(RABBITMQ_CONFIG.queueName, { durable: true });
            await this.channel.bindQueue(
                RABBITMQ_CONFIG.queueName,
                RABBITMQ_CONFIG.exchangeName,
                RABBITMQ_CONFIG.routingKey
            );

            this.logger.log('RabbitMQ connection established successfully');

            // Handle connection events
            this.connection.on('error', (error) => {
                this.logger.error('RabbitMQ connection error:', error);
            });

            this.connection.on('close', async () => {
                this.logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
                await this.initialize();
            });
        } catch (error) {
            this.logger.error('Failed to initialize RabbitMQ connection:', error);
            throw error;
        }
    }

    private async cleanup() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log('RabbitMQ connections closed successfully');
        } catch (error) {
            this.logger.error('Error during RabbitMQ cleanup:', error);
        }
    }

    @Retry({
        maxAttempts: 3,
        delayMs: 1000,
        exponentialBackoff: true,
    })
    async publishNewsArticles(message: NewsMessage): Promise<void> {
        try {
            if (!this.channel) {
                throw new Error('RabbitMQ channel not initialized');
            }

            // Validate message before publishing
            try {
                NewsMessageValidator.validateMessage(message);
            } catch (validationError) {
                this.logger.error(`Message validation failed: ${validationError.message}`);

                // Store invalid messages for later analysis
                await this.handleInvalidMessage(message, validationError);
                return;
            }

            // Add to batch publisher
            await this.batchPublisher.addToBatch(this.channel, message);

            this.logger.log(
                `Added ${message.totalArticles} articles from ${message.portalName} to publishing batch`
            );
        } catch (error) {
            this.logger.error('Error during message publishing:', error);
            throw error;
        }
    }

    private async handleInvalidMessage(
        message: NewsMessage,
        error: ValidationError
    ): Promise<void> {
        // You can implement custom logic here, such as:
        // - Storing in a separate "dead letter" queue
        // - Saving to a database for analysis
        // - Sending notifications
        this.logger.warn({
            message: 'Invalid message detected',
            error: error.message,
            portalName: message.portalName,
            scrapedAt: message.scrapedAt,
            totalArticles: message.totalArticles,
        });
    }
}
