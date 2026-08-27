const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protectOwner } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  publicTokenValidator,
  mongoIdParamValidator,
} = require('../validators/schemas');

// Public lookup by phone (defined before :publicToken)
router.get('/lookup', ticketController.lookupTickets);

// Public tracking and guest cancellation
router.get('/:publicToken', publicTokenValidator, validate, ticketController.trackTicket);
router.post('/:publicToken/cancel', publicTokenValidator, validate, ticketController.cancelTicket);

// Owner operations on tickets
router.post('/:ticketId/start', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.startServing);
router.post('/:ticketId/complete', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.completeTicket);
router.post('/:ticketId/no-show', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.markNoShow);

module.exports = router;
