import { Bell, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationService, type Notification } from '@/services/notification.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificacoesPage() {
  const { user } = useAuthContext();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.listByUser(Number(user!.id)),
    enabled: !!user?.id
  });
  return (
    <div className="space-y-8">
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

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-climbe-primary w-8 h-8" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhuma notificação no momento.</p>
          </div>
        ) : (
          notifications.map((notif: Notification) => (
            <div key={notif.id} className={`p-6 rounded-[24px] border flex items-start gap-4 transition-all cursor-pointer ${notif.read ? 'bg-white border-gray-100 hover:shadow-lg' : 'bg-climbe-primary/5 border-climbe-primary/20'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50 text-gray-400' : 'bg-climbe-primary/10 text-climbe-primary'}`}>
                <Bell size={20} />
              </div>
              <div className="flex-1 space-y-1 py-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-climbe-secondary text-sm italic">{notif.title || notif.type || 'Sistema'}</h5>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR }) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
