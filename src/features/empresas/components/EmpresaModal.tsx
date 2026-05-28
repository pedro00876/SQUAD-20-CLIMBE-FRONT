import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateEnterpriseRequest } from '@/services/enterprise.service';
import { maskCPF, maskPhone } from '@/utils/masks';

const maskCNPJ = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

const maskCEP = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');

interface EmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: CreateEnterpriseRequest;
  setFormData: Dispatch<SetStateAction<CreateEnterpriseRequest>>;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
  mode?: 'create' | 'edit';
}

export function EmpresaModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  mode = 'create',
}: EmpresaModalProps) {
  const updateAddress = (field: keyof NonNullable<CreateEnterpriseRequest['address']>, value: string) => {
    setFormData((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-2xl overflow-y-auto bg-climbe-secondary text-white"
    >
      <div className="max-h-[80vh] space-y-6 overflow-y-auto p-2">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white">
            {mode === 'edit' ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <p className="text-xs text-slate-300">
            {mode === 'edit'
              ? 'Atualize os dados cadastrais, endereço e representante da empresa cliente.'
              : 'Preencha os dados cadastrais, endereço e representante da empresa cliente.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Razão Social</Label>
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
                onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-climbe-primary">Endereço</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Logradouro</Label>
                <Input
                  value={formData.address?.street || ''}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Número</Label>
                <Input
                  value={formData.address?.number || ''}
                  onChange={(e) => updateAddress('number', e.target.value)}
                  placeholder="123"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Bairro</Label>
                <Input
                  value={formData.address?.neighborhood || ''}
                  onChange={(e) => updateAddress('neighborhood', e.target.value)}
                  placeholder="Ex: Centro"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">CEP</Label>
                <Input
                  value={formData.address?.zipCode || ''}
                  onChange={(e) => updateAddress('zipCode', maskCEP(e.target.value))}
                  placeholder="00000-000"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Cidade</Label>
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="Ex: Aracaju"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">UF</Label>
                <Input
                  value={formData.address?.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SE"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-climbe-primary">Representante</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
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

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                  CPF do Representante
                </Label>
                <Input
                  value={formData.representativeCpf}
                  onChange={(e) => setFormData({ ...formData, representativeCpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                  Telefone do Representante
                </Label>
                <Input
                  value={formData.representativePhone}
                  onChange={(e) => setFormData({ ...formData, representativePhone: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
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
              {isSubmitting ? 'SALVANDO...' : mode === 'edit' ? 'ATUALIZAR EMPRESA' : 'SALVAR EMPRESA'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
