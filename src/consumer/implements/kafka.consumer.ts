import { IKafkaConsumer } from '@src/consumer';
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessagePayload,
  Kafka,
  Message,
} from 'kafkajs';

export class KafkaConsumer implements IKafkaConsumer {
  private consumer: Consumer;
  private topics: ConsumerSubscribeTopics;

  async init(kafka: Kafka, topics: ConsumerSubscribeTopics, config: ConsumerConfig): Promise<void> {
    this.consumer = kafka.consumer(config);
    this.topics = topics;

    await this.connect();
    await this.consumer.subscribe(topics);
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  async consumeEachMessage(
    onMessage: (payload: EachMessagePayload) => Promise<void>,
    errorCallback?: (message: Message, error: any) => Promise<void>,
  ): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await onMessage(payload);
        } catch (error) {
          if (errorCallback) {
            await errorCallback(payload.message, error);
          } else {
            throw error;
          }
        }
      },
    });
  }

  onApplicationShutdown(signal?: string | undefined) {
    // Implement the onApplicationShutdown logic here
  }

  onApplicationBootstrap() {
    // Implement the onApplicationBootstrap logic here
  }
}
