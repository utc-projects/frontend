import api from './api';

const courseService = {
    getAll: async () => {
        const response = await api.get('/courses');
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/courses', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/courses/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    }
};

export default courseService;
