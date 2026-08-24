const { getRedisClient, isRedisReady } = require('../config/redis');

/**
 * Push a ticket ID to the back of the waiting queue (FIFO RPUSH)
 */
const pushWaitingTicket = async (serviceId, ticketId) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const key = `queue:${serviceId}:waiting`;
    await client.rpush(key, ticketId.toString());
    return true;
  } catch (error) {
    console.warn(`[Redis pushWaitingTicket Warning] ${error.message}`);
    return null;
  }
};

/**
 * Pop the next ticket ID from the front of the waiting queue (FIFO LPOP)
 */
const popNextWaitingTicket = async (serviceId) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const key = `queue:${serviceId}:waiting`;
    const ticketId = await client.lpop(key);
    return ticketId;
  } catch (error) {
    console.warn(`[Redis popNextWaitingTicket Warning] ${error.message}`);
    return null;
  }
};

/**
 * Remove a specific ticket ID from the waiting queue (e.g. when customer cancels)
 */
const removeWaitingTicket = async (serviceId, ticketId) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const key = `queue:${serviceId}:waiting`;
    await client.lrem(key, 0, ticketId.toString());
    return true;
  } catch (error) {
    console.warn(`[Redis removeWaitingTicket Warning] ${error.message}`);
    return null;
  }
};

/**
 * Atomically increment sequence counter
 */
const getNextSequence = async (serviceId, initialSeq = 0) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const key = `queue:${serviceId}:sequence`;
    // If key does not exist yet, set it to initialSeq first
    const exists = await client.exists(key);
    if (!exists && initialSeq > 0) {
      await client.set(key, initialSeq);
    }
    const nextSeq = await client.incr(key);
    return nextSeq;
  } catch (error) {
    console.warn(`[Redis getNextSequence Warning] ${error.message}`);
    return null;
  }
};

/**
 * Get current waiting queue length
 */
const getWaitingCount = async (serviceId) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const key = `queue:${serviceId}:waiting`;
    const count = await client.llen(key);
    return count;
  } catch (error) {
    console.warn(`[Redis getWaitingCount Warning] ${error.message}`);
    return null;
  }
};

module.exports = {
  pushWaitingTicket,
  popNextWaitingTicket,
  removeWaitingTicket,
  getNextSequence,
  getWaitingCount,
};
