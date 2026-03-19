import { Search, Bell, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthContext();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-sm gap-4">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 text-climbe-secondary hover:bg-gray-50 rounded-xl transition-colors shrink-0"
      >
        <Menu size={24} />
      </button>

      {/* Search Area — hidden on extra small screens or collapsed */}
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
        <button className="relative p-2.5 text-gray-400 hover:text-climbe-primary hover:bg-climbe-primary/5 rounded-xl transition-all group">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 group-hover:scale-110 transition-transform"></span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-gray-100"></div>

        {/* User Profile */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-climbe-secondary tracking-tight">
              {user?.name || 'Usuário'}
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
        </div>

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
