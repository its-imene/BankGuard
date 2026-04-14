import api from './api';

export const documentService = {
  uploadDocument: async (entityId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/evidence-document/upload/${entityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteDocument: async (id) => {
    const response = await api.delete(`/evidence-document/${id}`);
    return response.data;
  },
};

export default documentService;
