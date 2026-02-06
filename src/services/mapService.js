import api from './api';

// Get all tourism points as GeoJSON
export const getPoints = async (params = {}) => {
  const response = await api.get('/points', { params });
  return response.data;
};

// Get points by category
export const getPointsByCategory = async (category) => {
  const response = await api.get(`/points/category/${category}`);
  return response.data;
};

// Get all tourism routes
export const getRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

// Get single route with details
export const getRouteById = async (id) => {
  const response = await api.get(`/routes/${id}`);
  return response.data;
};

// Get route as GeoJSON LineString
export const getRouteGeoJSON = async (id) => {
  const response = await api.get(`/routes/${id}/geojson`);
  return response.data;
};

// Get all routes as GeoJSON
export const getAllRoutesGeoJSON = async () => {
  const response = await api.get('/routes/geojson');
  return response.data;
};

// Get all providers as GeoJSON
export const getProviders = async (params = {}) => {
  const response = await api.get('/providers', { params });
  return response.data;
};

// Get providers by service type
export const getProvidersByType = async (serviceType, subType = null) => {
  const params = subType ? { subType } : {};
  const response = await api.get(`/providers/type/${serviceType}`, { params });
  return response.data;
};

// Get providers by sub-type
export const getProvidersBySubType = async (subType) => {
  const response = await api.get(`/providers/subtype/${subType}`);
  return response.data;
};

// Get providers by route (for route-based suggestions)
export const getProvidersByRoute = async (routeId, params = {}) => {
  const response = await api.get(`/providers/route/${routeId}`, { params });
  return response.data;
};

// Get service types with counts (legacy)
export const getServiceTypes = async () => {
  const response = await api.get('/providers/types');
  return response.data;
};

// Get categories with sub-types (for multi-level filter)
export const getServiceCategories = async () => {
  const response = await api.get('/providers/categories');
  return response.data;
};

export default {
  getPoints,
  getPointsByCategory,
  getRoutes,
  getRouteById,
  getRouteGeoJSON,
  getAllRoutesGeoJSON,
  getProviders,
  getProvidersByType,
  getProvidersBySubType,
  getProvidersByRoute,
  getServiceTypes,
  getServiceCategories,
};
