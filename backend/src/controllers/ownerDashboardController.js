const Organization = require('../models/Organization');
const Service = require('../models/Service');
const Queue = require('../models/Queue');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/apiResponse');

const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // 1. Fetch organization
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

    // 2. Fetch all services under this organization
    const services = await Service.find({ organizationId: organization._id }).lean();
    const serviceIds = services.map((s) => s._id);

    // 3. Fetch queues for these services
    const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();
    const queueMap = {};
    queues.forEach((q) => {
      queueMap[q.serviceId.toString()] = q;
    });

    // 4. Fetch waiting counts and current serving tickets for each service
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

    // 5. Aggregate stats
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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
};
