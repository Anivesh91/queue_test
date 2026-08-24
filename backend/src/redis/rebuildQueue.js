const { getRedisClient, isRedisReady } = require('../config/redis');
const Ticket = require('../models/Ticket');
const Queue = require('../models/Queue');

/**
 * Rebuild Redis queue state from MongoDB durable source of truth
 */
const rebuildQueue = async (serviceId) => {
  if (!isRedisReady()) return;

  try {
    const client = getRedisClient();
    const listKey = `queue:${serviceId}:waiting`;
    const seqKey = `queue:${serviceId}:sequence`;

    // 1. Fetch waiting tickets from MongoDB sorted by sequenceNumber ASC
    const waitingTickets = await Ticket.find({
      serviceId,
      status: 'WAITING',
    })
      .sort({ sequenceNumber: 1 })
      .select('_id sequenceNumber');

    // 2. Fetch latest sequence number from queue document
    const queue = await Queue.findOne({ serviceId });

    // 3. Atomic reset in Redis
    const pipeline = client.pipeline();
    pipeline.del(listKey);

    if (waitingTickets.length > 0) {
      const ids = waitingTickets.map((t) => t._id.toString());
      pipeline.rpush(listKey, ...ids);
    }

    if (queue && queue.lastSequenceNumber !== undefined) {
      pipeline.set(seqKey, queue.lastSequenceNumber);
    }

    await pipeline.exec();
    console.log(`[Redis Rebuild] Successfully rebuilt queue for service ${serviceId} (${waitingTickets.length} waiting)`);
  } catch (error) {
    console.error(`[Redis Rebuild Error] Failed to rebuild queue for service ${serviceId}: ${error.message}`);
  }
};

module.exports = {
  rebuildQueue,
};
