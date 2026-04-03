import { useState, type FormEvent } from 'react';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReuniaoModal } from '@/features/reunioes/components';
import type { Reuniao, ReuniaoFormValues } from '@/types/reuniao.types';

const initialForm: ReuniaoFormValues = {
  titulo: '',
  dataHorario: '',
  local: '',
  descricao: '',
  participantes: '',
};

function formatDateTime(value?: string) {
  if (!value) return 'Data não informada';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const REUNIOES_STORAGE_KEY = 'climbe-demo-reunioes';

function createLocalId() {
  return String(Date.now() + Math.floor(Math.random() * 1000));
}

export function ReunioesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null);
  const [form, setForm] = useState<ReuniaoFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reunioes, setReunioes] = useState<Reuniao[]>(() => {
    const stored = window.localStorage.getItem(REUNIOES_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as Reuniao[];
    } catch {
      return [];
    }
  });

  function updateForm<K extends keyof ReuniaoFormValues>(field: K, value: ReuniaoFormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

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
      titulo: reuniao.titulo ?? '',
      dataHorario: reuniao.dataHorario ?? '',
      local: reuniao.local ?? '',
      descricao: reuniao.descricao ?? '',
      participantes: (reuniao.participantes ?? []).join(', '),
    });
    setIsModalOpen(true);
  }

  function handleDelete(reuniao: Reuniao) {
    const confirmed = window.confirm(`Deseja excluir a reunião "${reuniao.titulo}"?`);
    if (!confirmed) return;
    const updated = reunioes.filter((r) => r.id !== reuniao.id);
    setReunioes(updated);
    window.localStorage.setItem(REUNIOES_STORAGE_KEY, JSON.stringify(updated));
    setFeedback('Reunião excluída com sucesso.');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const participantesArr = form.participantes
      ? form.participantes.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    if (editingReuniao?.id) {
      const updated = reunioes.map((r) =>
        r.id === editingReuniao.id
          ? {
              ...r,
              titulo: form.titulo,
              dataHorario: form.dataHorario,
              local: form.local,
              descricao: form.descricao,
              participantes: participantesArr,
            }
          : r,
      );
      setReunioes(updated);
      window.localStorage.setItem(REUNIOES_STORAGE_KEY, JSON.stringify(updated));
      setFeedback('Reunião atualizada com sucesso.');
    } else {
      const novaReuniao: Reuniao = {
        id: createLocalId(),
        titulo: form.titulo,
        dataHorario: form.dataHorario,
        local: form.local,
        descricao: form.descricao,
        participantes: participantesArr,
      };
      const updated = [novaReuniao, ...reunioes];
      setReunioes(updated);
      window.localStorage.setItem(REUNIOES_STORAGE_KEY, JSON.stringify(updated));
      setFeedback('Reunião agendada com sucesso.');
    }

    setIsModalOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Calendar size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agenda</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Reuniões</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Acompanhe seus próximos compromissos e agende novas reuniões com parceiros.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          {feedback && (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p>
          )}
          <div className="ml-auto">
            <Button onClick={openCreateModal} className="gap-2">
              <Plus size={16} />
              Nova reunião
            </Button>
          </div>
        </div>

        {/* Mini calendário de dias */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          {[18, 19, 20, 21, 22, 23, 24].map((day) => (
            <div
              key={day}
              className={`min-w-[80px] h-24 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${day === 19 ? 'bg-climbe-primary text-climbe-secondary shadow-lg shadow-climbe-primary/20 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Mar</span>
              <span className="text-2xl font-black italic">{day}</span>
            </div>
          ))}
        </div>

        {/* Lista de reuniões */}
        <div className="space-y-4">
          {reunioes.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[40px] border border-dashed border-gray-200 px-8 py-14 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-200">
                <Calendar size={40} />
              </div>
              <h3 className="mt-4 text-xl font-bold italic text-climbe-secondary">Nenhuma reunião agendada</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-400">
                Clique em "Nova reunião" para agendar seu próximo compromisso.
              </p>
            </div>
          )}

          {reunioes.map((reuniao) => (
            <div
              key={reuniao.id}
              className="p-6 bg-gray-50 rounded-2xl border-l-4 border-climbe-primary flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-climbe-secondary italic">{reuniao.titulo}</h4>
                <p className="text-xs text-gray-400">
                  {formatDateTime(reuniao.dataHorario)}
                  {reuniao.local ? ` • ${reuniao.local}` : ''}
                </p>
                {reuniao.participantes && reuniao.participantes.length > 0 && (
                  <p className="text-xs text-gray-400">
                    Participantes: {reuniao.participantes.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(reuniao)}
                  aria-label="Editar reunião"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(reuniao)}
                  aria-label="Excluir reunião"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReuniaoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingReuniao={editingReuniao}
        form={form}
        onChangeForm={updateForm}
        onSubmit={handleSubmit}
        isSubmitting={false}
        feedback={null}
      />
    </div>
  );
}
