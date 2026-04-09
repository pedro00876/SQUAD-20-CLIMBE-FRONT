import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import type { Proposta, PropostaFormValues } from '@/types/proposta.types';
import type { Empresa } from '@/types/empresa.types';
import type { User } from '@/types/user.types';

interface PropostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProposta: Proposta | null;
  form: PropostaFormValues;
  onChangeForm: <K extends keyof PropostaFormValues>(field: K, value: PropostaFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  feedback: string | null;
  empresas: Empresa[];
  usuarios: User[];
}

export function PropostaModal({
  isOpen,
  onClose,
  editingProposta,
  form,
  onChangeForm,
  onSubmit,
  isSubmitting,
  feedback,
  empresas,
  usuarios,
}: PropostaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg bg-climbe-secondary text-white"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black italic text-white">
            {editingProposta ? 'Editar proposta' : 'Nova proposta'}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Associe a proposta à empresa, ao responsável e ao status atual.
          </p>
        </div>

        {feedback && (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">{feedback}</p>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="proposta-enterpriseId" className="font-bold text-white">
              Empresa
            </Label>
            <select
              id="proposta-enterpriseId"
              value={form.enterpriseId}
              onChange={(e) => onChangeForm('enterpriseId', e.target.value)}
              className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              required
            >
              <option value="">Selecione uma empresa</option>
              {empresas
                .filter((empresa) => empresa.id && empresa.legalName)
                .map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.tradeName || empresa.legalName}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposta-userId" className="font-bold text-white">
              Responsável
            </Label>
            <select
              id="proposta-userId"
              value={form.userId}
              onChange={(e) => onChangeForm('userId', e.target.value)}
              className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              required
            >
              <option value="">Selecione um responsável</option>
              {usuarios
                .filter((usuario) => usuario.id && usuario.fullName)
                .map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.fullName}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposta-status" className="font-bold text-white">
              Status
            </Label>
            <select
              id="proposta-status"
              value={form.status}
              onChange={(e) => onChangeForm('status', e.target.value)}
              className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANALISE">Em análise</option>
              <option value="APROVADA">Aprovada</option>
              <option value="RECUSADA">Recusada</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : editingProposta
                  ? 'Salvar alterações'
                  : 'Cadastrar proposta'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
