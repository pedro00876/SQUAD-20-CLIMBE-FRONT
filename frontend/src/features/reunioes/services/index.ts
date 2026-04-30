import { api } from '@/services/api';

export interface MeetingDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

export const meetingService = {
  scheduleMeeting: async (data: MeetingDTO): Promise<any> => {
    const res = await api.post('/api/meetings', data);
    return res.data;
  },
};
