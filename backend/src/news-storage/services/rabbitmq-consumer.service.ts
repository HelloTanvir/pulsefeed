import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { NewsStorageService } from './news-storage.service';
import { RABBITMQ_CONFIG } from 'src/scraper/configs/rabbitmq.config';
import { Retry } from 'src/scraper/decorators/retry.decorator';
import { NewsMessage } from 'src/scraper/types/news.type';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQConsumerService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    constructor(private readonly newsStorageService: NewsStorageService) {}

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
            this.connection = await amqp.connect(RABBITMQ_CONFIG.url);
            this.channel = await this.connection.createChannel();

            await this.channel.assertQueue(RABBITMQ_CONFIG.queueName, { durable: true });
            await this.channel.prefetch(10); // Process 10 messages at a time

            this.logger.log('RabbitMQ consumer initialized successfully');

            await this.startConsuming();
        } catch (error) {
            this.logger.error('Failed to initialize RabbitMQ consumer:', error);
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
        } catch (error) {
            this.logger.error('Error during RabbitMQ consumer cleanup:', error);
        }
    }

    private async startConsuming() {
        try {
            await this.channel.consume(
                RABBITMQ_CONFIG.queueName,
                async (msg) => {
                    if (!msg) {
                        return;
                    }

                    try {
                        const message: NewsMessage = JSON.parse(msg.content.toString());
                        await this.newsStorageService.storeNewsArticles(message);
                        await this.channel.ack(msg);
                    } catch (error) {
                        this.logger.error('Error processing message:', error);

                        // Check if message should be requeued or sent to dead letter queue
                        if (this.shouldRequeueMessage(msg)) {
                            await this.channel.nack(msg, false, true);
                        } else {
                            await this.handleFailedMessage(msg);
                            await this.channel.nack(msg, false, false);
                        }
                    }
                },
                {
                    noAck: false, // Enable manual acknowledgment
                }
            );

            this.logger.log('Started consuming messages from RabbitMQ');
        } catch (error) {
            this.logger.error('Error starting message consumption:', error);
            throw error;
        }
    }

    private shouldRequeueMessage(msg: amqp.ConsumeMessage): boolean {
        const retryCount = this.getRetryCount(msg);
        return retryCount < 3; // Allow up to 3 retries
    }

    private getRetryCount(msg: amqp.ConsumeMessage): number {
        const death = msg.properties.headers?.['x-death'];
        return death ? death[0]?.count || 0 : 0;
    }

    private async handleFailedMessage(msg: amqp.ConsumeMessage): Promise<void> {
        // Implement dead letter queue logic here
        this.logger.warn('Message exceeded retry limit:', {
            messageId: msg.properties.messageId,
            content: msg.content.toString(),
        });
    }
}
