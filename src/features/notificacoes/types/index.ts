export interface Notification {
  id: number;
  userId: number;
  userName: string;
  message: string;
  sentAt: string;
  type?: string;
}

export interface CreateNotificationRequest {
  userId: number;
  message: string;
  sentAt?: string;
  type?: string;
}

export interface UpdateNotificationRequest {
  userId?: number;
  message?: string;
  sentAt?: string;
  type?: string;
}
