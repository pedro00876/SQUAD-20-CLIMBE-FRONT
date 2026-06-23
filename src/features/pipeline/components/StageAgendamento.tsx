import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Video, CheckCircle2, XCircle, Award, Loader2, Sparkles, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { meetingService } from '@/features/reunioes/services';
import { proposalService } from '@/services/proposal.service';
import { notificationService } from '@/services/notification.service';
import { canPerformStageAction } from '@/config/roles';
import { useNavigate } from 'react-router-dom';

interface StageAgendamentoProps {
  empresa: any;
  proposal: any;
  userRole: string;
  canEdit: boolean;
  onConcluir: () => void;
}

export function StageAgendamento({ empresa, proposal, userRole, canEdit, onConcluir }: StageAgendamentoProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dataReuniao, setDataReuniao] = useState('');
  const [horaReuniao, setHoraReuniao] = useState('');
  const [linkVideo, setLinkVideo] = useState('');
  const [reuniaoAgendada, setReuniaoAgendada] = useState(false);
  const [error, setError] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [concluded, setConcluded] = useState(false);

  const isCPOorP5 = canPerformStageAction(userRole, 'APROVACAO_FINAL');

  // ── Schedule final meeting ─────────────────────────────────────────────────

  const agendarMutation = useMutation({
    mutationFn: async () => {
      await meetingService.createMeeting({
        enterpriseId: empresa.id,
        title: `Reunião de Apresentação Final — ${empresa.tradeName || empresa.legalName}`,
        date: dataReuniao,
        time: horaReuniao || undefined,
        inPerson: false,
        location: linkVideo,
        agenda: 'Apresentação do relatório de análise e encerramento do processo.',
        status: 'SCHEDULED',
      });

      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Reunião de apresentação agendada — ${empresa.tradeName || empresa.legalName}`,
          `Uma reunião de apresentação foi agendada para ${dataReuniao} às ${horaReuniao}. Link: ${linkVideo}`,
        );
      }
    },
    onSuccess: () => setReuniaoAgendada(true),
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao agendar reunião.'),
  });

  // ── Final approval ─────────────────────────────────────────────────────────

  const aprovaMutation = useMutation({
    mutationFn: async () => {
      await notificationService.sendEmail(
        empresa.email,
        `Processo concluído — ${empresa.tradeName || empresa.legalName}`,
        `O processo de análise foi concluído com sucesso. Bem-vindo(a) à Climbe!`,
      );
    },
    onSuccess: () => {
      setShowApproveConfirm(false);
      setConcluded(true);
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Erro ao concluir processo.');
      setShowApproveConfirm(false);
    },
  });

  // ── Not approved → return to next month doc verification ──────────────────

  const reprovarMutation = useMutation({
    mutationFn: async () => {
      await proposalService.update(proposal.id, { status: 'READY_FOR_NEXT_STAGE' });

      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Processo retornado para verificação — ${empresa.tradeName || empresa.legalName}`,
          `O processo foi retornado para verificação documental do próximo mês. Entre em contato com seu analista para mais informações.`,
        );
      }
    },
    onSuccess: () => {
      setShowRejectConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      queryClient.invalidateQueries({ queryKey: ['doc-requirements', proposal?.id] });
      queryClient.invalidateQueries({ queryKey: ['spreadsheets-contract'] });
      onConcluir();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Erro ao retornar processo.');
      setShowRejectConfirm(false);
    },
  });

  const isBusy = agendarMutation.isPending || aprovaMutation.isPending || reprovarMutation.isPending;

  // ── Inline CONCLUIDO screen ────────────────────────────────────────────────
  if (concluded) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-climbe-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(206,255,26,0.5)]">
            <Sparkles className="w-12 h-12 text-climbe-secondary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-bounce" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
        </div>
        <div>
          <h3 className="text-3xl font-black italic text-climbe-secondary">Homologação Concluída!</h3>
          <p className="text-gray-400 mt-2 max-w-md mx-auto font-light">
            A empresa <strong className="text-climbe-secondary">{empresa.tradeName || empresa.legalName}</strong> foi aprovada
            com sucesso e está 100% homologada na nossa base.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-100">
          <CheckCircle2 size={16} />
          <span className="text-sm font-bold">Processo encerrado com sucesso · {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        <Button
          onClick={() => navigate('/empresas')}
          variant="outline"
          className="rounded-xl font-bold mt-4"
        >
          <ArrowLeft size={16} className="mr-2" /> Voltar para listagem
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <Calendar className="shrink-0" />
        <p className="font-medium mt-0.5">
          Etapa Final: Agende a reunião de apresentação com o contratante e registre a decisão de aprovação.
          Se aprovado (CPO / P5), o processo é encerrado com sucesso.
          Se não aprovado, retorna para verificação documental do próximo mês.
        </p>
      </div>

      {/* Process summary */}
      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resumo do Processo</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium">Empresa</span>
            <p className="font-bold text-sm text-climbe-secondary">{empresa.tradeName || empresa.legalName}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium">Analista Responsável</span>
            <p className="font-bold text-sm text-climbe-secondary flex items-center gap-1">
              <User size={12} />
              {proposal?.responsibleAnalystId ? `#${proposal.responsibleAnalystId}` : 'Não definido'}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium">Proposta</span>
            <p className="font-bold text-sm text-climbe-secondary">#{proposal?.id ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Schedule meeting form */}
      {!reuniaoAgendada ? (
        <div className="space-y-6">
          <h3 className="font-bold italic text-climbe-secondary text-lg">Agendar Reunião de Apresentação</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Data da Reunião
              </Label>
              <Input
                type="date"
                required
                value={dataReuniao}
                onChange={e => setDataReuniao(e.target.value)}
                disabled={!canEdit || isBusy}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Horário
              </Label>
              <Input
                type="time"
                value={horaReuniao}
                onChange={e => setHoraReuniao(e.target.value)}
                disabled={!canEdit || isBusy}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Video size={14} /> Link da Videochamada
            </Label>
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={linkVideo}
              onChange={e => setLinkVideo(e.target.value)}
              disabled={!canEdit || isBusy}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          {canEdit && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                onClick={() => { setError(''); agendarMutation.mutate(); }}
                disabled={!dataReuniao || isBusy}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
              >
                {isBusy
                  ? <><Loader2 size={16} className="mr-2 animate-spin" /> AGENDANDO...</>
                  : 'AGENDAR REUNIÃO E NOTIFICAR'
                }
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Meeting scheduled confirmation */}
          <div className="flex flex-col items-center justify-center py-8 text-center bg-climbe-primary/10 rounded-3xl border border-climbe-primary/20">
            <div className="w-16 h-16 bg-climbe-primary rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-8 h-8 text-climbe-secondary" />
            </div>
            <h3 className="text-xl font-black italic text-climbe-secondary">Reunião Agendada</h3>
            <p className="text-climbe-secondary/80 mt-1 max-w-md mx-auto text-sm">
              Reunião marcada para {new Date(dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR')}
              {horaReuniao && ` às ${horaReuniao}`}. Convite enviado aos participantes.
            </p>
          </div>

          {/* Final decision */}
          {canEdit && (
            <div className="space-y-4">
              <h3 className="font-bold italic text-climbe-secondary text-lg">Decisão Final</h3>
              <p className="text-sm text-gray-500">
                {isCPOorP5
                  ? 'Como CPO / P5, você tem autoridade para encerrar o processo.'
                  : 'Aguardando decisão final do CPO ou P5.'}
              </p>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
                  {error}
                </p>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={isBusy}
                  className="flex-1 bg-red-50 text-red-500 hover:bg-red-100 font-black italic rounded-xl h-14"
                >
                  <XCircle className="mr-2" /> NÃO APROVADO — Retornar
                </Button>
                <Button
                  onClick={() => setShowApproveConfirm(true)}
                  disabled={isBusy}
                  className="flex-1 bg-climbe-primary text-climbe-secondary hover:scale-[1.02] transition-all font-black italic rounded-xl shadow-lg shadow-climbe-primary/20 h-14"
                >
                  <CheckCircle2 className="mr-2" /> APROVADO — Encerrar Processo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approve confirm dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => { setError(''); aprovaMutation.mutate(); }}
        title="Encerrar Processo com Aprovação Final?"
        description="Esta ação concluirá o processo de homologação. A empresa será notificada e o processo será marcado como concluído."
        confirmLabel="Sim, aprovar e encerrar"
        cancelLabel="Cancelar"
        variant="warning"
        isLoading={aprovaMutation.isPending}
      >
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Empresa:</span>
            <span className="font-bold text-climbe-secondary">{empresa.tradeName || empresa.legalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reunião:</span>
            <span className="font-bold text-climbe-secondary">
              {dataReuniao ? new Date(dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
              {horaReuniao && ` às ${horaReuniao}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Decisor:</span>
            <span className="font-bold text-climbe-secondary">{userRole}</span>
          </div>
        </div>
      </ConfirmDialog>

      {/* Reject confirm dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => { setError(''); reprovarMutation.mutate(); }}
        title="Retornar para Verificação Documental?"
        description="O processo será retornado para a etapa de verificação documental do próximo mês. O ciclo recomeçará a partir da documentação. A empresa será notificada."
        confirmLabel="Sim, retornar para próximo mês"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={reprovarMutation.isPending}
      />
    </div>
  );
}
