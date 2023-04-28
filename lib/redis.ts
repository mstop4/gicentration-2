/* eslint-disable no-console */
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redisClient: RedisClientType;
let isReady = false;

async function getCache(): Promise<RedisClientType> {
  if (!isReady) {
    redisClient = createClient({
      url: `redis://${process.env.REDIS_SERVER_URL}`,
    });
    redisClient.on('error', err => console.log(`Redis Error: ${err}`));
    redisClient.on('connect', () => console.log('Redis connected'));
    redisClient.on('reconnecting', () => console.log('Redis reconnecting'));
    redisClient.on('ready', () => {
      isReady = true;
      console.log('Redis ready!');
    });
    await redisClient.connect();
  }
  return redisClient;
}

getCache()
  .then(client => {
    redisClient = client;
  })
  .catch(err => {
    console.log({ err }, 'Failed to connect to Redis');
  });

export { getCache };
