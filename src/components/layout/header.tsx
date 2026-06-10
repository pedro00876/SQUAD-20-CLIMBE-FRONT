import { Search, Bell, LogOut, ChevronDown, Menu, Check, Trash2, Clock } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { notificationService, type Notification } from '@/services/notification.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ onMenuClick, isCollapsed, onToggleCollapse }: HeaderProps) {
  const { user, logout } = useAuthContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? notificationService.listByUser(Number(user.id)) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getFirstTwoNames = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).join(' ');
  };

  return (
    <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-sm gap-4">
      {/* Menu / Collapse Button */}
      <button 
        onClick={() => {
          if (window.innerWidth >= 1024) {
            onToggleCollapse();
          } else {
            onMenuClick();
          }
        }}
        className="p-2 text-climbe-secondary hover:bg-gray-50 rounded-xl transition-colors shrink-0"
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <Menu size={24} />
      </button>

      {/* Search Area */}
      <div className="hidden sm:flex flex-1 max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-climbe-primary transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar propostas..."
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm font-light focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 whitespace-nowrap overflow-hidden text-ellipsis"
        />
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-8">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2.5 rounded-xl transition-all group ${isNotificationsOpen ? 'bg-climbe-primary/10 text-climbe-primary' : 'text-gray-400 hover:text-climbe-primary hover:bg-climbe-primary/5'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 group-hover:scale-110 transition-transform"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-climbe-secondary/10 overflow-hidden z-50">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-climbe-secondary italic text-sm">Notificações</h3>
                {unreadCount > 0 && <span className="text-[10px] font-black bg-climbe-primary text-climbe-secondary px-2 py-0.5 rounded-full">{unreadCount} Novas</span>}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {notifications.length > 0 ? (
                  notifications.map((notification: Notification) => (
                    <div key={notification.id} className={`p-5 group transition-colors hover:bg-gray-50/50 ${!notification.read ? 'bg-climbe-primary/5' : ''}`}>
                      <div className="flex justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-climbe-secondary leading-tight italic">{notification.title}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="text-climbe-primary p-1 hover:bg-white rounded-md shadow-sm"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            className="text-red-400 p-1 hover:bg-white rounded-md shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-medium">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mx-auto">
                      <Bell size={20} />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Tudo limpo por aqui!</p>
                  </div>
                )}
              </div>
              <button className="w-full p-4 text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:bg-gray-50 transition-colors border-t border-gray-50">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-gray-100"></div>

        {/* User Profile */}
        <Link to={routes.perfil} className="flex items-center gap-4 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-climbe-secondary tracking-tight">
              {getFirstTwoNames(user?.name || 'Usuário')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-climbe-primary">
              {user?.role || 'Administrador'}
            </span>
          </div>
          <div className="relative">
            <Avatar initials={getInitials(user?.name || 'US')} className="group-hover:ring-4 group-hover:ring-climbe-primary/10 transition-all shrink-0" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-climbe-primary transition-colors" />
        </Link>

        {/* Logout */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
}
