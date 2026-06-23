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
      className="form-modal-empresa max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <div className="max-h-[80vh] space-y-6 overflow-y-auto p-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {mode === 'edit' ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {mode === 'edit'
              ? 'Atualize os dados cadastrais, endereço e representante da empresa cliente.'
              : 'Preencha os dados cadastrais, endereço e representante da empresa cliente.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="form-field-label">Razão Social</Label>
              <Input
                required
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Razão social conforme contrato social"
                className="form-field-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">Nome Fantasia</Label>
              <Input
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                placeholder="Nome comercial da empresa"
                className="form-field-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">CNPJ</Label>
              <Input
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                placeholder="Digite o CNPJ"
                className="form-field-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">E-mail</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-mail corporativo"
                className="form-field-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                placeholder="Telefone com DDD"
                className="form-field-control"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-white/20">
            <h3 className="form-section-title mb-4">Endereço</h3>

            <div className="space-y-2">
              <Label className="form-field-label">CEP</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={handleCepBlur}
                    placeholder="Digite o CEP"
                    maxLength={9}
                    className="form-field-control pr-10"
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
                  className="shrink-0 border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  title="Buscar endereço pelo CEP"
                >
                  <Search size={16} />
                </Button>
              </div>
              {cepError && (
                <p className="text-[11px] font-medium text-red-500 dark:text-red-300">{cepError}</p>
              )}
              {!cepError && !cepLoading && (
                <p className="form-field-hint">
                  Digite o CEP para preencher logradouro, bairro, cidade e UF automaticamente.
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label className="form-field-label">Logradouro</Label>
                <Input
                  value={formData.address?.street || ''}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  placeholder="Rua, avenida ou logradouro"
                  className="form-field-control"
                />
              </div>

              <div className="space-y-2">
                <Label className="form-field-label">Número</Label>
                <Input
                  value={formData.address?.number || ''}
                  onChange={(e) => updateAddress('number', e.target.value)}
                  placeholder="Número"
                  className="form-field-control"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="form-field-label">Bairro</Label>
                <Input
                  value={formData.address?.neighborhood || ''}
                  onChange={(e) => updateAddress('neighborhood', e.target.value)}
                  placeholder="Bairro"
                  className="form-field-control"
                />
              </div>

              <div className="space-y-2">
                <Label className="form-field-label">Cidade</Label>
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="Cidade"
                  className="form-field-control"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="form-field-label">UF</Label>
                <Input
                  value={formData.address?.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="Sigla do estado"
                  maxLength={2}
                  className="form-field-control"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-white/20">
            <h3 className="form-section-title mb-4">Representante</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="form-field-label">Nome do Representante</Label>
                <Input
                  value={formData.representativeName}
                  onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                  placeholder="Nome completo do representante"
                  className="form-field-control"
                />
              </div>

              <div className="space-y-2">
                <Label className="form-field-label">CPF do Representante</Label>
                <Input
                  value={formData.representativeCpf}
                  onChange={(e) => setFormData({ ...formData, representativeCpf: maskCPF(e.target.value) })}
                  placeholder="Digite o CPF"
                  className="form-field-control"
                />
              </div>

              <div className="space-y-2">
                <Label className="form-field-label">Telefone do Representante</Label>
                <Input
                  value={formData.representativePhone}
                  onChange={(e) => setFormData({ ...formData, representativePhone: maskPhone(e.target.value) })}
                  placeholder="Telefone com DDD"
                  className="form-field-control"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 font-bold text-climbe-primary hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-climbe-primary font-black text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90"
            >
              {isSubmitting ? 'SALVANDO...' : mode === 'edit' ? 'ATUALIZAR EMPRESA' : 'SALVAR EMPRESA'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
