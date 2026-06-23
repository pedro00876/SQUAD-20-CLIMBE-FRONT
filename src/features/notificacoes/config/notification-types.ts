import {
  Building2,
  CalendarDays,
  FileText,
  ScrollText,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { routes } from '@/config/routes';

export interface NotificationTypeConfig {
  label: string;
  icon: LucideIcon;
  actionLabel: string;
  actionRoute: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  NEW_USER_PENDING: {
    label: 'Novo usuário pendente',
    icon: Users,
    actionLabel: 'Aprovar agora',
    actionRoute: routes.usuarios,
  },
  ACCESS_REQUEST_REMINDER: {
    label: 'Solicitação de acesso',
    icon: Users,
    actionLabel: 'Aprovar agora',
    actionRoute: routes.usuarios,
  },
  ACCESS_REQUEST: {
    label: 'Solicitação de acesso',
    icon: Users,
    actionLabel: 'Aprovar agora',
    actionRoute: routes.usuarios,
  },
  RESPONSIBLE_ANALYST_ASSIGNED: {
    label: 'Analista atribuído',
    icon: Users,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
  CONTRACT_CREATION_REQUIRED: {
    label: 'Contrato pendente',
    icon: ScrollText,
    actionLabel: 'Ver propostas',
    actionRoute: routes.propostas,
  },
  ALL_DOCUMENTS_APPROVED: {
    label: 'Documentos aprovados',
    icon: FileText,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
  TEAM_ASSIGNMENT: {
    label: 'Atribuição de equipe',
    icon: Building2,
    actionLabel: 'Ver empresa',
    actionRoute: routes.empresas,
  },
  REPORT_REVIEW_REQUIRED: {
    label: 'Relatório para revisão',
    icon: FileText,
    actionLabel: 'Ver relatórios',
    actionRoute: routes.relatorios,
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
};

export function getNotificationTypeConfig(type?: string): NotificationTypeConfig | null {
  if (!type) return null;
  return NOTIFICATION_TYPE_CONFIG[type.toUpperCase()] ?? null;
}

export function getNotificationToastTitle(type?: string): string {
  return getNotificationTypeConfig(type)?.label ?? 'Nova notificação';
}
