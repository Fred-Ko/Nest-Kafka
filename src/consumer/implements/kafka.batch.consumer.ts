import { IKafkaBatchConsumer } from '@src/consumer';
import {
  Batch,
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  Kafka,
} from 'kafkajs';

export class KafkaBatchConsumer implements IKafkaBatchConsumer {
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

  async consumeEachBatch(
    onBatch: (payload: EachBatchPayload) => Promise<void>,
    errorCallback?: (batch: Batch, error: any) => Promise<void>,
  ): Promise<void> {
    await this.consumer.run({
      eachBatchAutoResolve: true,
      eachBatch: async (payload) => {
        try {
          await onBatch(payload);
        } catch (error) {
          if (errorCallback) {
            await errorCallback(payload.batch, error);
          } else {
            throw error;
          }
        }
      },
    });
  }

  // Implement the other methods as needed

  onApplicationShutdown(signal?: string | undefined) {
    // Implement the onApplicationShutdown logic here
  }

  onApplicationBootstrap() {
    // Implement the onApplicationBootstrap logic here
  }
}
