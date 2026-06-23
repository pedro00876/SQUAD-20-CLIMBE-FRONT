import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CalendarDays,
  BarChart3,
  Bell,
  ScrollText,
} from 'lucide-react';
import { routes } from './routes';
import type { LogicalRole } from './roles';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: LogicalRole[];
}

// Ordered by business priority.
// Documentos removed from sidebar (accessible via empresa/contrato context).
// Reuniões removed — unified into Agenda & Reuniões.
export const NAV_ITEMS: NavItem[] = [
  {
    path: routes.dashboard,
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'SENIOR', 'ANALISTA', 'COMPLIANCE', 'APROVADOR', 'EMPRESA'],
  },
  {
    path: routes.empresas,
    label: 'Empresas',
    icon: Building2,
    roles: ['ADMIN', 'SENIOR', 'ANALISTA', 'COMPLIANCE', 'APROVADOR', 'EMPRESA'],
  },
  {
    path: routes.propostas,
    label: 'Propostas',
    icon: FileText,
    roles: ['ADMIN', 'SENIOR', 'APROVADOR', 'ANALISTA'],
  },
  {
    path: routes.contratos,
    label: 'Contratos',
    icon: ScrollText,
    roles: ['ADMIN', 'COMPLIANCE', 'SENIOR', 'APROVADOR'],
  },
  {
    path: routes.agenda,
    label: 'Agenda & Reuniões',
    icon: CalendarDays,
    roles: ['ADMIN', 'SENIOR', 'ANALISTA'],
  },
  {
    path: routes.relatorios,
    label: 'Relatórios',
    icon: BarChart3,
    roles: ['ADMIN', 'SENIOR', 'ANALISTA'],
  },
  {
    path: routes.usuarios,
    label: 'Usuários',
    icon: Users,
    roles: ['ADMIN', 'CPO'],
  },
  {
    path: routes.notificacoes,
    label: 'Notificações',
    icon: Bell,
    roles: ['ADMIN', 'SENIOR', 'ANALISTA', 'COMPLIANCE', 'APROVADOR', 'EMPRESA'],
  },
];
