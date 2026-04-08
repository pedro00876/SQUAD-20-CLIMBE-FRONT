import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { useEmpresas } from '@/features/empresas/hooks';
import {
  useCreateProposta,
  useDeleteProposta,
  usePropostas,
  useUpdateProposta,
} from '@/features/propostas/hooks';
import { useUsuarios } from '@/features/usuarios/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { Proposta, PropostaFormValues } from '@/types/proposta.types';

const initialForm: PropostaFormValues = {
  enterpriseId: '',
  userId: '',
  status: 'PENDENTE',
};

function formatDate(value?: string) {
  if (!value) return 'Data não informada';
  return new Date(value).toLocaleString('pt-BR');
}

export function PropostasPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [form, setForm] = useState<PropostaFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = usePropostas({ page: 0, size: 20, search: debouncedSearch });
  const { data: empresasData } = useEmpresas({ page: 0, size: 100 });
  const { data: usuariosData } = useUsuarios({ page: 0, size: 100 });
  const createProposta = useCreateProposta();
  const updateProposta = useUpdateProposta();
  const deleteProposta = useDeleteProposta();

  useEffect(() => {
    if (!isModalOpen) {
      setEditingProposta(null);
      setForm(initialForm);
    }
  }, [isModalOpen]);

  const fetchedEmpresas = empresasData?.content ?? [];
  const empresas = fetchedEmpresas.filter(
    (empresa, index, array) =>
      !!empresa.id &&
      !!empresa.legalName &&
      array.findIndex((item) => item.id === empresa.id) === index,
  );

  const fetchedUsuarios = usuariosData?.content ?? [];
  const usuarios = fetchedUsuarios.filter(
    (usuario, index, array) =>
      !!usuario.id &&
      !!usuario.fullName &&
      array.findIndex((item) => item.id === usuario.id) === index,
  );

  function openCreateModal() {
    setFeedback(null);
    setEditingProposta(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(proposta: Proposta) {
    setFeedback(null);
    setEditingProposta(proposta);
    setForm({
      enterpriseId: String(proposta.enterpriseId ?? ''),
      userId: String(proposta.userId ?? ''),
      status: proposta.status || 'PENDENTE',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const payload: Proposta = {
      enterpriseId: Number(form.enterpriseId),
      userId: Number(form.userId),
      status: form.status,
    };

    try {
      if (editingProposta?.id) {
        await updateProposta.mutateAsync({ id: editingProposta.id, payload });
        setFeedback('Proposta atualizada com sucesso.');
      } else {
        await createProposta.mutateAsync(payload);
        setFeedback('Proposta cadastrada com sucesso.');
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível salvar a proposta. Verifique os dados e tente novamente.');
      console.error(error);
    }
  }

  async function handleDelete(proposta: Proposta) {
    const confirmed = window.confirm(`Deseja excluir a proposta #${proposta.id}?`);
    if (!confirmed) return;

    try {
      if (proposta.id) {
        await deleteProposta.mutateAsync(proposta.id);
      }
      setFeedback('Proposta excluída com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

      if (isNotFound) {
        setFeedback('Proposta excluída com sucesso.');
        await refetch();
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível excluir a proposta.');
      console.error(error);
    }
  }

  const fetchedPropostas = data?.content ?? [];
  const propostas = fetchedPropostas.filter(
    (proposta, index, array) =>
      !!proposta.enterpriseId &&
      !!proposta.userId &&
      array.findIndex((item) =>
        item.id ? item.id === proposta.id : item.enterpriseId === proposta.enterpriseId && item.userId === proposta.userId,
      ) === index,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <FileText size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comercial</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic text-climbe-secondary">Propostas</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Acompanhe o status de todas as propostas enviadas e em negociação.
        </p>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por empresa, responsável ou status..."
            className="w-full max-w-xl"
          />
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Nova proposta
          </Button>
        </div>

        {feedback ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p> : null}
        {isLoading ? <p className="text-sm text-gray-400">Carregando propostas...</p> : null}
        {isError ? <p className="text-sm text-red-500">Não foi possível carregar as propostas.</p> : null}

        <div className="space-y-4">
          {propostas.map((proposta) => (
            <article
              key={proposta.id ?? `${proposta.enterpriseId}-${proposta.userId}`}
              className="flex flex-col gap-4 rounded-[28px] border border-gray-100 bg-[#FBFCFD] p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-climbe-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-climbe-primary">
                    {proposta.status || 'PENDENTE'}
                  </span>
                  <span className="text-xs text-gray-400">{proposta.id ? `#${proposta.id}` : 'Sem ID'}</span>
                </div>
                <h3 className="text-lg font-bold italic text-climbe-secondary">
                  {proposta.enterpriseName || `Empresa ${proposta.enterpriseId}`}
                </h3>
                <p className="text-sm text-gray-500">
                  Responsável: {proposta.userName || `Usuário ${proposta.userId}`}
                </p>
                <p className="text-xs text-gray-400">Criada em {formatDate(proposta.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditModal(proposta)} aria-label="Editar proposta">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(proposta)} aria-label="Excluir proposta">
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && !isError && propostas.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[40px] border border-dashed border-gray-200 px-8 py-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-200">
              <FileText size={40} />
            </div>
            <h3 className="mt-4 text-xl font-bold italic text-climbe-secondary">Nenhuma proposta encontrada</h3>
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Cadastre uma nova proposta comercial para começar o acompanhamento.
            </p>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-2xl bg-climbe-secondary text-white"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-black italic text-white">
              {editingProposta ? 'Editar proposta' : 'Nova proposta'}
            </h3>
            <p className="mt-1 text-sm text-white/80">Associe a proposta à empresa, ao responsável e ao status atual.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="enterpriseId" className="font-bold text-white">Empresa</Label>
              <select
                id="enterpriseId"
                value={form.enterpriseId}
                onChange={(event) => setForm((current) => ({ ...current, enterpriseId: event.target.value }))}
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
              <Label htmlFor="userId" className="font-bold text-white">Responsável</Label>
              <select
                id="userId"
                value={form.userId}
                onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
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
              <Label htmlFor="status" className="font-bold text-white">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANALISE">Em análise</option>
                <option value="APROVADA">Aprovada</option>
                <option value="RECUSADA">Recusada</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProposta.isPending || updateProposta.isPending}>
                {createProposta.isPending || updateProposta.isPending
                  ? 'Salvando...'
                  : editingProposta
                    ? 'Salvar alterações'
                    : 'Cadastrar proposta'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
