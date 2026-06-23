import { clsx } from 'clsx';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const ROLE_CONFIG: Record<string, { label: string; classes: string }> = {
  CEO:             { label: 'CEO',             classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CMO:             { label: 'CMO',             classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  CSO:             { label: 'CSO',             classes: 'bg-sky-50 text-sky-700 border-sky-200' },
  CFO:             { label: 'CFO',             classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  COMPLIANCE:      { label: 'Compliance',      classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  CONTADOR:        { label: 'Contador',        classes: 'bg-teal-50 text-teal-700 border-teal-200' },
  ANALISTA_CHEFE:  { label: 'Analista Chefe',  classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  ANALISTA_SENIOR: { label: 'Analista Sênior', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  ANALISTA:        { label: 'Analista',        classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  MEMBRO_CONSELHO: { label: 'Conselho',        classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function normalizeRole(role: string): string {
  return role?.toUpperCase().replace(/ /g, '_') ?? '';
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const key = normalizeRole(role);
  const cfg = ROLE_CONFIG[key] ?? { label: role || 'Sem cargo', classes: 'bg-gray-50 text-gray-500 border-gray-200' };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest',
        cfg.classes,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
