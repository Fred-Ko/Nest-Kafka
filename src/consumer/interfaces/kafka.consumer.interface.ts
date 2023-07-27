import { ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka, Message } from 'kafkajs';

export interface IKafkaConsumer {
    init(client: Kafka, topics: ConsumerSubscribeTopics, config: ConsumerConfig): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    onMessage(consumerRunConfig: ConsumerRunConfig, errorCallback?: (message: Message, error: any) => Promise<void>): Promise<void>;
}
