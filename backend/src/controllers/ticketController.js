const ticketService = require('../services/ticketService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const trackTicket = asyncHandler(async (req, res) => {
  const { publicToken } = req.params;
  const data = await ticketService.trackTicket(publicToken);
  res.status(200).json(new ApiResponse(200, data, 'Ticket details fetched'));
});

const lookupTickets = asyncHandler(async (req, res) => {
  const { phone } = req.query;
  const result = await ticketService.lookupActiveTicketsByPhone(phone);
  res.status(200).json(new ApiResponse(200, result, 'Active tickets retrieved'));
});

const cancelTicket = asyncHandler(async (req, res) => {
  const { publicToken } = req.params;
  const result = await ticketService.cancelTicket(publicToken);
  res.status(200).json(new ApiResponse(200, result, 'Ticket cancelled successfully'));
});

const startServing = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await ticketService.startServingTicket(req.user._id, ticketId);
  res.status(200).json(new ApiResponse(200, { ticket }, 'Started serving ticket'));
});

const completeTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await ticketService.completeTicket(req.user._id, ticketId);
  res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket marked as completed'));
});

const markNoShow = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await ticketService.markNoShowTicket(req.user._id, ticketId);
  res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket marked as no-show'));
});

module.exports = {
  trackTicket,
  lookupTickets,
  cancelTicket,
  startServing,
  completeTicket,
  markNoShow,
};
