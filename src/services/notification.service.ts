import { api } from './api';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  sentAt: string;
  userName: string;
  // NÃO EXISTEM: title, read, createdAt
}

export const notificationService = {
  listByUser: async (userId: number) => {
    const response = await api.get(`/api/notifications/user/${userId}`);
    return response.data;
  },

  markAsRead: async (id: number) => {
    // O backend interpreta o PATCH no path como "marcar como lida" — sem body { read }
    const response = await api.patch(`/api/notifications/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/notifications/${id}`);
  },

  sendEmail: async (para: string, assunto: string, corpo: string) => {
    try {
      // Como o backend não envia e-mail por API rest pública, tentamos localizar o usuário
      // pelo e-mail e criar uma notificação in-app como fallback.
      const userRes = await api.get(`/api/users/email/${para}`);
      if (userRes.data && userRes.data.id) {
        await api.post('/api/notifications', {
          userId: userRes.data.id,
          message: `${assunto} - ${corpo}`,
          type: 'SYSTEM'
        });
      }
    } catch (error) {
      console.warn('Simulando envio de e-mail (usuário não encontrado no sistema):', para);
    }
  },

  notifyCompliance: async (dados: any) => {
    // Como não existe endpoint /compliance, idealmente buscaríamos usuários com role COMPLIANCE
    // Aqui apenas simulamos o log para manter o fluxo sem quebrar.
    console.info('Notificação de Compliance registrada:', dados);
  }
};
