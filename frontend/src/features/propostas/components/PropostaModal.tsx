import type { FormEvent } from 'react';
import { User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Enterprise } from '@/services/enterprise.service';

interface PropostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEnterpriseId: string;
  onSelectedEnterpriseIdChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
  enterprises: Enterprise[];
  responsibleName?: string;
}

export function PropostaModal({
  isOpen,
  onClose,
  selectedEnterpriseId,
  onSelectedEnterpriseIdChange,
  onSubmit,
  isSubmitting,
  enterprises,
  responsibleName,
}: PropostaModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg bg-climbe-secondary text-white">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white">Nova Proposta</h2>
          <p className="text-xs text-slate-300">Inicie um novo processo comercial selecionando o cliente.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Selecionar Empresa</Label>
            <select
              required
              value={selectedEnterpriseId}
              onChange={(e) => onSelectedEnterpriseIdChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:bg-white focus:ring-2 focus:ring-climbe-primary/40"
            >
              <option value="">Selecione uma empresa...</option>
              {enterprises.map((enterprise) => (
                <option key={enterprise.id} value={enterprise.id}>
                  {enterprise.tradeName || enterprise.legalName} ({enterprise.cnpj})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-climbe-primary">
              <User size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Responsável</span>
            </div>
            <p className="text-xs font-bold italic text-slate-200">{responsibleName || 'Usuário atual'}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedEnterpriseId}
              className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? 'CRIANDO...' : 'CRIAR PROPOSTA'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
