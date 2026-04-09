import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsuarioModal } from '@/features/usuarios/components';
import {
  useCreateUsuario,
  useDeleteUsuario,
  useUpdateUsuario,
  useUsuarios,
} from '@/features/usuarios/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCPF } from '@/utils/formatCPF';
import { maskCPF, maskPhone, unmask } from '@/utils/masks';
import type { User, UserFormValues } from '@/types/user.types';

const initialForm: UserFormValues = {
  fullName: '',
  cpf: '',
  email: '',
  phone: '',
  status: 'ATIVO',
};

export function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = useUsuarios({ page: 0, size: 20, search: debouncedSearch });
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const deleteUsuario = useDeleteUsuario();

  useEffect(() => {
    if (!isModalOpen) {
      setForm(initialForm);
      setEditingUser(null);
    }
  }, [isModalOpen]);

  function openCreateModal() {
    setFeedback(null);
    setEditingUser(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setFeedback(null);
    setEditingUser(user);
    setForm({
      fullName: user.fullName ?? '',
      cpf: maskCPF(unmask(user.cpf)),
      email: user.email ?? '',
      phone: user.phone ? maskPhone(unmask(user.phone)) : '',
      status: user.status || 'ATIVO',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const payload: User = {
      fullName: form.fullName.trim(),
      cpf: maskCPF(unmask(form.cpf)),
      email: form.email.trim(),
      phone: form.phone ? maskPhone(unmask(form.phone)) : '',
      status: form.status,
    };

    try {
      if (editingUser?.id) {
        await updateUsuario.mutateAsync({ id: editingUser.id, payload });
        setFeedback('Usuário atualizado com sucesso.');
      } else {
        await createUsuario.mutateAsync(payload);
        setFeedback('Usuário cadastrado com sucesso.');
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível salvar o usuário. Verifique os dados e tente novamente.');
      console.error(error);
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(`Deseja excluir o usuário "${user.fullName}"?`);
    if (!confirmed) return;

    try {
      if (user.id) {
        await deleteUsuario.mutateAsync(user.id);
      }
      setFeedback('Usuário excluído com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

      if (isNotFound) {
        setFeedback('Usuário excluído com sucesso.');
        await refetch();
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível excluir o usuário.');
      console.error(error);
    }
  }

  const fetchedUsers = data?.content ?? [];

  const users = fetchedUsers.filter(
    (user, index, array) =>
      !!user.fullName &&
      !!user.cpf &&
      array.findIndex((item) => (item.id ? item.id === user.id : item.email === user.email)) === index,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Users size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic text-climbe-secondary">Usuários</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Administre os acessos e permissões dos usuários do sistema.
        </p>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-50 p-8 md:flex-row md:items-center md:justify-between">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="w-full max-w-md"
          />
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Novo usuário
          </Button>
        </div>

        <div className="p-8">
          {feedback ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p> : null}
          {isLoading ? <p className="text-sm text-gray-400">Carregando usuários...</p> : null}
          {isError ? <p className="text-sm text-red-500">Não foi possível carregar os usuários.</p> : null}
          {!isLoading && !isError && users.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum usuário encontrado.</p>
          ) : null}

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id ?? user.email}
                className="flex flex-col gap-4 rounded-2xl p-4 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-climbe-primary/20 text-xs font-black text-climbe-secondary">
                    {(user.fullName || 'US').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold italic text-climbe-secondary">{user.fullName}</h5>
                    <p className="text-xs text-gray-400">{user.email || 'E-mail não informado'}</p>
                    <p className="text-xs text-gray-400">{user.cpf ? formatCPF(unmask(user.cpf)) : 'CPF não informado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-600">
                    {user.status || 'ATIVO'}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} aria-label="Editar usuário">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} aria-label="Excluir usuário">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        form={form}
        onChangeForm={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        isSubmitting={createUsuario.isPending || updateUsuario.isPending}
        feedback={feedback}
      />
    </div>
  );
}
