import { KafkaClusterSymbol } from '@src/common';
import {
  ConsumerServiceInterface,
  IKafkaBatchConsumer,
  IKafkaConsumer,
  KafkaConsumerBatchConsumeOptions,
  KafkaConsumerConsumeOptions,
} from '@src/consumer';
import { Kafka, KafkaConfig } from 'kafkajs';

export class KafkaConsumerService implements ConsumerServiceInterface {
  private kafkaClient: Kafka;
  private kafkaClusterSymbol: KafkaClusterSymbol;

  private isInitialized: boolean;
  private isConsuming: boolean;
  private isConnecting: boolean;

  private kafkaConsumers: IKafkaConsumer[];
  private kafkaBatchConsumers: IKafkaBatchConsumer[];

  private duplicateCheckTable: Set<string>; // topic, groupId 쌍이 중복되는지 체크하기 위한 테이블

  async consume(options: KafkaConsumerConsumeOptions): Promise<void>;
  async consume(options: KafkaConsumerBatchConsumeOptions): Promise<void>;

  async init(symbol: KafkaClusterSymbol, config: KafkaConfig): Promise<void> {}
  async consume(options: KafkaConsumerConsumeOptions): Promise<void> {}
  async consume(options: KafkaConsumerBatchConsumeOptions): Promise<void> {}
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async onApplicationShutdown(signal?: string | undefined) {}
  async onApplicationBootstrap() {}

  private async testConnect() {}
  private async registerConsumerWithDuplicateCheck(
    topic: string | RegExp,
    groupId: string,
    consumer: IKafkaConsumer | IKafkaBatchConsumer,
  ): Promise<void> {
    // Topic is a RegExp
    if (topic instanceof RegExp) {
      // kafkaClient를 이용하여 현재 등록된 topic들 중 해당 RegExp에 매칭되는 topic들을 찾는다.
      const topics = await this.kafkaClient.admin().listTopics();
      const matchedTopics = topics.filter((t) => topic.test(t));

      if (matchedTopics.length > 0) {
        for (let matchedTopic of matchedTopics) {
          const matchedKey = `${matchedTopic}|${groupId}`;
          if (this.duplicateCheckTable.has(matchedKey)) {
            throw new Error(
              `The topic '${matchedTopic}' with group ID '${groupId}' is already in use.`,
            );
          }
          this.duplicateCheckTable.add(matchedKey);
        }

        if (checkBatchConsumer(consumer)) this.kafkaBatchConsumers.push(consumer);
      }
    }

    // Topic is a string
    if (typeof topic === 'string') {
      const matchedKey = `${topic}|${groupId}`;
      if (this.duplicateCheckTable.has(matchedKey)) {
        throw new Error(`The topic '${topic}' with group ID '${groupId}' is already in use.`);
      }

      this.duplicateCheckTable.add(matchedKey);
      if (checkConsumer(consumer)) this.kafkaConsumers.push(consumer);
    }
  }
}
