import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { KafkaClusterSymbol } from '@src/common';
import { ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics, KafkaConfig } from 'kafkajs';

export interface KafkaConsumerConsumeOptions {
    symbol: KafkaClusterSymbol;
    topics: ConsumerSubscribeTopics;
    config: ConsumerConfig;
    consumerRunConfig: ConsumerRunConfig;
}

export interface IKafkaConsumerService extends OnApplicationShutdown, OnApplicationBootstrap {
    init(symbol: KafkaClusterSymbol, config: KafkaConfig): Promise<void>;
    consume(options: KafkaConsumerConsumeOptions): Promise<void>;
}
