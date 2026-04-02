import api from './api';

export const blacklistService = {
  getBlacklists: async () => {
    const response = await api.get('/sanctioned-entity');
    return response.data;
  },

  createBlacklist: async (data) => {
    const response = await api.post('/sanctioned-entity', data);
    return response.data;
  },

  updateBlacklist: async (id, data) => {
    const response = await api.patch(`/sanctioned-entity/${id}`, data);
    return response.data;
  },

  deleteBlacklist: async (id) => {
    const response = await api.delete(`/sanctioned-entity/${id}`);
    return response.data;
  },

  uploadBlacklist: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await api.post('/sanctioned-entity/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  bulkCreateBlacklist: async (payload) => {
    const response = await api.post('/sanctioned-entity/bulk', payload);
    return response.data;
  },

  getArchivedBlacklists: async () => {
    const response = await api.get('/sanctioned-entity/archived');
    return response.data;
  },

  restoreBlacklist: async (id) => {
    const response = await api.patch(`/sanctioned-entity/${id}/restore`);
    return response.data;
  },

  permanentDeleteBlacklist: async (id) => {
    const response = await api.delete(`/sanctioned-entity/${id}/permanent`);
    return response.data;
  },
};

export default blacklistService;
