import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropostaModal } from '@/features/propostas/components';
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
import type { Empresa } from '@/types/empresa.types';
import type { User } from '@/types/user.types';

const initialForm: PropostaFormValues = {
  enterpriseId: '',
  userId: '',
  status: 'PENDENTE',
};

const EMPRESAS_STORAGE_KEY = 'climbe-demo-empresas';
const USUARIOS_STORAGE_KEY = 'climbe-demo-usuarios';
const PROPOSTAS_STORAGE_KEY = 'climbe-demo-propostas';

function createLocalId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatDate(value?: string) {
  if (!value) return 'Data não informada';
  return new Date(value).toLocaleString('pt-BR');
}

function normalizeProposta(base: Proposta, incoming: Partial<Proposta> | null | undefined, empresas: Empresa[], usuarios: User[]): Proposta {
  const enterpriseId = incoming?.enterpriseId ?? base.enterpriseId;
  const userId = incoming?.userId ?? base.userId;
  const empresa = empresas.find((item) => item.id === enterpriseId);
  const usuario = usuarios.find((item) => item.id === userId);

  return {
    id: incoming?.id ?? base.id ?? createLocalId(),
    enterpriseId,
    enterpriseName: incoming?.enterpriseName ?? base.enterpriseName ?? empresa?.tradeName ?? empresa?.legalName,
    userId,
    userName: incoming?.userName ?? base.userName ?? usuario?.fullName,
    status: incoming?.status ?? base.status,
    createdAt: incoming?.createdAt ?? base.createdAt,
  };
}

export function PropostasPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [form, setForm] = useState<PropostaFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [recentPropostas, setRecentPropostas] = useState<Proposta[]>(() => {
    const stored = window.localStorage.getItem(PROPOSTAS_STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored) as Proposta[];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    window.localStorage.setItem(PROPOSTAS_STORAGE_KEY, JSON.stringify(recentPropostas));
  }, [recentPropostas]);

  const storedEmpresas = (() => {
    const stored = window.localStorage.getItem(EMPRESAS_STORAGE_KEY);
    if (!stored) return [] as Empresa[];

    try {
      return JSON.parse(stored) as Empresa[];
    } catch {
      return [] as Empresa[];
    }
  })();

  const storedUsuarios = (() => {
    const stored = window.localStorage.getItem(USUARIOS_STORAGE_KEY);
    if (!stored) return [] as User[];

    try {
      return JSON.parse(stored) as User[];
    } catch {
      return [] as User[];
    }
  })();

  const empresas = [...storedEmpresas, ...(empresasData?.content ?? [])].filter(
    (empresa, index, array) =>
      !!empresa.id &&
      !!empresa.legalName &&
      array.findIndex((item) => item.id === empresa.id) === index,
  );

  const usuarios = [...storedUsuarios, ...(usuariosData?.content ?? [])].filter(
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
        const updatedProposta = await updateProposta.mutateAsync({ id: editingProposta.id, payload });
        const normalizedProposta = normalizeProposta(payload, updatedProposta, empresas, usuarios);
        setRecentPropostas((current) =>
          current.map((proposta) => (proposta.id === editingProposta.id ? normalizedProposta : proposta)),
        );
        setFeedback('Proposta atualizada com sucesso.');
      } else {
        const createdProposta = await createProposta.mutateAsync(payload);
        const normalizedProposta = normalizeProposta(payload, createdProposta, empresas, usuarios);
        setRecentPropostas((current) => [
          normalizedProposta,
          ...current.filter((proposta) =>
            normalizedProposta.id
              ? proposta.id !== normalizedProposta.id
              : !(proposta.enterpriseId === normalizedProposta.enterpriseId && proposta.userId === normalizedProposta.userId),
          ),
        ]);
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
      setRecentPropostas((current) => current.filter((item) => item.id !== proposta.id));
      setFeedback('Proposta excluída com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

      if (isNotFound) {
        setRecentPropostas((current) => current.filter((item) => item.id !== proposta.id));
        setFeedback('Proposta excluída com sucesso.');
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
  const propostas = [...recentPropostas, ...fetchedPropostas].filter(
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

      <PropostaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProposta={editingProposta}
        form={form}
        onChangeForm={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        isSubmitting={createProposta.isPending || updateProposta.isPending}
        feedback={feedback}
        empresas={empresas}
        usuarios={usuarios}
      />
    </div>
  );
}
