const ticketService = require('../services/ticketService');
const ApiResponse = require('../utils/apiResponse');

const trackTicket = async (req, res, next) => {
  try {
    const { publicToken } = req.params;
    const data = await ticketService.trackTicket(publicToken);
    res.status(200).json(new ApiResponse(200, data, 'Ticket details fetched'));
  } catch (error) {
    next(error);
  }
};

const cancelTicket = async (req, res, next) => {
  try {
    const { publicToken } = req.params;
    const result = await ticketService.cancelTicket(publicToken);
    res.status(200).json(new ApiResponse(200, result, 'Ticket cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

const startServing = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await ticketService.startServingTicket(req.user._id, ticketId);
    res.status(200).json(new ApiResponse(200, { ticket }, 'Started serving ticket'));
  } catch (error) {
    next(error);
  }
};

const completeTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await ticketService.completeTicket(req.user._id, ticketId);
    res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket marked as completed'));
  } catch (error) {
    next(error);
  }
};

const markNoShow = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await ticketService.markNoShowTicket(req.user._id, ticketId);
    res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket marked as no-show'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackTicket,
  cancelTicket,
  startServing,
  completeTicket,
  markNoShow,
};
