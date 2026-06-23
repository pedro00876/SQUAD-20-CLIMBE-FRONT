import { Bell, CheckCircle2, Clock, Loader2, Trash2, ArrowRight, Users, Building2, CalendarDays, ScrollText, FileText } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { notificationService, type Notification } from '@/services/notification.service';
import { routes } from '@/config/routes';

// ─── Type → action mapping ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<any>;
  actionLabel: string;
  actionRoute: string;
}> = {
  ACCESS_REQUEST: {
    label: 'Solicitação de acesso',
    icon: Users,
    actionLabel: 'Aprovar agora',
    actionRoute: routes.usuarios,
  },
  ALL_DOCUMENTS_APPROVED: {
    label: 'Documentos aprovados',
    icon: FileText,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
  MEETING: {
    label: 'Reunião',
    icon: CalendarDays,
    actionLabel: 'Abrir agenda',
    actionRoute: routes.agenda,
  },
  CONTRACT_CHANGE: {
    label: 'Alteração de contrato',
    icon: ScrollText,
    actionLabel: 'Ver contratos',
    actionRoute: routes.contratos,
  },
  TEAM_ASSIGNMENT: {
    label: 'Atribuição de equipe',
    icon: Building2,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
  RESPONSIBLE_ANALYST_ASSIGNED: {
    label: 'Analista atribuído',
    icon: Users,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
};

function getTypeConfig(type?: string) {
  if (!type) return null;
  return TYPE_CONFIG[type.toUpperCase()] ?? null;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Há algum tempo';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Há algum tempo';
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  } catch {
    return 'Há algum tempo';
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export function NotificacoesPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Optimistic "read" state — since the backend DTO has no `read` field, we track locally
  const [locallyRead, setLocallyRead] = useState<Set<number>>(new Set());

  const { data: notifications = [], isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? notificationService.listByUser(Number(user.id)) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onMutate: (id) => setLocallyRead(prev => new Set(prev).add(id)),
    onError: (_, id) => setLocallyRead(prev => { const s = new Set(prev); s.delete(id); return s; }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const isRead = (n: Notification) => locallyRead.has(n.id);
  const unread = notifications.filter(n => !isRead(n));
  const visible = filter === 'unread' ? unread : notifications;

  const markAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    setLocallyRead(new Set(ids));
    Promise.all(ids.map(id => notificationService.markAsRead(id)))
      .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Bell size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Central</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Notificações</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Atualizações de propostas, reuniões e acessos — com links diretos para ação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${filter === 'all' ? 'bg-climbe-secondary text-white' : 'text-gray-400 hover:text-climbe-secondary'}`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${filter === 'unread' ? 'bg-climbe-secondary text-white' : 'text-gray-400 hover:text-climbe-secondary'}`}
            >
              Não lidas ({unread.length})
            </button>
          </div>

          <Button
            type="button"
            disabled={unread.length === 0 || markAsReadMutation.isPending}
            onClick={markAllAsRead}
            className="rounded-2xl bg-climbe-primary px-5 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-[32px] border border-red-100 bg-red-50 p-8 text-center">
          <h3 className="text-lg font-black italic text-red-500">Não foi possível carregar as notificações</h3>
          <p className="mt-2 text-sm text-red-400">Verifique se a API está ativa e tente atualizar a página.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <Bell size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">
            {filter === 'unread' ? 'Todas as notificações foram lidas' : 'Nenhuma notificação ainda'}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            As notificações geradas pelo sistema aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification: Notification) => {
            const read = isRead(notification);
            const config = getTypeConfig(notification.type);
            const Icon = config?.icon ?? Bell;
            return (
              <div
                key={notification.id}
                className={`rounded-[24px] border p-6 flex items-start gap-4 transition-all ${
                  read
                    ? 'bg-white border-gray-100 opacity-70'
                    : 'bg-climbe-primary/5 border-climbe-primary/20 shadow-sm'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${read ? 'bg-gray-100 text-gray-300' : 'bg-climbe-primary/10 text-climbe-primary'}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 space-y-3 py-0.5">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h5 className="font-bold text-climbe-secondary text-sm italic">
                        {config?.label ?? notification.type.replace(/_/g, ' ')}
                      </h5>
                      <p className="mt-1 text-xs text-gray-500 font-light leading-relaxed max-w-xl">
                        {notification.message || 'Notificação sem mensagem.'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">
                      <Clock size={11} />
                      {formatDate(notification.sentAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {config && (
                      <button
                        type="button"
                        onClick={() => navigate(config.actionRoute)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-climbe-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:scale-105"
                      >
                        {config.actionLabel}
                        <ArrowRight size={11} />
                      </button>
                    )}
                    {!read && (
                      <button
                        type="button"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        className="rounded-xl bg-climbe-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-primary transition hover:bg-climbe-primary hover:text-climbe-secondary disabled:opacity-50"
                      >
                        Marcar como lida
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(notification.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-xl bg-gray-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={13} className="mr-1 inline" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
