import { Inject, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { KAFKA_CONSUMER_SERVICE, KafkaClusterSymbol } from '@src/common';
import { IKafkaConsumerService } from '@src/consumer';
import { Aspect, LazyDecorator, WrapParams, createDecorator } from '@toss/nestjs-aop';
import { ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics, EachBatchHandler, EachMessageHandler } from 'kafkajs';

type KafkaConsumerOptions = {
    kafkaClusterSymbol: KafkaClusterSymbol;
    topics: ConsumerSubscribeTopics;
    config: ConsumerConfig;
    consumerRunConfig: ConsumerRunConfig;
};

const KAFKA_CONSUMER = Symbol('KAFKA_CONSUMER');

export const KafkaConsumerDecorator = (options: KafkaConsumerOptions) => createDecorator(KAFKA_CONSUMER, options);

@Aspect(KAFKA_CONSUMER)
export class KafkaConsumerDecoratorImpl implements LazyDecorator<any, KafkaConsumerOptions>, OnModuleInit {
    private consumerServices: Map<KafkaClusterSymbol, IKafkaConsumerService> = new Map();

    constructor(@Inject(DiscoveryService) private readonly discoveryService: DiscoveryService) {}

    async onModuleInit() {
        this.consumerServices = await this.getConsumerServices();
    }

    async wrap({ method, metadata }: WrapParams<EachMessageHandler | EachBatchHandler, KafkaConsumerOptions>) {
        const { kafkaClusterSymbol, topics, config, consumerRunConfig } = metadata;

        const consumerService = this.consumerServices.get(kafkaClusterSymbol);
        if (!consumerService) {
            throw new Error(`ConsumerService for symbol ${kafkaClusterSymbol.toString()} not found.`);
        }

        await consumerService.consume({
            symbol: kafkaClusterSymbol,
            topics,
            config,
            consumerRunConfig,
        });

        return method;
    }

    private async getConsumerServices(): Promise<Map<KafkaClusterSymbol, IKafkaConsumerService>> {
        const providers = this.discoveryService.getProviders();
        const consumerServices = new Map<KafkaClusterSymbol, IKafkaConsumerService>();

        for (const provider of providers) {
            const consumerSymbol = Reflect.getMetadata(KAFKA_CONSUMER_SERVICE, provider.metatype);
            if (consumerSymbol) {
                const consumerService: IKafkaConsumerService = provider.instance;
                consumerServices.set(consumerSymbol.kafkaClusterSymbol, consumerService);
            }
        }

        return consumerServices;
    }
}
