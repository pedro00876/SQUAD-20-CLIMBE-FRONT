import { api } from '@/services/api';

export interface MeetingCreateRequest {
  enterpriseId: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  inPerson: boolean;
  location?: string;
  agenda?: string;
  status?: string;
  participantIds: number[];
}

export interface MeetingDTO {
  id: number;
  enterpriseId: number;
  enterpriseName?: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  inPerson: boolean;
  location?: string;
  agenda?: string;
  status: string;
  participantIds: number[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MeetingListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const meetingService = {
  createMeeting: async (data: MeetingCreateRequest): Promise<MeetingDTO> => {
    const res = await api.post<MeetingDTO>('/api/meetings', data);
    return res.data;
  },
  listMeetings: async (params: MeetingListParams = {}): Promise<PaginatedResponse<MeetingDTO>> => {
    const res = await api.get<PaginatedResponse<MeetingDTO>>('/api/meetings', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'date,asc',
      },
    });

    return res.data;
  },
  listMeetingsByEnterprise: async (enterpriseId: number): Promise<MeetingDTO[]> => {
    const res = await api.get<MeetingDTO[]>(`/api/meetings/enterprise/${enterpriseId}`);
    return res.data;
  },
  getMeetingById: async (id: number): Promise<MeetingDTO> => {
    const res = await api.get<MeetingDTO>(`/api/meetings/${id}`);
    return res.data;
  },
};
