import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { maskCNPJ, maskCPF, maskPhone, unmask } from '@/utils/masks';
import type { Empresa, EmpresaFormValues } from '@/types/empresa.types';

interface EmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmpresa: Empresa | null;
  form: EmpresaFormValues;
  onChangeForm: <K extends keyof EmpresaFormValues>(field: K, value: EmpresaFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  feedback: string | null;
}

export function EmpresaModal({
  isOpen,
  onClose,
  editingEmpresa,
  form,
  onChangeForm,
  onSubmit,
  isSubmitting,
  feedback,
}: EmpresaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-2xl overflow-y-auto bg-climbe-secondary text-white"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black italic text-white">
            {editingEmpresa ? 'Editar empresa' : 'Nova empresa'}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Preencha os dados cadastrais, endereço completo e informações do representante legal.
          </p>
        </div>

        {feedback && (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">{feedback}</p>
        )}

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* Dados da empresa */}
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Dados da empresa</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="empresa-legalName" className="font-bold text-white">
              Razão social
            </Label>
            <Input
              id="empresa-legalName"
              className="text-black placeholder:text-gray-400"
              value={form.legalName}
              onChange={(e) => onChangeForm('legalName', e.target.value)}
              placeholder="Ex.: Climbe Investimentos LTDA"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="empresa-tradeName" className="font-bold text-white">
              Nome fantasia
            </Label>
            <Input
              id="empresa-tradeName"
              className="text-black placeholder:text-gray-400"
              value={form.tradeName}
              onChange={(e) => onChangeForm('tradeName', e.target.value)}
              placeholder="Ex.: Climbe"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="empresa-cnpj" className="font-bold text-white">
                CNPJ
              </Label>
              <Input
                id="empresa-cnpj"
                className="text-black placeholder:text-gray-400"
                value={form.cnpj}
                onChange={(e) => onChangeForm('cnpj', maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa-phone" className="font-bold text-white">
                Telefone de contato
              </Label>
              <Input
                id="empresa-phone"
                className="text-black placeholder:text-gray-400"
                value={form.phone}
                onChange={(e) => onChangeForm('phone', maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="empresa-email" className="font-bold text-white">
              E-mail de contato
            </Label>
            <Input
              id="empresa-email"
              type="email"
              className="text-black placeholder:text-gray-400"
              value={form.email}
              onChange={(e) => onChangeForm('email', e.target.value)}
              placeholder="contato@empresa.com.br"
              required
            />
          </div>

          {/* Endereço */}
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Endereço</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-2 space-y-3">
              <Label htmlFor="empresa-street" className="font-bold text-white">
                Logradouro
              </Label>
              <Input
                id="empresa-street"
                className="text-black placeholder:text-gray-400"
                value={form.street}
                onChange={(e) => onChangeForm('street', e.target.value)}
                placeholder="Ex.: Rua das Flores"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa-number" className="font-bold text-white">
                Número
              </Label>
              <Input
                id="empresa-number"
                className="text-black placeholder:text-gray-400"
                value={form.number}
                onChange={(e) => onChangeForm('number', e.target.value)}
                placeholder="Ex.: 123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="empresa-neighborhood" className="font-bold text-white">
                Bairro
              </Label>
              <Input
                id="empresa-neighborhood"
                className="text-black placeholder:text-gray-400"
                value={form.neighborhood}
                onChange={(e) => onChangeForm('neighborhood', e.target.value)}
                placeholder="Ex.: Centro"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa-zipCode" className="font-bold text-white">
                CEP
              </Label>
              <Input
                id="empresa-zipCode"
                className="text-black placeholder:text-gray-400"
                value={form.zipCode}
                onChange={(e) => onChangeForm('zipCode', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-2 space-y-3">
              <Label htmlFor="empresa-city" className="font-bold text-white">
                Cidade
              </Label>
              <Input
                id="empresa-city"
                className="text-black placeholder:text-gray-400"
                value={form.city}
                onChange={(e) => onChangeForm('city', e.target.value)}
                placeholder="Ex.: Aracaju"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa-state" className="font-bold text-white">
                UF
              </Label>
              <Input
                id="empresa-state"
                className="text-black placeholder:text-gray-400"
                value={form.state}
                onChange={(e) => onChangeForm('state', e.target.value)}
                maxLength={2}
                placeholder="SE"
              />
            </div>
          </div>

          {/* Representante Legal */}
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Representante legal</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="empresa-representativeName" className="font-bold text-white">
              Nome do representante legal
            </Label>
            <Input
              id="empresa-representativeName"
              className="text-black placeholder:text-gray-400"
              value={form.representativeName}
              onChange={(e) => onChangeForm('representativeName', e.target.value)}
              placeholder="Ex.: Maria da Silva"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="empresa-representativeCpf" className="font-bold text-white">
                CPF do representante
              </Label>
              <Input
                id="empresa-representativeCpf"
                className="text-black placeholder:text-gray-400"
                value={form.representativeCpf}
                onChange={(e) => onChangeForm('representativeCpf', maskCPF(e.target.value))}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa-representativePhone" className="font-bold text-white">
                Contato do representante
              </Label>
              <Input
                id="empresa-representativePhone"
                className="text-black placeholder:text-gray-400"
                value={form.representativePhone}
                onChange={(e) => onChangeForm('representativePhone', maskPhone(unmask(e.target.value)))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : editingEmpresa
                  ? 'Salvar alterações'
                  : 'Cadastrar empresa'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
