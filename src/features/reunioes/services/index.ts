import { api } from '@/services/api';
import { PaginatedResponse } from '@/types/pagination';
import { Meeting, CreateMeetingRequest, UpdateMeetingRequest } from '../types';

export const meetingService = {
  listMeetings: async (page = 0, size = 20): Promise<PaginatedResponse<Meeting>> => {
    const res = await api.get<PaginatedResponse<Meeting>>('/api/meetings', {
      params: { page, size, sort: 'date,asc' },
    });
    return res.data;
  },

  listMeetingsByEnterprise: async (enterpriseId: number): Promise<Meeting[]> => {
    const res = await api.get<Meeting[]>(`/api/meetings/enterprise/${enterpriseId}`);
    return res.data;
  },

  getMeetingById: async (id: number): Promise<Meeting> => {
    const res = await api.get<Meeting>(`/api/meetings/${id}`);
    return res.data;
  },

  createMeeting: async (data: CreateMeetingRequest): Promise<Meeting> => {
    const res = await api.post<Meeting>('/api/meetings', data);
    return res.data;
  },

  updateMeeting: async (id: number, data: UpdateMeetingRequest): Promise<Meeting> => {
    const res = await api.patch<Meeting>(`/api/meetings/${id}`, data);
    return res.data;
  },

  deleteMeeting: async (id: number): Promise<void> => {
    await api.delete(`/api/meetings/${id}`);
  },
};
