import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateEnterpriseRequest } from '@/services/enterprise.service';

interface EmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: CreateEnterpriseRequest;
  setFormData: Dispatch<SetStateAction<CreateEnterpriseRequest>>;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
}

export function EmpresaModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: EmpresaModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[80vh] space-y-6 overflow-y-auto p-2">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white">Nova Empresa</h2>
          <p className="text-xs text-slate-300">Preencha os dados basicos da empresa cliente.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Razao Social</Label>
              <Input
                required
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Nome legal da empresa"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Nome Fantasia</Label>
              <Input
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                placeholder="Ex: Climbe"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">CNPJ</Label>
              <Input
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">E-mail</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="empresa@exemplo.com"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 0000-0000"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-climbe-primary">Representante</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                  Nome do Representante
                </Label>
                <Input
                  value={formData.representativeName}
                  onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                  placeholder="Nome completo"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
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
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90"
            >
              {isSubmitting ? 'SALVANDO...' : 'SALVAR EMPRESA'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
