import { useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateEnterpriseRequest } from '@/services/enterprise.service';
import { cepService, CepNotFoundError } from '@/services/cep.service';
import { maskCPF, maskPhone, maskCEP, unmask } from '@/utils/masks';

const maskCNPJ = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

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
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const updateAddress = (field: keyof NonNullable<CreateEnterpriseRequest['address']>, value: string) => {
    setFormData((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  };

  const fillAddressFromCep = async (rawCep: string) => {
    const digits = unmask(rawCep);
    if (digits.length !== 8) return;

    setCepLoading(true);
    setCepError('');

    try {
      const address = await cepService.lookup(digits);
      setFormData((current) => ({
        ...current,
        address: {
          ...current.address,
          zipCode: address.zipCode,
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          number: current.address?.number ?? '',
        },
      }));
    } catch (err) {
      if (err instanceof CepNotFoundError) {
        setCepError('CEP não encontrado. Verifique o número digitado.');
      } else {
        setCepError(err instanceof Error ? err.message : 'Erro ao buscar CEP.');
      }
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (value: string) => {
    const masked = maskCEP(value);
    updateAddress('zipCode', masked);
    setCepError('');

    if (unmask(masked).length === 8) {
      void fillAddressFromCep(masked);
    }
  };

  const handleCepBlur = () => {
    const zipCode = formData.address?.zipCode ?? '';
    if (unmask(zipCode).length === 8 && !cepLoading) {
      void fillAddressFromCep(zipCode);
    }
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

        <form onSubmit={onSubmit} className="field-on-light space-y-4">
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

            {/* CEP first — auto-fill on lookup */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                CEP
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    maxLength={9}
                    className="bg-white pr-10 text-slate-900 placeholder:text-slate-400"
                  />
                  {cepLoading && (
                    <Loader2
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-climbe-primary"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={cepLoading || unmask(formData.address?.zipCode ?? '').length !== 8}
                  onClick={() => void fillAddressFromCep(formData.address?.zipCode ?? '')}
                  className="shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  title="Buscar endereço pelo CEP"
                >
                  <Search size={16} />
                </Button>
              </div>
              {cepError && (
                <p className="text-[11px] font-medium text-red-300">{cepError}</p>
              )}
              {!cepError && !cepLoading && (
                <p className="text-[10px] text-slate-400">
                  Digite o CEP para preencher logradouro, bairro, cidade e UF automaticamente.
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Cidade</Label>
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="Ex: Aracaju"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">UF</Label>
                <Input
                  value={formData.address?.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SE"
                  maxLength={2}
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
