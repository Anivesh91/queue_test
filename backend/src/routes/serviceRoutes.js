const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const queueController = require('../controllers/queueController');
const { protectOwner } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  updateServiceValidator,
  joinQueueValidator,
  mongoIdParamValidator,
} = require('../validators/schemas');

// Public Service details
router.get('/:serviceId', mongoIdParamValidator('serviceId'), validate, serviceController.getServiceById);

// Owner update & deactivate service
router.patch('/:serviceId', protectOwner, updateServiceValidator, validate, serviceController.updateService);
router.delete('/:serviceId', protectOwner, mongoIdParamValidator('serviceId'), validate, serviceController.deleteService);

// Queue endpoints for this service
router.get('/:serviceId/queue', mongoIdParamValidator('serviceId'), validate, queueController.getPublicQueue);
router.post('/:serviceId/queue/join', joinQueueValidator, validate, queueController.joinQueue);
router.get('/:serviceId/queue/manage', protectOwner, mongoIdParamValidator('serviceId'), validate, queueController.getManageQueue);
router.post('/:serviceId/queue/open', protectOwner, mongoIdParamValidator('serviceId'), validate, queueController.openQueue);
router.post('/:serviceId/queue/close', protectOwner, mongoIdParamValidator('serviceId'), validate, queueController.closeQueue);
router.post('/:serviceId/queue/call-next', protectOwner, mongoIdParamValidator('serviceId'), validate, queueController.callNext);

module.exports = router;
