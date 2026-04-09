export interface Reuniao {
  id?: number;
  enterpriseId: number;
  enterpriseName?: string;
  title: string;
  date?: string;
  time?: string;
  inPerson?: boolean;
  location?: string;
  agenda?: string;
  status?: string;
  participantIds?: number[];
}

export interface ReuniaoFormValues {
  enterpriseId: string;
  title: string;
  date: string;
  time: string;
  inPerson: boolean;
  location: string;
  agenda: string;
  status: string;
  participantIds: string[];
}
