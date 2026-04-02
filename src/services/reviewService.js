import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    // reviewData: { sanctionedEntityId, reviewerId, decision, comment }
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getReviews: async () => {
    const response = await api.get('/reviews');
    return response.data;
  },

  getReview: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
