import api from './api';

export const profileService = {
  // Individual Profile
  getIndividualProfile: async (entityProfileId) => {
    // Note: The backend likely has a specific endpoint or we find it via EntityProfile
    const response = await api.get(`/individual-profile`, { params: { entityProfileId } });
    return response.data?.[0]; // Assuming it returns an array
  },
  createIndividualProfile: async (data) => {
    const response = await api.post(`/individual-profile`, data);
    return response.data;
  },
  updateIndividualProfile: async (id, data) => {
    const response = await api.patch(`/individual-profile/${id}`, data);
    return response.data;
  },

  // Organization Profile
  getOrganizationProfile: async (entityProfileId) => {
    const response = await api.get(`/organization-profile`, { params: { entityProfileId } });
    return response.data?.[0];
  },
  createOrganizationProfile: async (data) => {
    const response = await api.post(`/organization-profile`, data);
    return response.data;
  },
  updateOrganizationProfile: async (id, data) => {
    const response = await api.patch(`/organization-profile/${id}`, data);
    return response.data;
  },

  // Generic Entity Profile Update (to switch types)
  updateEntityType: async (id, type) => {
    const response = await api.patch(`/sanctioned-entity/entries/${id}`, { entityType: type });
    return response.data;
  }
};

export default profileService;
