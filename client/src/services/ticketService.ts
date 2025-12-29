import api from './api';

export const getTicketComments = async (ticketId: string) => {
  const res = await api.get(`/tickets/${ticketId}/comments`);
  return res.data;
};

export const addTicketComment = async (ticketId: string, content: string) => {
  const res = await api.post(`/tickets/${ticketId}/comments`, { content });
  return res.data;
};