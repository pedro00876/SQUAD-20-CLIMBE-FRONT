import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '@/config/env';
import type { Notification } from '../types';

type NotificationHandler = (notification: Notification) => void;
type ErrorHandler = (error: unknown) => void;

let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;
let notificationHandler: NotificationHandler | null = null;

function getWsUrl(): string {
  return `${env.apiUrl}/ws-notifications`;
}

function parseNotification(body: string): Notification | null {
  try {
    const parsed = JSON.parse(body) as Notification;
    if (typeof parsed.id !== 'number' || typeof parsed.message !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    console.warn('[notifications-ws] Payload inválido:', body);
    return null;
  }
}

export function connectNotifications(
  onNotification: NotificationHandler,
  onError?: ErrorHandler,
) {
  notificationHandler = onNotification;

  if (stompClient?.active) {
    return;
  }

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(getWsUrl(), null, {
        withCredentials: true,
      }),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      subscription?.unsubscribe();
      subscription = stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
        const notification = parseNotification(message.body);
        if (notification) {
          notificationHandler?.(notification);
        }
      }) ?? null;
    },

    onStompError: (frame) => {
      console.error('[notifications-ws] Erro STOMP:', frame.headers.message, frame.body);
      onError?.(frame);
    },

    onWebSocketError: (event) => {
      console.error('[notifications-ws] Erro WebSocket:', event);
      onError?.(event);
    },
  });

  stompClient.activate();
}

export function disconnectNotifications() {
  subscription?.unsubscribe();
  subscription = null;
  notificationHandler = null;

  if (stompClient) {
    void stompClient.deactivate();
    stompClient = null;
  }
}

export function isNotificationsConnected(): boolean {
  return stompClient?.connected ?? false;
}
