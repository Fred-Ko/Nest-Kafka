import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { KafkaClusterSymbol } from '@src/common';
import {
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachBatchHandler,
  EachMessageHandler,
  KafkaConfig,
} from 'kafkajs';

export interface KafkaConsumerConsumeOptions {
  symbol: KafkaClusterSymbol;
  topics: ConsumerSubscribeTopics;
  config: ConsumerConfig;
  onMessage: EachMessageHandler;
}

export interface KafkaConsumerBatchConsumeOptions {
  symbol: KafkaClusterSymbol;
  topics: ConsumerSubscribeTopics;
  config: ConsumerConfig;
  onBatch: EachBatchHandler;
}

export interface ConsumerServiceInterface extends OnApplicationShutdown, OnApplicationBootstrap {
  init(symbol: KafkaClusterSymbol, config: KafkaConfig): Promise<void>;
  consume(options: KafkaConsumerConsumeOptions): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
