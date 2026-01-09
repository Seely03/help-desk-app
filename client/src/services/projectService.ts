import api from './api';

export const removeMemberFromProject = async (projectId: string, userId: string) => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};