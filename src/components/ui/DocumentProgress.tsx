import { clsx } from 'clsx';

type DocStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'NON_COMPLIANT';

interface DocumentProgressProps {
  requirements: { status: DocStatus | string }[];
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  APPROVED:      'bg-green-500',
  SUBMITTED:     'bg-blue-400',
  NON_COMPLIANT: 'bg-red-400',
  PENDING:       'bg-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED:      'Aprovado',
  SUBMITTED:     'Enviado',
  NON_COMPLIANT: 'Não conforme',
  PENDING:       'Pendente',
};

export function DocumentProgress({ requirements, className }: DocumentProgressProps) {
  const total = requirements.length;
  if (total === 0) return null;

  const approved   = requirements.filter(r => r.status === 'APPROVED').length;
  const submitted  = requirements.filter(r => r.status === 'SUBMITTED').length;
  const nonComp    = requirements.filter(r => r.status === 'NON_COMPLIANT').length;
  const pending    = total - approved - submitted - nonComp;

  const pct = Math.round((approved / total) * 100);

  const segments: { count: number; status: string }[] = [
    { count: approved,  status: 'APPROVED'      },
    { count: submitted, status: 'SUBMITTED'     },
    { count: nonComp,   status: 'NON_COMPLIANT' },
    { count: pending,   status: 'PENDING'       },
  ].filter(s => s.count > 0);

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Progresso dos documentos
        </span>
        <span className="text-sm font-black text-climbe-secondary">
          {approved} / {total} aprovados
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-px">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={clsx('h-full transition-all duration-500', STATUS_COLOR[seg.status])}
            style={{ width: `${(seg.count / total) * 100}%` }}
            title={`${seg.count} ${STATUS_LABEL[seg.status]}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={clsx('w-2 h-2 rounded-full', STATUS_COLOR[seg.status])} />
            <span className="text-[10px] text-gray-400 font-medium">
              {seg.count} {STATUS_LABEL[seg.status]}
            </span>
          </div>
        ))}
      </div>

      {/* Percentage */}
      {pct === 100 && (
        <p className="text-xs font-black text-green-600 tracking-wide">
          Todos os documentos aprovados
        </p>
      )}
    </div>
  );
}
