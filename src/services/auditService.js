import api from './api';

export const auditService = {
  getAuditLogs: async () => {
    const response = await api.get('/audit-log');
    return response.data;
  },
};

export default auditService;
