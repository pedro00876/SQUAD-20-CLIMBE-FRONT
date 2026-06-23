import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  connectNotifications,
  disconnectNotifications,
} from '../services/notification-ws';
import type { Notification } from '../types';
import { getNotificationToastTitle } from '../config/notification-types';

const NOTIFICATIONS_QUERY_KEY = 'notifications';

export function useNotificationWebSocket() {
  const { user, isPending } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = user?.id ? Number(user.id) : null;
  const shouldConnect = Boolean(userId) && !isPending;

  useEffect(() => {
    if (!shouldConnect || !userId) {
      disconnectNotifications();
      return;
    }

    const handleNotification = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(
        [NOTIFICATIONS_QUERY_KEY, userId],
        (old = []) => {
          if (old.some((item) => item.id === notification.id)) {
            return old;
          }
          return [notification, ...old];
        },
      );

      const title = getNotificationToastTitle(notification.type);
      const preview =
        notification.message.length > 120
          ? `${notification.message.slice(0, 120)}…`
          : notification.message;

      toast.info(title, { description: preview });
    };

    connectNotifications(handleNotification);

    return () => {
      disconnectNotifications();
    };
  }, [shouldConnect, userId, queryClient]);
}
