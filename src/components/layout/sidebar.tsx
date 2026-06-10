import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Files,
  Calendar,
  CalendarDays,
  BarChart3,
  Bell,
  ChevronRight,
  ChevronLeft,
  ScrollText,
  X
} from 'lucide-react';
import { routes } from '@/config/routes';
import { ASSETS } from '@/config/assets';

const LOGO_BRANCA = ASSETS.logos.light;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {

  const menuItems = [
    { path: routes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { path: routes.agenda, label: 'Agenda', icon: CalendarDays },
    { path: routes.empresas, label: 'Empresas', icon: Building2 },
    { path: routes.usuarios, label: 'Usuários', icon: Users },
    { path: routes.propostas, label: 'Propostas', icon: FileText },
    { path: routes.documentos, label: 'Documentos', icon: Files },
    { path: routes.reunioes, label: 'Reuniões', icon: Calendar },
    { path: routes.relatorios, label: 'Relatórios', icon: BarChart3 },
    { path: routes.notificacoes, label: 'Notificações', icon: Bell },
    { path: routes.contratos, label: 'Contratos', icon: ScrollText },
  ];

  return (
    <>
      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 bg-climbe-secondary text-white flex flex-col h-screen 
        border-r border-climbe-support/10 shadow-2xl z-[70] transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-24' : 'lg:w-72'}
        w-72
      `}>
        {/* Logo Area */}
        <div className={`py-4 px-6 mb-4 flex items-center justify-between border-b border-climbe-support/5 h-24 ${isCollapsed ? 'lg:py-4 lg:px-2 lg:flex-col lg:justify-center lg:gap-1' : ''}`}>
          {isCollapsed ? (
            <span className="text-2xl font-black text-climbe-primary italic tracking-tighter hidden lg:block select-none animate-in fade-in duration-500">C.</span>
          ) : (
            <img
              src={LOGO_BRANCA}
              alt="Climbe"
              className="h-16 w-auto object-contain max-w-[180px] animate-in fade-in duration-500"
            />
          )}
          
          {/* Collapse Button - Desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 hover:bg-climbe-support/20 rounded-xl transition-colors text-gray-400 hover:text-white"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Close Button - Mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-climbe-support/20 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
          <p className={`px-4 text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 mt-2 transition-all ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden lg:mb-0 lg:mt-0' : 'opacity-100'}`}>
            Menu Principal
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => `
                flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
                ${isCollapsed ? 'lg:justify-center lg:px-0 lg:h-12 lg:w-12 lg:mx-auto' : 'justify-between'}
                ${isActive
                  ? 'bg-climbe-primary text-climbe-secondary shadow-lg shadow-climbe-primary/15 font-black italic'
                  : 'text-gray-400 hover:bg-climbe-support/25 hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    <span className={`text-sm font-medium tracking-wide transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <ChevronRight
                      size={14}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${isActive ? 'opacity-100' : ''}`}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>


      </aside>
    </>
  );
}
