import api from './api';

const webhookService = {
  getTargets: () => api.get('/webhooks/targets'),
  createTarget: (data) => api.post('/webhooks/targets', data),
  updateTarget: (id, data) => api.put(`/webhooks/targets/${id}`, data),
  deleteTarget: (id) => api.delete(`/webhooks/targets/${id}`),
  getDeliveries: (targetId) => api.get('/webhooks/deliveries', { params: { targetId } }),
  testDelivery: (batchId, targetId) => api.post('/webhooks/test-delivery', { batchId, targetId }),
};

export default webhookService;
