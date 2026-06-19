export interface Meeting {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
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

export interface CreateMeetingRequest {
  enterpriseId: number;
  title: string;
  date?: string;
  time?: string;
  endTime?: string;
  inPerson?: boolean;
  location?: string;
  agenda?: string;
  status?: string;
  participantIds?: number[];
}

export interface UpdateMeetingRequest {
  enterpriseId?: number;
  title?: string;
  date?: string;
  time?: string;
  endTime?: string;
  inPerson?: boolean;
  location?: string;
  agenda?: string;
  status?: string;
  participantIds?: number[];
}
