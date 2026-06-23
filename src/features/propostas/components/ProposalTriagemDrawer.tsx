import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, FileText, User, Calendar, Loader2 } from 'lucide-react';
import { SlideOver } from '@/components/ui/SlideOver';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Proposal {
  id: number;
  enterpriseName: string;
  userName: string;
  responsibleAnalystName?: string;
  status: string;
  createdAt?: string;
}

interface ProposalTriagemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  isLoading: boolean;
  onApprove: () => void;
  onRequestAdjustments: () => void;
  onReject: (reason: string) => void;
}

type Decision = 'approve' | 'adjustments' | 'reject' | null;

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recebida',
  IN_TRIAGE: 'Em triagem',
  ELIGIBLE: 'Triagem aprovada',
  PENDING_ADJUSTMENTS: 'Aguardando ajustes',
  COMMERCIAL_PROPOSAL: 'Proposta enviada',
  COMMERCIAL_PROPOSAL_APPROVED: 'Aprovada',
  COMMERCIAL_PROPOSAL_REJECTED: 'Reprovada',
  READY_FOR_NEXT_STAGE: 'Próxima etapa',
};

export function ProposalTriagemDrawer({
  isOpen,
  onClose,
  proposal,
  isLoading,
  onApprove,
  onRequestAdjustments,
  onReject,
}: ProposalTriagemDrawerProps) {
  const [decision, setDecision] = useState<Decision>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleClose = () => {
    setDecision(null);
    setRejectReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (decision === 'approve') {
      onApprove();
    } else if (decision === 'adjustments') {
      onRequestAdjustments();
    } else if (decision === 'reject') {
      if (!rejectReason.trim()) return;
      onReject(rejectReason);
    }
    setDecision(null);
    setRejectReason('');
  };

  if (!proposal) return null;

  const isInTriage = proposal.status?.toUpperCase() === 'IN_TRIAGE';

  return (
    <SlideOver isOpen={isOpen} onClose={handleClose} title="Triagem da Proposta" width="md">
      <div className="space-y-6">
        {/* Proposal summary */}
        <div className="rounded-2xl bg-gray-50 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-climbe-secondary text-white flex items-center justify-center font-black italic text-sm">
              {proposal.enterpriseName?.charAt(0)}
            </div>
            <div>
              <p className="font-bold italic text-climbe-secondary">{proposal.enterpriseName}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Proposta #{proposal.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <User size={12} className="text-climbe-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">Criado por</span>
              </div>
              <p className="text-sm font-medium text-climbe-secondary">{proposal.userName}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Calendar size={12} className="text-climbe-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">Data</span>
              </div>
              <p className="text-sm font-medium text-climbe-secondary">
                {proposal.createdAt
                  ? format(new Date(proposal.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                  : '--'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <FileText size={12} className="text-climbe-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">Status atual</span>
            </div>
            <p className="text-sm font-bold text-climbe-secondary">
              {STATUS_LABELS[proposal.status?.toUpperCase()] ?? proposal.status}
            </p>
          </div>
        </div>

        {/* Decision options */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Decisão de triagem</p>
          <div className="space-y-2">
            {isInTriage && (
              <button
                onClick={() => setDecision('approve')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  decision === 'approve'
                    ? 'border-climbe-primary bg-climbe-primary/5'
                    : 'border-gray-100 hover:border-climbe-primary/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${decision === 'approve' ? 'bg-climbe-primary' : 'bg-gray-100'}`}>
                  <CheckCircle2 size={16} className={decision === 'approve' ? 'text-climbe-secondary' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="font-black text-sm italic text-climbe-secondary">Aprovar triagem</p>
                  <p className="text-xs text-gray-400">Avança para envio de proposta comercial</p>
                </div>
              </button>
            )}

            <button
              onClick={() => setDecision('adjustments')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                decision === 'adjustments'
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-100 hover:border-amber-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${decision === 'adjustments' ? 'bg-amber-400' : 'bg-gray-100'}`}>
                <RefreshCw size={16} className={decision === 'adjustments' ? 'text-white' : 'text-gray-400'} />
              </div>
              <div>
                <p className="font-black text-sm italic text-climbe-secondary">
                  {isInTriage ? 'Solicitar ajustes' : 'Retomar triagem'}
                </p>
                <p className="text-xs text-gray-400">
                  {isInTriage ? 'Devolve a proposta para ajustes' : 'Reativa a triagem para análise'}
                </p>
              </div>
            </button>

            {isInTriage && (
              <button
                onClick={() => setDecision('reject')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  decision === 'reject'
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-100 hover:border-red-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${decision === 'reject' ? 'bg-red-500' : 'bg-gray-100'}`}>
                  <XCircle size={16} className={decision === 'reject' ? 'text-white' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="font-black text-sm italic text-red-600">Reprovar proposta</p>
                  <p className="text-xs text-gray-400">Encerra o fluxo com notificação ao cliente</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Rejection reason */}
        {decision === 'reject' && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest">Motivo da reprovação *</Label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
              placeholder="Descreva o motivo para registrar e notificar..."
            />
          </div>
        )}

        {/* Confirm button */}
        {decision && (
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (decision === 'reject' && !rejectReason.trim())}
            className={`w-full rounded-2xl font-black italic py-4 transition-all ${
              decision === 'reject'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : decision === 'adjustments'
                  ? 'bg-amber-400 text-climbe-secondary hover:bg-amber-500'
                  : 'bg-climbe-primary text-climbe-secondary shadow-lg shadow-climbe-primary/20'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />PROCESSANDO...</>
            ) : decision === 'approve' ? (
              'CONFIRMAR APROVAÇÃO'
            ) : decision === 'adjustments' ? (
              'SOLICITAR AJUSTES'
            ) : (
              'CONFIRMAR REPROVAÇÃO'
            )}
          </Button>
        )}
      </div>
    </SlideOver>
  );
}
