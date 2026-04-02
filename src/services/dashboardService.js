import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/sanctioned-entity/stats');
    return response.data;
  },
};

export default dashboardService;
