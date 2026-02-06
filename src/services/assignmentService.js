import api from './api';

const assignmentService = {
    getAll: async (params) => {
        const response = await api.get('/assignments', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/assignments/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/assignments', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/assignments/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    },

    getByClass: async (classId) => {
        const response = await api.get('/assignments', { params: { assignedClass: classId } });
        return response.data;
    },

    getMyAssignments: async () => {
        const response = await api.get('/assignments/my');
        return response.data;
    }
};

export default assignmentService;
