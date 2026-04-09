import axios from 'axios';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { useEmpresas } from '@/features/empresas/hooks';
import {
  useCreateReuniao,
  useDeleteReuniao,
  useReunioes,
  useUpdateReuniao,
} from '@/features/reunioes/hooks';
import { useUsuarios } from '@/features/usuarios/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { Reuniao, ReuniaoFormValues } from '@/types/reuniao.types';

const initialForm: ReuniaoFormValues = {
  enterpriseId: '',
  title: '',
  date: '',
  time: '',
  inPerson: false,
  location: '',
  agenda: '',
  status: 'AGENDADA',
  participantIds: [],
};

function formatDateTime(date?: string, time?: string) {
  if (!date && !time) return 'Data não informada';
  return [date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '', time || ''].filter(Boolean).join(' às ');
}

export function ReunioesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null);
  const [form, setForm] = useState<ReuniaoFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = useReunioes({ page: 0, size: 20, search: debouncedSearch });
  const { data: empresasData } = useEmpresas({ page: 0, size: 100 });
  const { data: usuariosData } = useUsuarios({ page: 0, size: 100 });
  const createReuniao = useCreateReuniao();
  const updateReuniao = useUpdateReuniao();
  const deleteReuniao = useDeleteReuniao();

  useEffect(() => {
    if (!isModalOpen) {
      setEditingReuniao(null);
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
    setEditingReuniao(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(reuniao: Reuniao) {
    setFeedback(null);
    setEditingReuniao(reuniao);
    setForm({
      enterpriseId: String(reuniao.enterpriseId ?? ''),
      title: reuniao.title ?? '',
      date: reuniao.date ?? '',
      time: reuniao.time ?? '',
      inPerson: Boolean(reuniao.inPerson),
      location: reuniao.location ?? '',
      agenda: reuniao.agenda ?? '',
      status: reuniao.status || 'AGENDADA',
      participantIds: (reuniao.participantIds ?? []).map(String),
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const payload: Reuniao = {
      enterpriseId: Number(form.enterpriseId),
      title: form.title.trim(),
      date: form.date || undefined,
      time: form.time || undefined,
      inPerson: form.inPerson,
      location: form.location.trim(),
      agenda: form.agenda.trim(),
      status: form.status,
      participantIds: form.participantIds.map(Number),
    };

    try {
      if (editingReuniao?.id) {
        await updateReuniao.mutateAsync({ id: editingReuniao.id, payload });
        setFeedback('Reunião atualizada com sucesso.');
      } else {
        await createReuniao.mutateAsync(payload);
        setFeedback('Reunião cadastrada com sucesso.');
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível salvar a reunião. Verifique os dados e tente novamente.');
      console.error(error);
    }
  }

  async function handleDelete(reuniao: Reuniao) {
    const confirmed = window.confirm(`Deseja excluir a reunião "${reuniao.title}"?`);
    if (!confirmed) return;

    try {
      if (reuniao.id) {
        await deleteReuniao.mutateAsync(reuniao.id);
      }
      setFeedback('Reunião excluída com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;
      if (isNotFound) {
        setFeedback('Reunião excluída com sucesso.');
        await refetch();
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível excluir a reunião.');
      console.error(error);
    }
  }

  const fetchedReunioes = data?.content ?? [];
  const reunioes = fetchedReunioes.filter(
    (reuniao, index, array) =>
      !!reuniao.enterpriseId &&
      !!reuniao.title &&
      array.findIndex((item) => (item.id ? item.id === reuniao.id : item.title === reuniao.title)) === index,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Calendar size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agenda</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic text-climbe-secondary">Reuniões</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Acompanhe os próximos compromissos e registre novas reuniões com parceiros e clientes.
        </p>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por empresa, título ou status..."
            className="w-full max-w-xl"
          />
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Nova reunião
          </Button>
        </div>

        {feedback ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p> : null}
        {isLoading ? <p className="text-sm text-gray-400">Carregando reuniões...</p> : null}
        {isError ? <p className="text-sm text-red-500">Não foi possível carregar as reuniões.</p> : null}

        <div className="space-y-4">
          {reunioes.map((reuniao) => (
            <article
              key={reuniao.id ?? `${reuniao.enterpriseId}-${reuniao.title}`}
              className="flex flex-col gap-4 rounded-[28px] border border-gray-100 bg-[#FBFCFD] p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-climbe-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-climbe-primary">
                    {reuniao.status || 'AGENDADA'}
                  </span>
                </div>
                <h3 className="text-lg font-bold italic text-climbe-secondary">{reuniao.title}</h3>
                <p className="text-sm text-gray-500">{reuniao.enterpriseName || `Empresa ${reuniao.enterpriseId}`}</p>
                <p className="text-xs text-gray-400">{formatDateTime(reuniao.date, reuniao.time)}</p>
                <p className="text-xs text-gray-400">{reuniao.inPerson ? reuniao.location || 'Presencial' : 'Online'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditModal(reuniao)} aria-label="Editar reunião">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(reuniao)} aria-label="Excluir reunião">
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-climbe-secondary px-8 pb-8 pt-12 text-white"
      >
        <div className="w-full space-y-6">
          <div>
            <h3 className="text-xl font-black italic text-white">
              {editingReuniao ? 'Editar reunião' : 'Nova reunião'}
            </h3>
            <p className="mt-1 text-sm text-white/80">Associe a reunião à empresa e registre data, pauta e participantes.</p>
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
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.tradeName || empresa.legalName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-white">Título</Label>
              <Input
                id="title"
                className="text-black placeholder:text-gray-400"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ex.: Apresentação de resultados"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-bold text-white">Data</Label>
                <Input
                  id="date"
                  type="date"
                  className="text-black placeholder:text-gray-400"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="font-bold text-white">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  className="text-black placeholder:text-gray-400"
                  value={form.time}
                  onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-bold text-white">Local</Label>
              <Input
                id="location"
                className="text-black placeholder:text-gray-400"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Ex.: Google Meet ou Sala 02"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda" className="font-bold text-white">Pauta</Label>
              <Input
                id="agenda"
                className="text-black placeholder:text-gray-400"
                value={form.agenda}
                onChange={(event) => setForm((current) => ({ ...current, agenda: event.target.value }))}
                placeholder="Resumo do objetivo da reunião"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantIds" className="font-bold text-white">Participantes</Label>
              <select
                id="participantIds"
                multiple
                value={form.participantIds}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    participantIds: Array.from(event.target.selectedOptions, (option) => option.value),
                  }))
                }
                className="min-h-40 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              >
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.fullName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/70">Use `Ctrl` para selecionar mais de um participante.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-bold text-white">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              >
                <option value="AGENDADA">Agendada</option>
                <option value="REALIZADA">Realizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <label className="flex items-center gap-3 text-sm text-white">
              <input
                type="checkbox"
                checked={form.inPerson}
                onChange={(event) => setForm((current) => ({ ...current, inPerson: event.target.checked }))}
              />
              Reunião presencial
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createReuniao.isPending || updateReuniao.isPending}>
                {createReuniao.isPending || updateReuniao.isPending
                  ? 'Salvando...'
                  : editingReuniao
                    ? 'Salvar alterações'
                    : 'Cadastrar reunião'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
