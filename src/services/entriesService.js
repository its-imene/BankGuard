import api from './api';

export const entriesService = {
  getEntriesByBlacklist: async (blacklistId) => {
    const response = await api.get(`/sanctioned-entity/${blacklistId}/entries`);
    return response.data;
  },

  createEntry: async (blacklistId, entryData) => {
    const response = await api.post(`/sanctioned-entity/${blacklistId}/entries`, entryData);
    return response.data;
  },

  updateEntry: async (id, entryData) => {
    const response = await api.patch(`/sanctioned-entity/entries/${id}`, entryData);
    return response.data;
  },

  deleteEntry: async (id) => {
    const response = await api.delete(`/sanctioned-entity/entries/${id}`);
    return response.data;
  },
};

export default entriesService;
