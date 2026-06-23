import { Lock } from 'lucide-react';

interface StageAccessDeniedProps {
  requiredRoles: string[];
  currentStageLabel?: string;
  hint?: string;
}

const ROLE_LABELS: Record<string, string> = {
  CEO:              'CEO',
  CMO:              'CMO (Comercial)',
  CSO:              'CSO',
  COMPLIANCE:       'Compliance',
  CONTADOR:         'Analista Contador',
  ANALISTA_CHEFE:   'Analista Chefe',
  ANALISTA_SENIOR:  'Analista Sênior',
  ANALISTA:         'Analista',
};

export function StageAccessDenied({ requiredRoles, currentStageLabel, hint }: StageAccessDeniedProps) {
  const rolesDisplay = requiredRoles
    .map(r => ROLE_LABELS[r] ?? r)
    .join(', ');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Lock size={28} className="text-gray-400" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-black text-climbe-secondary text-lg">
          {currentStageLabel ? `Acesso restrito — ${currentStageLabel}` : 'Acesso restrito'}
        </h3>
        <p className="text-sm text-gray-400 font-light">
          Esta etapa só pode ser executada por:{' '}
          <strong className="text-climbe-secondary font-bold">{rolesDisplay}</strong>
        </p>
        {hint && (
          <p className="text-xs text-gray-400 mt-2">{hint}</p>
        )}
      </div>
    </div>
  );
}
