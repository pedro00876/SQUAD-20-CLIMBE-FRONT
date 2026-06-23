import { useState } from 'react';
import { Building2, User, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { Enterprise } from '@/services/enterprise.service';

interface WizardUser {
  id: number;
  fullName?: string;
  role?: string;
  email?: string;
}

interface ProposalCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  enterprises: Enterprise[];
  users: WizardUser[];
  currentUserId?: number;
  currentUserName?: string;
  isSubmitting: boolean;
  onSubmit: (data: { enterpriseId: number; analystId?: number; meetingDate?: string }) => void;
}

type Step = 'empresa' | 'analista' | 'reuniao' | 'confirmar';

const STEPS: { id: Step; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'empresa',   label: 'Empresa',  icon: Building2 },
  { id: 'analista',  label: 'Analista', icon: User },
  { id: 'reuniao',   label: 'Reunião',  icon: CalendarDays },
  { id: 'confirmar', label: 'Confirmar',icon: CheckCircle2 },
];

export function ProposalCreateWizard({
  isOpen,
  onClose,
  enterprises,
  users,
  currentUserName,
  isSubmitting,
  onSubmit,
}: ProposalCreateWizardProps) {
  const [step, setStep] = useState<Step>('empresa');
  const [enterpriseId, setEnterpriseId] = useState('');
  const [analystId, setAnalystId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const stepIndex = STEPS.findIndex(s => s.id === step);
  const selectedEnterprise = enterprises.find(e => String(e.id) === enterpriseId);

  const reset = () => {
    setStep('empresa');
    setEnterpriseId('');
    setAnalystId('');
    setMeetingDate('');
    setMeetingTime('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleConfirm = () => {
    if (!enterpriseId) return;
    const meetingDatetime = meetingDate && meetingTime ? `${meetingDate}T${meetingTime}` : undefined;
    onSubmit({
      enterpriseId: Number(enterpriseId),
      analystId: analystId ? Number(analystId) : undefined,
      meetingDate: meetingDatetime,
    });
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="form-modal-shell max-w-lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Nova proposta</p>
          <h2 className="text-2xl font-black tracking-tight">Criar Proposta</h2>
          <p className="text-xs text-muted-foreground dark:text-slate-300">Siga os passos para iniciar o fluxo de onboarding.</p>
        </div>

        {/* Step progress */}
        <div className="grid grid-cols-4 gap-1">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isDone = i < stepIndex;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex min-w-0 items-center justify-center">
                <div className={`flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[8px] font-black uppercase tracking-wider transition-all sm:gap-1.5 sm:px-2.5 sm:text-[9px] ${
                  isActive
                    ? 'bg-climbe-primary text-climbe-secondary'
                    : isDone
                      ? 'bg-climbe-primary/15 text-climbe-secondary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon size={10} className="shrink-0" />
                  <span className="truncate">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[160px]">
          {step === 'empresa' && (
            <div className="space-y-4">
              <Label className="form-field-label">
                Selecionar Empresa *
              </Label>
              <Select
                required
                value={enterpriseId}
                onChange={e => setEnterpriseId(e.target.value)}
              >
                <option value="">Selecione uma empresa...</option>
                {enterprises.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.tradeName || e.legalName} ({e.cnpj})
                  </option>
                ))}
              </Select>
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
                <p>Responsável pelo cadastro: <strong className="text-foreground">{currentUserName || 'Usuário atual'}</strong></p>
              </div>
            </div>
          )}

          {step === 'analista' && (
            <div className="space-y-4">
              <Label className="form-field-label">
                Analista Responsável <span className="text-slate-400 normal-case font-medium">(opcional)</span>
              </Label>
              <Select
                value={analystId}
                onChange={e => setAnalystId(e.target.value)}
              >
                <option value="">Atribuir depois...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} {u.role ? `(${u.role})` : ''}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">Pode ser atribuído posteriormente na etapa de contrato.</p>
            </div>
          )}

          {step === 'reuniao' && (
            <div className="space-y-4">
              <Label className="form-field-label">
                Reunião Comercial <span className="text-slate-400 normal-case font-medium">(opcional)</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[9px] text-slate-400 uppercase tracking-wider mb-1 block">Data</Label>
                  <Input
                    type="date"
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="form-field-control"
                  />
                </div>
                <div>
                  <Label className="text-[9px] text-slate-400 uppercase tracking-wider mb-1 block">Horário</Label>
                  <Input
                    type="time"
                    value={meetingTime}
                    onChange={e => setMeetingTime(e.target.value)}
                    className="form-field-control"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">A reunião será criada e vinculada a esta empresa no Agenda & Reuniões.</p>
            </div>
          )}

          {step === 'confirmar' && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Resumo</p>
              <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Empresa</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {selectedEnterprise?.tradeName || selectedEnterprise?.legalName || '--'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Analista</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {analystId
                      ? users.find(u => String(u.id) === analystId)?.fullName || '--'
                      : 'A atribuir depois'}
                  </p>
                </div>
                {meetingDate && (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Reunião</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">{meetingDate} {meetingTime}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={stepIndex === 0 ? handleClose : handleBack}
            className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
          >
            {stepIndex === 0 ? 'Cancelar' : '← Voltar'}
          </Button>
          {step !== 'confirmar' ? (
            <Button
              type="button"
              disabled={step === 'empresa' && !enterpriseId}
              onClick={handleNext}
              className="flex-1 rounded-xl bg-climbe-primary font-black text-climbe-secondary disabled:bg-white/10 disabled:text-slate-400"
            >
              Próximo →
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-climbe-primary font-black text-climbe-secondary shadow-lg disabled:bg-white/10 disabled:text-slate-400"
            >
              {isSubmitting ? <><Loader2 size={14} className="mr-2 animate-spin" />CRIANDO...</> : 'CRIAR PROPOSTA'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
