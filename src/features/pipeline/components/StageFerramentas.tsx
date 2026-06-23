import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ShieldCheck, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/Tooltip';
import { contractService } from '@/services/contract.service';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import { meetingService } from '@/features/reunioes/services';
import { hasPrimeiraDataMeeting } from '@/features/pipeline/utils/deriveStage';

interface Tarefa {
  id: string;
  descricao: string;
  responsavel: string;
  prazo: string;
}

interface StageFerramentasProps {
  empresa: any;
  contract: any;
  userRole: string;
  canEdit: boolean;
  meetings?: { title?: string }[];
  onConcluir: () => void | Promise<void>;
}

export function StageFerramentas({
  empresa,
  contract,
  canEdit,
  meetings = [],
  onConcluir,
}: StageFerramentasProps) {
  const queryClient = useQueryClient();
  const [primeirData, setPrimeirData] = useState('');
  const [cnae, setCnae] = useState('');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState({ descricao: '', responsavel: '', prazo: '' });
  const [registrado, setRegistrado] = useState(() => hasPrimeiraDataMeeting(meetings));
  const [error, setError] = useState('');
  const [avancando, setAvancando] = useState(false);

  useEffect(() => {
    if (hasPrimeiraDataMeeting(meetings)) {
      setRegistrado(true);
    }
  }, [meetings]);

  const { data: usersPage } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => userService.listUsers(0, 100),
  });
  const users = usersPage?.content || [];

  const handleAvancar = async () => {
    setAvancando(true);
    try {
      await onConcluir();
    } finally {
      setAvancando(false);
    }
  };

  const registrarMutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error('Contrato não encontrado.');
      if (!primeirData) throw new Error('Informe a data de abertura.');

      await meetingService.createMeeting({
        enterpriseId: empresa.id,
        title: `Primeira Data — ${empresa.tradeName || empresa.legalName}`,
        date: primeirData,
        inPerson: false,
        agenda: `Abertura oficial da operação. CNAE: ${cnae || 'a preencher'}`,
        status: 'CONCLUDED',
      });

      const analystIds = users
        .filter((u: any) => u.role && u.role.toUpperCase().includes('ANALISTA'))
        .map((u: any) => u.id);

      if (analystIds.length > 0) {
        await contractService.allocateTeam(contract.id, analystIds, 'ANALISTA');
      }

      if (cnae) {
        await contractService.update(contract.id, { status: `ATIVO_CNAE_${cnae}` });
      }

      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Primeira Data registrada — ${empresa.tradeName || empresa.legalName}`,
          `A operação foi oficialmente iniciada em ${new Date(primeirData + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
        );
      }

      for (const u of users.filter((u: any) => u.role && u.role.toUpperCase().includes('ANALISTA'))) {
        if (u.email) {
          await notificationService.sendEmail(
            u.email,
            `Operação iniciada — ${empresa.tradeName || empresa.legalName}`,
            `A Primeira Data foi registrada em ${new Date(primeirData + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
          );
        }
      }
    },
    onSuccess: async () => {
      setRegistrado(true);
      await queryClient.invalidateQueries({ queryKey: ['meetings-enterprise', empresa.id] });
      await queryClient.refetchQueries({ queryKey: ['meetings-enterprise', empresa.id] });
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
      await handleAvancar();
    },
    onError: (err: any) => setError(err?.response?.data?.message || err?.message || 'Erro ao registrar Primeira Data.'),
  });

  const addTarefa = () => {
    if (!novaTarefa.descricao) return;
    setTarefas((cur) => [...cur, { id: Date.now().toString(), ...novaTarefa }]);
    setNovaTarefa({ descricao: '', responsavel: '', prazo: '' });
  };

  const removeTarefa = (id: string) => setTarefas((cur) => cur.filter((t) => t.id !== id));

  if (registrado) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
          <ShieldCheck className="w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-2xl font-black italic text-green-700">Primeira Data Registrada</h3>
          <p className="text-green-600/80 mt-2 max-w-md mx-auto text-sm">
            A equipe foi notificada. O pipeline avançou para a etapa de relatório.
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleAvancar}
            disabled={avancando}
            className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 h-12"
          >
            {avancando ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> CARREGANDO...
              </>
            ) : (
              'IR PARA RELATÓRIO'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <CalendarDays className="shrink-0" />
        <p className="font-medium mt-0.5">
          Documentos validados! Registre a <strong>Primeira Data</strong> da operação e organize as tarefas iniciais dos analistas.
        </p>
      </div>

      <div className="p-6 bg-climbe-primary/5 rounded-3xl border-2 border-climbe-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-climbe-primary rounded-full flex items-center justify-center shrink-0">
            <CalendarDays size={18} className="text-climbe-secondary" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-climbe-primary">Primeira Data</span>
            <p className="text-xs text-gray-400 font-light">Data oficial de abertura da operação</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest">Data de Abertura *</Label>
            <Input
              type="date"
              required
              value={primeirData}
              onChange={(e) => setPrimeirData(e.target.value)}
              disabled={!canEdit || registrarMutation.isPending}
              className="border-climbe-primary/30 focus:ring-climbe-primary/20"
            />
            {primeirData && (
              <p className="text-xs text-climbe-primary font-bold">
                {new Date(primeirData + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest">CNAE do Contrato</Label>
            <Input
              placeholder="Ex: 6920-6/01"
              value={cnae}
              onChange={(e) => setCnae(e.target.value)}
              disabled={!canEdit || registrarMutation.isPending}
            />
            <p className="text-[10px] text-gray-400">Opcional — vinculado ao contrato</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold italic text-climbe-secondary text-lg mb-4">Lista de Tarefas</h3>
        <p className="text-xs text-gray-400 mb-4">Organização local — não é persistida no servidor.</p>

        {tarefas.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {tarefas.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-climbe-secondary leading-tight">{t.descricao}</p>
                  <button
                    type="button"
                    onClick={() => removeTarefa(t.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
                  {t.responsavel && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t.responsavel}
                    </span>
                  )}
                  {t.prazo && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(t.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_130px_40px] gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Input
            placeholder="Descrição da tarefa"
            value={novaTarefa.descricao}
            onChange={(e) => setNovaTarefa((n) => ({ ...n, descricao: e.target.value }))}
          />
          <Input
            placeholder="Responsável"
            value={novaTarefa.responsavel}
            onChange={(e) => setNovaTarefa((n) => ({ ...n, responsavel: e.target.value }))}
          />
          <Input
            type="date"
            value={novaTarefa.prazo}
            onChange={(e) => setNovaTarefa((n) => ({ ...n, prazo: e.target.value }))}
          />
          <Button
            type="button"
            onClick={addTarefa}
            variant="outline"
            className="shrink-0 h-10 w-10 p-0 flex items-center justify-center"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Tooltip content={!canEdit ? 'Apenas Analista Chefe pode registrar a Primeira Data.' : ''}>
          <Button
            onClick={() => {
              setError('');
              registrarMutation.mutate();
            }}
            disabled={!canEdit || !primeirData || registrarMutation.isPending}
            className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {registrarMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> REGISTRANDO...
              </>
            ) : (
              'REGISTRAR PRIMEIRA DATA E AVANÇAR'
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
