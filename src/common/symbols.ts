// Declare the symbols
export const KAFKA_CLUSTER_1 = Symbol('KAFKA_CLUSTER_1');
export const KAFKA_CLUSTER_2 = Symbol('KAFKA_CLUSTER_2');
export const KAFKA_CLUSTER_3 = Symbol('KAFKA_CLUSTER_3');
export const KAFKA_CLUSTER_4 = Symbol('KAFKA_CLUSTER_4');
export const KAFKA_CLUSTER_5 = Symbol('KAFKA_CLUSTER_5');
export const KAFKA_CLUSTER_6 = Symbol('KAFKA_CLUSTER_6');
export const KAFKA_CLUSTER_7 = Symbol('KAFKA_CLUSTER_7');
export const KAFKA_CLUSTER_8 = Symbol('KAFKA_CLUSTER_8');
export const KAFKA_CLUSTER_9 = Symbol('KAFKA_CLUSTER_9');
export const KAFKA_CLUSTER_10 = Symbol('KAFKA_CLUSTER_10');

export const KAFKA_CONSUMER_SERVICE = Symbol('KAFKA_CONSUMER_SERVICE');
export const KAFKA_PRPDUCER_SERVICE = Symbol('KAFKA_PRPDUCER_SERVICE');
// Create a union type of the symbols
export type KafkaClusterSymbol =
  | typeof KAFKA_CLUSTER_1
  | typeof KAFKA_CLUSTER_2
  | typeof KAFKA_CLUSTER_3
  | typeof KAFKA_CLUSTER_4
  | typeof KAFKA_CLUSTER_5
  | typeof KAFKA_CLUSTER_6
  | typeof KAFKA_CLUSTER_7
  | typeof KAFKA_CLUSTER_8
  | typeof KAFKA_CLUSTER_9
  | typeof KAFKA_CLUSTER_10;
