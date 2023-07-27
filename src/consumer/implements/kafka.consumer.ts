import { IKafkaConsumer } from '@src/consumer';
import { Consumer, ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from 'kafkajs';

export class KafkaConsumer implements IKafkaConsumer {
    private consumer: Consumer;
    private topics: ConsumerSubscribeTopics;
    private isInitialized: boolean;

    async init(kafka: Kafka, topics: ConsumerSubscribeTopics, config: ConsumerConfig): Promise<void> {
        this.consumer = kafka.consumer(config);
        this.topics = topics;
        this.isInitialized = false;
    }

    async connect(): Promise<void> {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe(this.topics);
            this.isInitialized = true;
        } catch (error) {
            throw new Error('Kafka Consumer Connection Failed');
        }
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
        this.isInitialized = false;
    }

    async onMessage(consumerRunConfig: ConsumerRunConfig): Promise<void> {
        await this.consumer.run(consumerRunConfig);
    }
}
