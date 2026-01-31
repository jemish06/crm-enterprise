const Redis = require('ioredis');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
  }

  connect() {
    try {
      this.client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      this.client.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      return this.client;
    } catch (error) {
      logger.error('Redis initialization failed:', error);
      return null;
    }
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expiresIn = 3600) {
    try {
      await this.client.setex(key, expiresIn, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async flush() {
    if (process.env.NODE_ENV === 'test') {
      await this.client.flushall();
    }
  }
}

module.exports = new RedisClient();
