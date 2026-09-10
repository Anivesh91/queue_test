const Organization = require('../models/Organization');
const Service = require('../models/Service');
const Queue = require('../models/Queue');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const organization = await Organization.findOne({ ownerId }).lean();
  if (!organization) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasOrganization: false,
          organization: null,
          stats: {
            waitingNow: 0,
            currentlyServing: 0,
            openQueues: 0,
            totalServices: 0,
          },
          serviceQueues: [],
        },
        'No organization created yet'
      )
    );
  }

  const services = await Service.find({ organizationId: organization._id }).lean();
  const serviceIds = services.map((s) => s._id);

  const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();
  const queueMap = {};
  queues.forEach((q) => {
    queueMap[q.serviceId.toString()] = q;
  });

  const serviceQueues = await Promise.all(
    services.map(async (srv) => {
      const srvIdStr = srv._id.toString();
      const q = queueMap[srvIdStr] || { status: 'CLOSED', currentTicketId: null };

      const waitingCount = await Ticket.countDocuments({
        serviceId: srv._id,
        status: 'WAITING',
      });

      let currentTicket = null;
      if (q.currentTicketId) {
        currentTicket = await Ticket.findById(q.currentTicketId).lean();
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const completedToday = await Ticket.countDocuments({
        serviceId: srv._id,
        status: 'COMPLETED',
        completedAt: { $gte: todayStart },
      });

      return {
        service: srv,
        queue: q,
        status: q.status || 'CLOSED',
        waitingCount,
        currentTicket,
        completedToday,
        estimatedWaitTime: waitingCount * (srv.averageServiceTime || 10),
      };
    })
  );

  const waitingNow = serviceQueues.reduce((acc, curr) => acc + curr.waitingCount, 0);
  const currentlyServing = serviceQueues.filter(
    (sq) => sq.currentTicket && ['CALLED', 'SERVING'].includes(sq.currentTicket.status)
  ).length;
  const openQueues = serviceQueues.filter((sq) => sq.status === 'OPEN').length;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hasOrganization: true,
        organization,
        stats: {
          waitingNow,
          currentlyServing,
          openQueues,
          totalServices: services.length,
        },
        serviceQueues,
      },
      'Dashboard metrics fetched'
    )
  );
});

module.exports = {
  getOwnerDashboard,
};
