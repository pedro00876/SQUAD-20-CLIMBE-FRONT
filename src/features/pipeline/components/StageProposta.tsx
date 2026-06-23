import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle2, XCircle, Upload, Loader2, Users, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { notificationService } from '@/services/notification.service';
import { proposalService } from '@/services/proposal.service';
import { submitCommercialProposal, parseApiWorkflowError } from '@/features/workflow';

const REVISORES = [
  { key: 'CMO',      label: 'CMO'             },
  { key: 'CSO',      label: 'CSO'             },
  { key: 'CEO',      label: 'CEO'             },
  { key: 'CONTADOR', label: 'Analista Contador' },
] as const;

type RevisorKey = (typeof REVISORES)[number]['key'];

interface StagePropostaProps {
  empresa: any;
  proposal: any;
  userRole: string;
  canUpload: boolean;
  canApprove: boolean;
  onConcluir: () => void;
}

export function StageProposta({
  empresa,
  proposal,
  userRole,
  canUpload,
  canApprove,
  onConcluir,
}: StagePropostaProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [error, setError] = useState('');

  const status = (proposal?.status || '').toUpperCase();
  const isRejected = status === 'COMMERCIAL_PROPOSAL_REJECTED';
  const canResubmit = status === 'ELIGIBLE' || isRejected;
  const propostaEnviada =
    status === 'COMMERCIAL_PROPOSAL' ||
    status === 'COMMERCIAL_PROPOSAL_APPROVED' ||
    isRejected;
  const isApproved = status === 'COMMERCIAL_PROPOSAL_APPROVED';

  // Determine reviewer status per role
  function revisorStatus(key: RevisorKey): 'waiting' | 'approved' | 'rejected' | 'current' {
    if (key === (userRole.toUpperCase() as RevisorKey)) return 'current';
    if (isRejected) return 'rejected';
    if (isApproved) return 'approved';
    if (propostaEnviada) return 'waiting';
    return 'waiting';
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Selecione o arquivo da proposta comercial.');
      await submitCommercialProposal(proposal.id, empresa.id, file);
      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Proposta comercial enviada — ${empresa.tradeName || empresa.legalName}`,
          `Uma proposta comercial foi submetida para revisão. Acesse o sistema para visualizar.`,
        );
      }
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      onConcluir();
    },
    onError: (err: unknown) => {
      const parsed = parseApiWorkflowError(err);
      setError(parsed.hint ? `${parsed.message} ${parsed.hint}` : parsed.message);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await proposalService.updateStatus(proposal.id, 'COMMERCIAL_PROPOSAL_APPROVED');
      await notificationService.sendEmail(
        empresa.email,
        `Proposta comercial aprovada — ${empresa.tradeName || empresa.legalName}`,
        `Parabéns! A proposta comercial foi aprovada. O próximo passo é a criação do contrato.`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      onConcluir();
    },
    onError: (err: unknown) => {
      const parsed = parseApiWorkflowError(err);
      setError(parsed.hint ? `${parsed.message} ${parsed.hint}` : parsed.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await proposalService.updateStatus(proposal.id, 'COMMERCIAL_PROPOSAL_REJECTED');
      await notificationService.sendEmail(
        empresa.email,
        `Proposta comercial reprovada — ${empresa.tradeName || empresa.legalName}`,
        `Sua proposta comercial foi reprovada. Motivo: ${rejectReason}. Entre em contato para revisão.`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      setShowRejectConfirm(false);
      setRejectReason('');
      onConcluir();
    },
    onError: (err: unknown) => {
      const parsed = parseApiWorkflowError(err);
      setError(parsed.hint ? `${parsed.message} ${parsed.hint}` : parsed.message);
    },
  });

  const isBusy = uploadMutation.isPending || approveMutation.isPending || rejectMutation.isPending;

  // ── Revisor Panel ──────────────────────────────────────────────────────────

  function RevisorBadge({ rKey, label }: { rKey: RevisorKey; label: string }) {
    const rs = revisorStatus(rKey);
    const config = {
      current:  { bg: 'bg-climbe-primary text-climbe-secondary border-climbe-primary', icon: <User size={10} />, suffix: '— Você' },
      approved: { bg: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle2 size={10} />, suffix: '' },
      rejected: { bg: 'bg-red-50 text-red-500 border-red-200', icon: <XCircle size={10} />, suffix: '' },
      waiting:  { bg: 'bg-white text-gray-400 border-gray-200', icon: <Clock size={10} />, suffix: '' },
    }[rs];

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${config.bg}`}>
        {config.icon}
        {label}
        {config.suffix && <span className="normal-case font-medium text-[9px]">{config.suffix}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <FileText className="shrink-0" />
        <p className="font-medium mt-0.5">
          Nesta etapa, a proposta comercial deve ser submetida e aprovada pelos responsáveis (CMO / CSO / CEO / Analista Contador).
        </p>
      </div>

      {/* Painel de revisores */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-climbe-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Revisores responsáveis
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {REVISORES.map(r => (
            <RevisorBadge key={r.key} rKey={r.key} label={r.label} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {isRejected
            ? 'Proposta reprovada — reenvie o documento comercial para nova análise.'
            : isApproved
              ? 'Proposta aprovada por todos os revisores.'
              : propostaEnviada
                ? 'Aguardando decisão dos revisores.'
                : 'Proposta ainda não submetida.'}
        </p>
      </div>

      {/* Upload */}
      {canResubmit && (
        <div className="space-y-4">
          <h3 className="font-bold italic text-climbe-secondary text-lg">
            {isRejected ? 'Reenviar Proposta Comercial' : 'Envio de Proposta Comercial'}
          </h3>
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              className="hidden"
              id="proposta-upload"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={!canUpload}
            />
            <label htmlFor="proposta-upload" className={`flex flex-col items-center gap-4 ${canUpload ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <Upload className="text-climbe-primary w-8 h-8" />
              </div>
              <div>
                <span className="text-lg font-bold text-climbe-secondary block">
                  {file ? file.name : 'Anexar Proposta (PDF)'}
                </span>
                {!file && <span className="text-sm text-gray-400">Clique para selecionar o arquivo</span>}
              </div>
            </label>
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-4">
            <Tooltip content={!canUpload ? 'Apenas CMO pode enviar a proposta comercial.' : ''}>
              <Button
                onClick={() => { setError(''); uploadMutation.mutate(); }}
                disabled={!file || isBusy || !canUpload}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBusy
                  ? <><Loader2 size={16} className="mr-2 animate-spin" /> ENVIANDO...</>
                  : 'ENVIAR PROPOSTA'
                }
              </Button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Proposta reprovada — reenvio */}
      {isRejected && !canUpload && (
        <p className="text-xs text-gray-400 italic text-center">
          Aguardando reenvio da proposta comercial pelo CMO.
        </p>
      )}

      {/* Proposta enviada — aguardando aprovação */}
      {status === 'COMMERCIAL_PROPOSAL' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-climbe-primary/20 text-climbe-primary flex items-center justify-center">
                <FileText />
              </div>
              <div>
                <p className="font-bold text-climbe-secondary">Proposta Comercial</p>
                <StatusBadge
                  status={isApproved ? 'APPROVED' : 'SUBMITTED'}
                  size="sm"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          {canApprove && status === 'COMMERCIAL_PROPOSAL' && (
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <Tooltip content="Esta ação encerrará o processo e notificará a empresa.">
                <Button
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={isBusy}
                  className="flex-1 bg-red-50 text-red-500 hover:bg-red-100 font-black italic rounded-xl h-14"
                >
                  <XCircle className="mr-2" /> REPROVAR
                </Button>
              </Tooltip>
              <Button
                onClick={() => { setError(''); approveMutation.mutate(); }}
                disabled={isBusy}
                className="flex-1 bg-climbe-primary text-climbe-secondary hover:scale-[1.02] transition-all font-black italic rounded-xl shadow-lg shadow-climbe-primary/20 h-14"
              >
                {isBusy
                  ? <><Loader2 size={16} className="mr-2 animate-spin" /> APROVANDO...</>
                  : <><CheckCircle2 className="mr-2" /> APROVAR PROPOSTA</>
                }
              </Button>
            </div>
          )}

          {!canApprove && status === 'COMMERCIAL_PROPOSAL' && (
            <p className="text-xs text-gray-400 italic text-center pt-2">
              Aguardando aprovação de CMO / CSO / CEO / Analista Contador.
            </p>
          )}
        </div>
      )}

      {/* Confirm reject dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => { setError(''); rejectMutation.mutate(); }}
        title="Reprovar Proposta Comercial"
        description="Esta ação encerrará o processo de homologação e a empresa será notificada. Esta ação não pode ser desfeita."
        confirmLabel="Sim, reprovar proposta"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={rejectMutation.isPending}
      >
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Motivo da Reprovação</span>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explique por que a proposta está sendo reprovada..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
