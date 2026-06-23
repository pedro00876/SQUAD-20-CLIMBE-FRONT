import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, FolderOpen, FileText, ScrollText, Table2, ShieldCheck, Loader2, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/Tooltip';
import { contractService } from '@/services/contract.service';
import { proposalService } from '@/services/proposal.service';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import { meetingService } from '@/features/reunioes/services';

interface Tarefa {
  id: string;
  descricao: string;
  responsavel: string;
  prazo: string;
}

const FERRAMENTAS = [
  { id: 'pastas',     icon: FolderOpen,  label: 'Pasta no Google Drive',    descricao: 'Ambiente de arquivos compartilhado'       },
  { id: 'documentos', icon: FileText,    label: 'Documentos (Drive)',        descricao: 'Acesso à pasta de documentos do contrato' },
  { id: 'contrato',   icon: ScrollText,  label: 'Contrato (Drive)',          descricao: 'Contrato assinado e armazenado em nuvem'  },
  { id: 'planilha',   icon: Table2,      label: 'Planilha (Google Sheets)',  descricao: 'Planilha de acompanhamento criada via API' },
] as const;

interface StageFerramentasProps {
  empresa: any;
  contract: any;
  userRole: string;
  canEdit: boolean;
  onConcluir: () => void;
}

export function StageFerramentas({ empresa, contract, userRole, canEdit, onConcluir }: StageFerramentasProps) {
  const queryClient = useQueryClient();
  const [primeirData, setPrimeirData] = useState('');
  const [cnae, setCnae] = useState('');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState({ descricao: '', responsavel: '', prazo: '' });
  const [toolsLiberadas, setToolsLiberadas] = useState(false);
  const [error, setError] = useState('');

  const { data: usersPage } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => userService.listUsers(0, 100),
  });
  const users = usersPage?.content || [];

  const liberarMutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error('Contrato não encontrado.');

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

      await proposalService.update(contract.proposalId, { status: 'READY_FOR_NEXT_STAGE' });

      await notificationService.sendEmail(
        empresa.email,
        `Ferramentas liberadas — ${empresa.tradeName || empresa.legalName}`,
        `Olá! As ferramentas de trabalho (Drive, Sheets, Contratos) foram liberadas. A operação foi oficialmente iniciada em ${primeirData}.`,
      );
      for (const u of users.filter((u: any) => u.role && u.role.toUpperCase().includes('ANALISTA'))) {
        if (u.email) {
          await notificationService.sendEmail(
            u.email,
            `Operação iniciada — ${empresa.tradeName || empresa.legalName}`,
            `As ferramentas foram liberadas e a Primeira Data registrada em ${primeirData}. Acesse o Drive para iniciar as análises.`,
          );
        }
      }
    },
    onSuccess: () => {
      setToolsLiberadas(true);
      queryClient.invalidateQueries({ queryKey: ['spreadsheets-contract', contract?.id] });
      queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', empresa.id] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || err?.message || 'Erro ao liberar ferramentas.'),
  });

  const addTarefa = () => {
    if (!novaTarefa.descricao) return;
    setTarefas(cur => [
      ...cur,
      { id: Date.now().toString(), ...novaTarefa },
    ]);
    setNovaTarefa({ descricao: '', responsavel: '', prazo: '' });
  };

  const removeTarefa = (id: string) => setTarefas(cur => cur.filter(t => t.id !== id));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <CalendarDays className="shrink-0" />
        <p className="font-medium mt-0.5">
          Documentos validados! Registre a <strong>Primeira Data</strong>, libere as ferramentas Google Drive/Sheets
          e crie a lista de tarefas para os analistas.
        </p>
      </div>

      {!toolsLiberadas ? (
        <div className="space-y-8">
          {/* Primeira Data — destaque visual */}
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
                <Label className="text-[10px] font-black uppercase tracking-widest">Data de Abertura</Label>
                <Input
                  type="date"
                  required
                  value={primeirData}
                  onChange={e => setPrimeirData(e.target.value)}
                  disabled={!canEdit || liberarMutation.isPending}
                  className="border-climbe-primary/30 focus:ring-climbe-primary/20"
                />
                {primeirData && (
                  <p className="text-xs text-climbe-primary font-bold">
                    {new Date(primeirData + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">CNAE do Contrato</Label>
                <Input
                  placeholder="Ex: 6920-6/01"
                  value={cnae}
                  onChange={e => setCnae(e.target.value)}
                  disabled={!canEdit || liberarMutation.isPending}
                />
                <p className="text-[10px] text-gray-400">Relate o CNAE com o contrato</p>
              </div>
            </div>
          </div>

          {/* Tools — lock/unlock cards */}
          <div>
            <h3 className="font-bold italic text-climbe-secondary text-lg mb-4">Ferramentas a Liberar</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FERRAMENTAS.map(f => {
                const Icon = f.icon;
                const isUnlocked = toolsLiberadas;
                return (
                  <Tooltip
                    key={f.id}
                    content={isUnlocked ? '' : 'Será desbloqueada ao confirmar a Primeira Data.'}
                    side="top"
                  >
                    <div
                      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 ${
                        isUnlocked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isUnlocked ? 'bg-green-100 text-green-600' : 'bg-climbe-primary/10 text-climbe-primary'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-climbe-secondary text-sm">{f.label}</h4>
                        <p className="text-xs text-gray-400">{f.descricao}</p>
                      </div>
                      <div className="transition-all duration-300">
                        {isUnlocked
                          ? <Unlock size={16} className="text-green-500" />
                          : <Lock size={16} className="text-gray-300" />
                        }
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Task board */}
          <div>
            <h3 className="font-bold italic text-climbe-secondary text-lg mb-4">Lista de Tarefas</h3>

            {tarefas.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {tarefas.map(t => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-climbe-secondary leading-tight">{t.descricao}</p>
                      <button
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

            {/* New task row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_130px_40px] gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Input
                placeholder="Descrição da tarefa"
                value={novaTarefa.descricao}
                onChange={e => setNovaTarefa(n => ({ ...n, descricao: e.target.value }))}
              />
              <Input
                placeholder="Responsável"
                value={novaTarefa.responsavel}
                onChange={e => setNovaTarefa(n => ({ ...n, responsavel: e.target.value }))}
              />
              <Input
                type="date"
                value={novaTarefa.prazo}
                onChange={e => setNovaTarefa(n => ({ ...n, prazo: e.target.value }))}
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
            <Tooltip content={!canEdit ? 'Apenas Analista Chefe pode liberar ferramentas.' : ''}>
              <Button
                onClick={() => { setError(''); liberarMutation.mutate(); }}
                disabled={!canEdit || !primeirData || liberarMutation.isPending}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {liberarMutation.isPending
                  ? <><Loader2 size={16} className="mr-2 animate-spin" /> LIBERANDO...</>
                  : 'REGISTRAR PRIMEIRA DATA E LIBERAR FERRAMENTAS'
                }
              </Button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black italic text-green-700">Ferramentas Liberadas</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto">
              O ambiente Drive/Sheets foi criado, todos os envolvidos foram notificados. O analista pode iniciar a criação do relatório.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Unlock size={14} className="text-green-500" />
              <span className="text-xs font-bold text-green-600">Ambiente Google Drive criado com sucesso</span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={onConcluir}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              AVANÇAR PARA RELATÓRIO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
