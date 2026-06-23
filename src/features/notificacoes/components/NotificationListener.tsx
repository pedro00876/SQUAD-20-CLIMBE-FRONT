import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';

export function NotificationListener() {
  useNotificationWebSocket();
  return null;
}
