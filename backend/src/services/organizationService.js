const Organization = require('../models/Organization');
const Service = require('../models/Service');
const Queue = require('../models/Queue');
const ApiError = require('../utils/apiError');

const searchOrganizations = async ({ search, category, city }) => {
  const query = { isActive: true };

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (city) {
    query.city = { $regex: new RegExp(city.trim(), 'i') };
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { city: searchRegex },
      { address: searchRegex },
    ];
  }

  const organizations = await Organization.find(query)
    .sort({ createdAt: -1 })
    .lean();

  // Attach active services count and queues status summary for each org
  const orgIds = organizations.map((o) => o._id);
  const services = await Service.find({ organizationId: { $in: orgIds }, isActive: true }).lean();
  const serviceIds = services.map((s) => s._id);
  const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();

  const queueMap = {};
  queues.forEach((q) => {
    queueMap[q.serviceId.toString()] = q;
  });

  const servicesByOrg = {};
  services.forEach((s) => {
    const orgIdStr = s.organizationId.toString();
    if (!servicesByOrg[orgIdStr]) servicesByOrg[orgIdStr] = [];
    servicesByOrg[orgIdStr].push({
      ...s,
      queue: queueMap[s._id.toString()] || { status: 'CLOSED' },
    });
  });

  return organizations.map((org) => ({
    ...org,
    servicesCount: (servicesByOrg[org._id.toString()] || []).length,
    openQueuesCount: (servicesByOrg[org._id.toString()] || []).filter(
      (s) => s.queue && s.queue.status === 'OPEN'
    ).length,
    services: servicesByOrg[org._id.toString()] || [],
  }));
};

const getOrganizationBySlug = async (slug) => {
  const org = await Organization.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  if (!org) {
    throw new ApiError(404, 'Organization not found.');
  }

  const services = await Service.find({ organizationId: org._id, isActive: true }).lean();
  const serviceIds = services.map((s) => s._id);
  const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();

  const queueMap = {};
  queues.forEach((q) => {
    queueMap[q.serviceId.toString()] = q;
  });

  const servicesWithQueue = services.map((s) => ({
    ...s,
    queue: queueMap[s._id.toString()] || { status: 'CLOSED' },
  }));

  return {
    ...org,
    services: servicesWithQueue,
  };
};

const createOrganization = async (ownerId, data) => {
  const existingOrg = await Organization.findOne({ ownerId });
  if (existingOrg) {
    throw new ApiError(409, 'You already have a registered organization. Each owner is limited to 1 organization.');
  }

  const slug = Organization.generateSlug(data.name);

  const org = await Organization.create({
    ownerId,
    name: data.name,
    slug,
    category: data.category || 'OTHER',
    description: data.description || '',
    phone: data.phone || '',
    city: data.city || '',
    address: data.address || '',
    isActive: true,
  });

  return org;
};

const getOwnerOrganization = async (ownerId) => {
  const org = await Organization.findOne({ ownerId }).lean();
  if (!org) {
    return null;
  }

  const services = await Service.find({ organizationId: org._id }).lean();
  const serviceIds = services.map((s) => s._id);
  const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();

  const queueMap = {};
  queues.forEach((q) => {
    queueMap[q.serviceId.toString()] = q;
  });

  const servicesWithQueue = services.map((s) => ({
    ...s,
    queue: queueMap[s._id.toString()] || { status: 'CLOSED' },
  }));

  return {
    ...org,
    services: servicesWithQueue,
  };
};

const updateOrganization = async (ownerId, organizationId, updateData) => {
  const org = await Organization.findById(organizationId);
  if (!org) {
    throw new ApiError(404, 'Organization not found.');
  }

  if (org.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this organization.');
  }

  const allowedFields = ['name', 'category', 'description', 'phone', 'city', 'address', 'isActive'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      org[field] = updateData[field];
    }
  });

  await org.save();
  return org;
};

module.exports = {
  searchOrganizations,
  getOrganizationBySlug,
  createOrganization,
  getOwnerOrganization,
  updateOrganization,
};
