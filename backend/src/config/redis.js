const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully');
    }).catch((err) => {
      isRedisConnected = false;
      console.warn(`[Redis] Connection failed (${err.message}). Falling back to durable MongoDB queue state.`);
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        console.warn(`[Redis Error] ${err.message}`);
      }
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });
  } catch (error) {
    isRedisConnected = false;
    console.warn(`[Redis Init Warning] ${error.message}. Running without Redis caching.`);
  }

  return redisClient;
};

const getRedisClient = () => redisClient;
const isRedisReady = () => isRedisConnected && redisClient && redisClient.status === 'ready';

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady,
};
