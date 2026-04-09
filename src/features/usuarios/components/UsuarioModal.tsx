import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { maskCPF, maskPhone } from '@/utils/masks';
import type { User, UserFormValues } from '@/types/user.types';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  form: UserFormValues;
  onChangeForm: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  feedback: string | null;
}

export function UsuarioModal({
  isOpen,
  onClose,
  editingUser,
  form,
  onChangeForm,
  onSubmit,
  isSubmitting,
  feedback,
}: UsuarioModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg bg-climbe-secondary text-white"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black italic text-white">
            {editingUser ? 'Editar usuário' : 'Novo usuário'}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Preencha os dados principais para salvar o cadastro.
          </p>
        </div>

        {feedback && (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">{feedback}</p>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="usuario-fullName" className="font-bold text-white">
              Nome completo
            </Label>
            <Input
              id="usuario-fullName"
              className="text-black placeholder:text-gray-400"
              value={form.fullName}
              onChange={(e) => onChangeForm('fullName', e.target.value)}
              placeholder="Ex.: João da Silva"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="usuario-cpf" className="font-bold text-white">
                CPF
              </Label>
              <Input
                id="usuario-cpf"
                className="text-black placeholder:text-gray-400"
                value={form.cpf}
                onChange={(e) => onChangeForm('cpf', maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-phone" className="font-bold text-white">
                Telefone
              </Label>
              <Input
                id="usuario-phone"
                className="text-black placeholder:text-gray-400"
                value={form.phone}
                onChange={(e) => onChangeForm('phone', maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-email" className="font-bold text-white">
              E-mail
            </Label>
            <Input
              id="usuario-email"
              type="email"
              className="text-black placeholder:text-gray-400"
              value={form.email}
              onChange={(e) => onChangeForm('email', e.target.value)}
              placeholder="joao@empresa.com.br"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-status" className="font-bold text-white">
              Status
            </Label>
            <select
              id="usuario-status"
              value={form.status}
              onChange={(e) => onChangeForm('status', e.target.value)}
              className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : editingUser
                  ? 'Salvar alterações'
                  : 'Cadastrar usuário'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
