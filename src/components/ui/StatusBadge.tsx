import { Check, Clock, XCircle, Loader2, Lock, Send } from 'lucide-react';
import { clsx } from 'clsx';

export type BadgeStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'NON_COMPLIANT'
  | 'IN_PROGRESS'
  | 'LOCKED'
  | 'SCHEDULED'
  | 'CONCLUDED';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

const CONFIG: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  PENDING: {
    label: 'Pendente',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  SUBMITTED: {
    label: 'Enviado',
    icon: Send,
    classes: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  APPROVED: {
    label: 'Aprovado',
    icon: Check,
    classes: 'bg-green-50 text-green-600 border-green-200',
  },
  REJECTED: {
    label: 'Reprovado',
    icon: XCircle,
    classes: 'bg-red-50 text-red-500 border-red-200',
  },
  NON_COMPLIANT: {
    label: 'Não conforme',
    icon: XCircle,
    classes: 'bg-red-50 text-red-500 border-red-200',
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    icon: Loader2,
    classes: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  LOCKED: {
    label: 'Bloqueado',
    icon: Lock,
    classes: 'bg-gray-50 text-gray-400 border-gray-200',
  },
  SCHEDULED: {
    label: 'Agendado',
    icon: Clock,
    classes: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  CONCLUDED: {
    label: 'Concluído',
    icon: Check,
    classes: 'bg-green-50 text-green-600 border-green-200',
  },
};

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const cfg = CONFIG[status?.toUpperCase?.()] ?? {
    label: status,
    icon: Clock,
    classes: 'bg-gray-50 text-gray-400 border-gray-200',
  };
  const Icon = cfg.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-black uppercase tracking-widest',
        size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]',
        cfg.classes,
        className,
      )}
    >
      <Icon size={size === 'sm' ? 10 : 12} className={status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
}
