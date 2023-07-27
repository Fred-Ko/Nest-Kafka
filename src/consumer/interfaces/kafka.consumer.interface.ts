import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Batch, EachBatchPayload, EachMessagePayload, Message } from 'kafkajs';

export interface IKafkaConsumerCommon extends OnApplicationShutdown, OnApplicationBootstrap {
  init(kafka: any, topics: any, config: any): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface IKafkaConsumer extends IKafkaConsumerCommon {
  consumeEachMessage(
    onMessage: (payload: EachMessagePayload) => Promise<void>,
    errorCallback?: (message: Message, error: any) => Promise<void>,
  ): Promise<void>;
}

export interface IKafkaBatchConsumer extends IKafkaConsumerCommon {
  consumeEachBatch(
    onBatch: (payload: EachBatchPayload) => Promise<void>,
    errorCallback?: (batch: Batch, error: any) => Promise<void>,
  ): Promise<void>;
}
