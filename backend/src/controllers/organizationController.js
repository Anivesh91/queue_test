const organizationService = require('../services/organizationService');
const ApiResponse = require('../utils/apiResponse');

const searchOrganizations = async (req, res, next) => {
  try {
    const { search, category, city } = req.query;
    const organizations = await organizationService.searchOrganizations({ search, category, city });
    res.status(200).json(new ApiResponse(200, { organizations }, 'Organizations fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const getOrganizationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const organization = await organizationService.getOrganizationBySlug(slug);
    res.status(200).json(new ApiResponse(200, { organization }, 'Organization details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    const org = await organizationService.createOrganization(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, { organization: org }, 'Organization created successfully'));
  } catch (error) {
    next(error);
  }
};

const getOwnerOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.getOwnerOrganization(req.user._id);
    res.status(200).json(new ApiResponse(200, { organization }, 'Owner organization fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const organization = await organizationService.updateOrganization(req.user._id, organizationId, req.body);
    res.status(200).json(new ApiResponse(200, { organization }, 'Organization updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchOrganizations,
  getOrganizationBySlug,
  createOrganization,
  getOwnerOrganization,
  updateOrganization,
};
