const serviceService = require('../services/serviceService');
const ApiResponse = require('../utils/apiResponse');

const getOrganizationServices = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const services = await serviceService.getOrganizationServices(organizationId);
    res.status(200).json(new ApiResponse(200, { services }, 'Services fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await serviceService.getServiceById(serviceId);
    res.status(200).json(new ApiResponse(200, { service }, 'Service fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const service = await serviceService.createService(req.user._id, organizationId, req.body);
    res.status(201).json(new ApiResponse(201, { service }, 'Service and queue created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await serviceService.updateService(req.user._id, serviceId, req.body);
    res.status(200).json(new ApiResponse(200, { service }, 'Service updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const result = await serviceService.deactivateService(req.user._id, serviceId);
    res.status(200).json(new ApiResponse(200, result, 'Service deactivated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizationServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
