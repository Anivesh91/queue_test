const queueService = require('../services/queueService');
const ticketService = require('../services/ticketService');
const ApiResponse = require('../utils/apiResponse');

const getPublicQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const queueData = await queueService.getPublicQueue(serviceId);
    res.status(200).json(new ApiResponse(200, queueData, 'Public queue state fetched'));
  } catch (error) {
    next(error);
  }
};

const joinQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { name, phone } = req.body;
    const result = await ticketService.joinQueue(serviceId, { name, phone });
    res.status(201).json(new ApiResponse(201, result, 'Successfully joined queue'));
  } catch (error) {
    next(error);
  }
};

const getManageQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const result = await queueService.getManageQueue(req.user._id, serviceId);
    res.status(200).json(new ApiResponse(200, result, 'Manage queue state fetched'));
  } catch (error) {
    next(error);
  }
};

const openQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const queue = await queueService.openQueue(req.user._id, serviceId);
    res.status(200).json(new ApiResponse(200, { queue }, 'Queue opened successfully'));
  } catch (error) {
    next(error);
  }
};

const closeQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const queue = await queueService.closeQueue(req.user._id, serviceId);
    res.status(200).json(new ApiResponse(200, { queue }, 'Queue closed successfully'));
  } catch (error) {
    next(error);
  }
};

const callNext = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const result = await ticketService.callNextTicket(req.user._id, serviceId);
    res.status(200).json(new ApiResponse(200, result, 'Next customer called successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicQueue,
  joinQueue,
  getManageQueue,
  openQueue,
  closeQueue,
  callNext,
};
