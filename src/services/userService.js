import api from './api';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/user', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.patch(`/user/${id}`, userData);
    return response.data;
  },

  getInviteLink: async (id) => {
    const response = await api.get(`/user/${id}/invite-link`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
};

export default userService;
