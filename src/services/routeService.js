import api from './api';

const getRoutes = async () => {
    const response = await api.get('/routes');
    return response.data;
};

const getRoute = async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
};

const createRoute = async (routeData) => {
    const response = await api.post('/routes', routeData);
    return response.data;
};

const updateRoute = async (id, routeData) => {
    const response = await api.put(`/routes/${id}`, routeData);
    return response.data;
};

const deleteRoute = async (id) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
};

const routeService = {
    getRoutes,
    getRoute,
    createRoute,
    updateRoute,
    deleteRoute
};

export default routeService;
