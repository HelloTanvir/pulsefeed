import { Injectable, Logger } from '@nestjs/common';
import { Channel } from 'amqplib';
import { NewsMessage } from '../types/news.type';
import { RABBITMQ_CONFIG } from '../configs/rabbitmq.config';

@Injectable()
export class BatchPublisherService {
    private readonly logger = new Logger(BatchPublisherService.name);
    private readonly batchSize = 100; // Configurable batch size
    private readonly batchTimeout = 5000; // Timeout in milliseconds
    private batch: NewsMessage[] = [];
    private batchTimer: NodeJS.Timeout | null = null;

    async publishBatch(channel: Channel, messages: NewsMessage[]): Promise<void> {
        try {
            const buffer = Buffer.from(JSON.stringify(messages));

            await channel.publish(
                RABBITMQ_CONFIG.exchangeName,
                RABBITMQ_CONFIG.routingKey,
                buffer,
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    headers: {
                        messageCount: messages.length,
                        batchId: Date.now().toString(),
                    },
                }
            );

            this.logger.log(`Published batch of ${messages.length} messages`);
        } catch (error) {
            this.logger.error('Error publishing batch:', error);
            throw error;
        }
    }

    async addToBatch(channel: Channel, message: NewsMessage): Promise<void> {
        this.batch.push(message);

        if (this.batch.length >= this.batchSize) {
            await this.flushBatch(channel);
        } else if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.flushBatch(channel).catch((error) => {
                    this.logger.error('Error flushing batch:', error);
                });
            }, this.batchTimeout);
        }
    }

    async flushBatch(channel: Channel): Promise<void> {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        if (this.batch.length > 0) {
            const batchToPublish = [...this.batch];
            this.batch = [];
            await this.publishBatch(channel, batchToPublish);
        }
    }
}
