import { Bell, Check, CheckCircle2, Clock, Loader2, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { notificationService, type Notification } from '@/services/notification.service';

const notificationTypeLabels: Record<string, string> = {
  ACCESS_REQUEST: 'Solicitacao de acesso',
  TEAM_ASSIGNMENT: 'Equipe',
  RESPONSIBLE_ANALYST_ASSIGNED: 'Analista',
  ALL_DOCUMENTS_APPROVED: 'Documentos aprovados',
  CONTRACT_CHANGE: 'Contrato',
  MEETING: 'Reuniao',
};

export function NotificacoesPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? notificationService.listByUser(Number(user.id)) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadNotifications = notifications.filter((notification: Notification) => !notification.read);
  const visibleNotifications = filter === 'unread' ? unreadNotifications : notifications;

  const markAllAsRead = () => {
    unreadNotifications.forEach((notification: Notification) => {
      markAsReadMutation.mutate(notification.id);
    });
  };

  const getTypeLabel = (type?: string) => {
    if (!type) return 'Notificacao';
    return notificationTypeLabels[type] || type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Bell size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Social</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Notificações</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Fique por dentro de todas as atualizações de propostas, reuniões e interações de usuários.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                filter === 'all' ? 'bg-climbe-secondary text-white' : 'text-gray-400 hover:text-climbe-secondary'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                filter === 'unread' ? 'bg-climbe-secondary text-white' : 'text-gray-400 hover:text-climbe-secondary'
              }`}
            >
              Não lidas ({unreadNotifications.length})
            </button>
          </div>

          <Button
            type="button"
            disabled={unreadNotifications.length === 0 || markAsReadMutation.isPending}
            onClick={markAllAsRead}
            className="rounded-2xl bg-climbe-primary px-5 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Marcar todas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</p>
          <strong className="mt-2 block text-3xl font-black italic text-climbe-secondary">{notifications.length}</strong>
        </div>
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Não lidas</p>
          <strong className="mt-2 block text-3xl font-black italic text-climbe-primary">{unreadNotifications.length}</strong>
        </div>
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lidas</p>
          <strong className="mt-2 block text-3xl font-black italic text-climbe-secondary">
            {notifications.length - unreadNotifications.length}
          </strong>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-[32px] border border-red-100 bg-red-50 p-8 text-center">
          <h3 className="text-lg font-black italic text-red-500">Não foi possível carregar as notificações</h3>
          <p className="mt-2 text-sm text-red-400">Verifique se a API está ativa e tente atualizar a página.</p>
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <Bell size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">
            {filter === 'unread' ? 'Nenhuma notificação pendente' : 'Nenhuma notificação encontrada'}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            As notificações reais geradas pelo sistema aparecerão aqui quando houver novidades.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`rounded-[24px] border p-6 flex items-start gap-4 transition-all ${
                notification.read
                  ? 'bg-white border-gray-100 hover:shadow-lg hover:shadow-climbe-primary/5'
                  : 'bg-climbe-primary/5 border-climbe-primary/20 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                notification.read ? 'bg-gray-50 text-gray-400' : 'bg-climbe-primary/10 text-climbe-primary'
              }`}>
                {notification.read ? <Check size={20} /> : <Bell size={20} />}
              </div>

              <div className="flex-1 space-y-3 py-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-bold text-climbe-secondary text-sm italic">
                        {notification.title || getTypeLabel(notification.type)}
                      </h5>
                      {!notification.read && (
                        <span className="rounded-full bg-climbe-primary px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-climbe-secondary">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {getTypeLabel(notification.type)}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <Clock size={12} />
                    {notification.createdAt
                      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })
                      : '--'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  {notification.message || 'Notificação sem mensagem.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="rounded-xl bg-climbe-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-secondary transition hover:scale-105 disabled:opacity-50"
                    >
                      Marcar como lida
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    disabled={deleteNotificationMutation.isPending}
                    className="rounded-xl bg-gray-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={14} className="mr-1 inline" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
