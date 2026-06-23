import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, FileText, Users, CheckCircle2, Loader2, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StageAccessDenied } from '@/components/ui/StageAccessDenied';
import { meetingService } from '@/features/reunioes/services';
import { proposalService } from '@/services/proposal.service';
import { notificationService } from '@/services/notification.service';

interface StageReuniaoProps {
  empresa: any;
  proposal: any | null;
  userId?: number;
  canEdit: boolean;
  onConcluir: () => void;
}

export function StageReuniao({ empresa, proposal, userId, canEdit, onConcluir }: StageReuniaoProps) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('Reunião Inicial com ' + (empresa.tradeName || empresa.legalName));
  const [dataReuniao, setDataReuniao] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [pauta, setPauta] = useState('');
  const [presencial, setPresencial] = useState(false);
  const [local, setLocal] = useState('');
  const [error, setError] = useState('');
  const [savedOk, setSavedOk] = useState(false);

  // Inline validation errors
  const [dateError, setDateError] = useState('');
  const [pautaError, setPautaError] = useState('');

  const validateDate = (val: string) => {
    if (!val) { setDateError(''); return; }
    const selected = new Date(val + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selected < today) {
      setDateError('A data não pode ser no passado.');
    } else {
      setDateError('');
    }
  };

  const validatePauta = (val: string) => {
    if (val && val.trim().length > 0 && val.trim().length < 20) {
      setPautaError('A pauta deve ter pelo menos 20 caracteres.');
    } else {
      setPautaError('');
    }
  };

  const reuniaoMutation = useMutation({
    mutationFn: async () => {
      await meetingService.createMeeting({
        enterpriseId: empresa.id,
        title: titulo,
        date: dataReuniao,
        time: horaInicio || undefined,
        endTime: horaFim || undefined,
        inPerson: presencial,
        location: local || undefined,
        agenda: pauta,
        status: 'SCHEDULED',
        participantIds: userId ? [userId] : [],
      });

      let proposalId = proposal?.id;
      if (!proposalId && userId) {
        const nova = await proposalService.create({
          enterpriseId: empresa.id,
          userId,
        });
        proposalId = nova.id;
      }

      if (proposalId) {
        await proposalService.updateStatus(proposalId, 'IN_TRIAGE');
      }

      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Reunião agendada — ${empresa.tradeName || empresa.legalName}`,
          `Uma reunião foi registrada: "${titulo}" em ${dataReuniao}. Pauta: ${pauta}`,
        );
      }
    },
    onSuccess: () => {
      setSavedOk(true);
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      onConcluir();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err?.message || 'Não foi possível registrar a reunião.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (dateError || pautaError) return;
    reuniaoMutation.mutate();
  };

  const status = (proposal?.status || '').toUpperCase();
  const alreadySaved = !!proposal && ['IN_TRIAGE', 'ELIGIBLE', 'PENDING_ADJUSTMENTS'].includes(status);

  // ── Read-only card when meeting already saved ──────────────────────────────
  if (alreadySaved) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-6 rounded-2xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-black italic text-green-700 text-lg">Reunião Registrada</h3>
            <p className="text-green-600/80 text-sm mt-0.5">
              A reunião foi registrada e a proposta entrou em triagem. Prossiga para a próxima etapa.
            </p>
          </div>
        </div>

        {/* Summary of proposal data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
              <FileText size={11} /> Proposta
            </span>
            <p className="font-bold text-climbe-secondary text-sm">#{proposal.id}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
              <Clock size={11} /> Status
            </span>
            <p className="font-bold text-climbe-secondary text-sm capitalize">{status.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!canEdit) {
    return (
      <StageAccessDenied
        requiredRoles={['CMO', 'CEO']}
        currentStageLabel="Reunião"
        hint="Apenas CMO ou CEO pode registrar reuniões e iniciar a triagem."
      />
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6">
        <p className="font-medium">
          Registre os detalhes da reunião inicial com <strong>{empresa.tradeName || empresa.legalName}</strong>.
          Ao salvar, uma proposta é criada automaticamente e a triagem é iniciada.
        </p>
      </div>

      {savedOk && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm">
          <CheckCircle2 size={18} />
          <span className="font-medium">Reunião registrada com sucesso! Proposta em triagem.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Título da Reunião
          </Label>
          <Input
            required
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            disabled={reuniaoMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Data
            </Label>
            <Input
              type="date"
              required
              value={dataReuniao}
              onChange={e => { setDataReuniao(e.target.value); validateDate(e.target.value); }}
              disabled={reuniaoMutation.isPending}
              className={dateError ? 'border-red-400 focus:ring-red-400/20' : ''}
            />
            {dateError && <p className="text-[11px] text-red-500 font-medium">{dateError}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Hora início
            </Label>
            <Input
              type="time"
              value={horaInicio}
              onChange={e => setHoraInicio(e.target.value)}
              disabled={reuniaoMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Hora fim
            </Label>
            <Input
              type="time"
              value={horaFim}
              onChange={e => setHoraFim(e.target.value)}
              disabled={reuniaoMutation.isPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              id="presencial"
              checked={presencial}
              onChange={e => setPresencial(e.target.checked)}
              disabled={reuniaoMutation.isPending}
              className="w-5 h-5 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
            />
            <label htmlFor="presencial" className="text-sm font-medium text-climbe-secondary cursor-pointer">
              Reunião presencial
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              {presencial ? <MapPin size={14} /> : <Users size={14} />} Local / Link
            </Label>
            <Input
              placeholder={presencial ? 'Ex: Sala de reuniões 3' : 'https://meet.google.com/...'}
              value={local}
              onChange={e => setLocal(e.target.value)}
              disabled={reuniaoMutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Pauta / Resumo
          </Label>
          <textarea
            required
            value={pauta}
            onChange={e => { setPauta(e.target.value); validatePauta(e.target.value); }}
            disabled={reuniaoMutation.isPending}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 transition-all outline-none border ${pautaError ? 'border-red-400 focus:ring-red-400/20' : 'focus:ring-climbe-primary/10 focus:border-climbe-primary/20'}`}
            placeholder="Descreva os principais pontos a serem discutidos (mínimo 20 caracteres)..."
          />
          {pautaError && <p className="text-[11px] text-red-500 font-medium">{pautaError}</p>}
          {pauta.length > 0 && !pautaError && (
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <CheckCircle2 size={11} /> Pauta válida
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <Button
            type="submit"
            disabled={reuniaoMutation.isPending || !!dateError || !!pautaError}
            className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20"
          >
            {reuniaoMutation.isPending
              ? <><Loader2 size={16} className="mr-2 animate-spin" /> SALVANDO...</>
              : 'SALVAR REUNIÃO E INICIAR TRIAGEM'
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
