export const RABBITMQ_CONFIG = {
    queueName: 'news_articles',
    exchangeName: 'news_exchange',
    routingKey: 'news.scrape',
    url: 'amqp://localhost:5672',
};
