import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Files, 
  Calendar, 
  BarChart3, 
  Bell,
  ChevronRight,
  X
} from 'lucide-react';
import { routes } from '@/config/routes';

const LOGO_BRANCA = '/assets/logos/Marca Climbe-02.png';

const menuItems = [
  { path: routes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { path: routes.empresas, label: 'Empresas', icon: Building2 },
  { path: routes.usuarios, label: 'Usuários', icon: Users },
  { path: routes.propostas, label: 'Propostas', icon: FileText },
  { path: routes.documentos, label: 'Documentos', icon: Files },
  { path: routes.reunioes, label: 'Reuniões', icon: Calendar },
  { path: routes.relatorios, label: 'Relatórios', icon: BarChart3 },
  { path: routes.notificacoes, label: 'Notificações', icon: Bell },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay — apenas mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-climbe-secondary text-white flex flex-col h-screen 
        border-r border-climbe-support/20 shadow-2xl z-[70] transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area & Close Button */}
        <div className="p-8 mb-4 flex items-center justify-between">
          <img 
            src={LOGO_BRANCA} 
            alt="Climbe" 
            className="h-10 object-contain"
          />
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-climbe-support/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 mt-2">
            Menu Principal
          </p>
          
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-climbe-primary text-climbe-secondary shadow-lg shadow-climbe-primary/20 font-bold' 
                  : 'text-gray-400 hover:bg-climbe-support/30 hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${isActive ? 'opacity-100' : ''}`} 
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-climbe-support/20">
          <div className="flex items-center gap-3 p-3 bg-climbe-support/10 rounded-2xl border border-climbe-support/20">
            <div className="w-10 h-10 rounded-xl bg-climbe-primary flex items-center justify-center text-climbe-secondary font-black text-xs">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">Climbe v1.0</span>
              <span className="text-[10px] text-gray-500 font-medium">Gestão Pro</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
