import { SetMetadata } from '@nestjs/common';
import { KAFKA_CONSUMER_SERVICE, KafkaClusterSymbol } from '@src/common';
import { IKafkaConsumer, IKafkaConsumerService, KafkaConsumer, KafkaConsumerConsumeOptions } from '@src/consumer';
import { ConsumerConfig, ConsumerSubscribeTopics, Kafka, KafkaConfig } from 'kafkajs';

@SetMetadata(KAFKA_CONSUMER_SERVICE, KAFKA_CONSUMER_SERVICE)
export class KafkaConsumerService implements IKafkaConsumerService {
    private kafkaClient: Kafka;
    private kafkaClusterSymbol: KafkaClusterSymbol;

    private topicList: string[] = [];
    private consumers: IKafkaConsumer[] = [];
    private duplicateCheckTable: Set<string> = new Set<string>();

    private isInitialized: boolean;

    async init(symbol: KafkaClusterSymbol, config: KafkaConfig): Promise<void> {
        this.kafkaClusterSymbol = symbol;
        this.kafkaClient = new Kafka(config);

        this.isInitialized = true;
        this.topicList = await this.kafkaClient.admin().listTopics();
    }

    async consume(options: KafkaConsumerConsumeOptions): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Kafka Consumer Service is not initialized');
        }

        const { symbol, topics, config, consumerRunConfig } = options;

        if (this.kafkaClusterSymbol !== symbol) {
            throw new Error('Kafka Broker Symbol is not matched');
        }

        const consumer = await this.getOrCreateConsumer(topics, config);
        await consumer.onMessage(consumerRunConfig);
    }

    private async getOrCreateConsumer(topics: ConsumerSubscribeTopics, config: ConsumerConfig): Promise<IKafkaConsumer> {
        const consumerGroupId = config.groupId;
        const matchedTopics = await this.checkDuplicateTopic(topics, consumerGroupId);

        const consumer = new KafkaConsumer();
        await consumer.init(this.kafkaClient, { topics: matchedTopics, fromBeginning: topics.fromBeginning ?? false }, config);
        return consumer;
    }

    private async checkDuplicateTopic(consumerSubscribeTopics: ConsumerSubscribeTopics, consumerGroupId: string): Promise<string[]> {
        if (this.topicList.length === 0) throw new Error('TopicList is empty');
        if (this.isInitialized === false) throw new Error('Kafka Consumer Service is not initialized');

        const returnTopics: string[] = [];

        // topic,consumerGroupId pair가 유니크해야한다.
        const { topics } = consumerSubscribeTopics;

        topics.forEach((topic) => {
            if (typeof topic === 'string') {
                const matchedTopic = topic;
                const duplicateKey = `${matchedTopic}|${consumerGroupId}`;
                if (this.duplicateCheckTable.has(duplicateKey)) throw new Error('Duplicate Topic & Consumer Group Id Pair');
                this.duplicateCheckTable.add(duplicateKey);
                returnTopics.push(matchedTopic);
            }

            if (topic instanceof RegExp) {
                const matchedTopics = this.topicList.filter((topicName) => topic.test(topicName));
                matchedTopics.forEach((matchedTopic) => {
                    const duplicateKey = `${matchedTopic}|${consumerGroupId}`;
                    if (this.duplicateCheckTable.has(duplicateKey)) throw new Error('Duplicate Topic & Consumer Group Id Pair');
                    this.duplicateCheckTable.add(duplicateKey);
                    returnTopics.push(matchedTopic);
                });
            }

            throw new Error('Invalid ConsumerSubscribeTopics');
        });

        return returnTopics;
    }

    async onApplicationShutdown(signal?: string | undefined) {
        await Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
    }

    async onApplicationBootstrap() {
        await Promise.all(this.consumers.map((consumer) => consumer.connect()));
    }
}
