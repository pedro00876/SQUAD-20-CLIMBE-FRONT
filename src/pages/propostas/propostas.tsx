import { FileText, Plus, User, Loader2, CheckCircle2, XCircle, Clock, ScrollText, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '@/services/proposal.service';
import { enterpriseService } from '@/services/enterprise.service';
import { contractService, type CreateContractRequest } from '@/services/contract.service';
import { PropostaModal } from '@/features/propostas/components';
import { ChecklistModal } from './components/ChecklistModal';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';

export function PropostasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
  
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistProposalId, setChecklistProposalId] = useState<number | null>(null);

  const [contractData, setContractData] = useState<CreateContractRequest>({
    proposalId: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: proposalsPage, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.list(0, 100),
  });

  const { data: enterprisesPage } = useQuery({
    queryKey: ['enterprises'],
    queryFn: () => enterpriseService.list(0, 100),
  });

  const createMutation = useMutation({
    mutationFn: proposalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsModalOpen(false);
      setSelectedEnterpriseId('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => proposalService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const contractMutation = useMutation({
    mutationFn: contractService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsContractModalOpen(false);
      setSelectedProposal(null);
    },
  });

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAnalystModalOpen, setIsAnalystModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAnalystId, setSelectedAnalystId] = useState('');

  const { data: usersPage } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(0, 100)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnterpriseId || !user?.id) return;

    createMutation.mutate({
      enterpriseId: Number(selectedEnterpriseId),
      userId: Number(user.id),
    });
  };

  const handleReject = () => {
    if (!selectedProposal || !rejectReason) return;
    
    statusMutation.mutate({ 
      id: selectedProposal.id, 
      status: 'COMMERCIAL_PROPOSAL_REJECTED' 
    }, {
      onSuccess: () => {
        notificationService.sendEmail(
          selectedProposal.enterpriseEmail || 'contato@empresa.com',
          `Proposta comercial reprovada — ${selectedProposal.enterpriseName}`,
          `Sua proposta foi reprovada pelo seguinte motivo: ${rejectReason}. Entre em contato para revisão.`
        );
        setIsRejectModalOpen(false);
        setRejectReason('');
      }
    });
  };

  const handleAssignAnalyst = () => {
    if (!selectedProposal || !selectedAnalystId) return;
    
    const analyst = (usersPage?.content || []).find((u: any) => u.id === Number(selectedAnalystId));
    
    proposalService.update(selectedProposal.id, { responsibleAnalystId: Number(selectedAnalystId) })
      .then(() => {
        if (analyst && analyst.email) {
          notificationService.sendEmail(
            analyst.email,
            `Você foi elencado como responsável pelo contrato — ${selectedProposal.enterpriseName}`,
            `Olá, ${analyst.fullName}. Você foi selecionado como analista responsável pelo contrato da empresa ${selectedProposal.enterpriseName}. Acesse o sistema para mais detalhes.`
          );
        }
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
        setIsAnalystModalOpen(false);
      });
  };

  // ... (rest of the component logic)
  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;
    contractMutation.mutate({
      ...contractData,
      proposalId: selectedProposal.id,
    });
  };

  const openContractModal = (proposal: any) => {
    setSelectedProposal(proposal);
    setContractData({
      proposalId: proposal.id,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsContractModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMMERCIAL_PROPOSAL_APPROVED' || s === 'APROVADA') {
      return 'bg-climbe-primary/10 text-climbe-primary border-climbe-primary/20';
    }
    if (s === 'COMMERCIAL_PROPOSAL_REJECTED' || s === 'RECUSADA') {
      return 'bg-red-50 text-red-500 border-red-100';
    }
    return 'bg-gray-50 text-gray-400 border-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMMERCIAL_PROPOSAL_APPROVED' || s === 'APROVADA') return <CheckCircle2 size={12} />;
    if (s === 'COMMERCIAL_PROPOSAL_REJECTED' || s === 'RECUSADA') return <XCircle size={12} />;
    return <Clock size={12} />;
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <FileText size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comercial</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-climbe-secondary">Propostas</h1>
          <p className="max-w-2xl font-light text-gray-400">
            Acompanhe o status de todas as propostas enviadas e em negociação.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          CRIAR NOVA PROPOSTA
        </Button>
      </div>

      {isLoadingProposals ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : (proposalsPage?.content || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[40px] border border-gray-100 bg-white p-20 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50 text-gray-200">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-bold italic text-climbe-secondary">Nenhuma proposta ativa</h3>
          <p className="max-w-xs text-sm text-gray-400">
            Clique no botão acima para criar sua primeira proposta comercial e iniciar o fluxo.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Empresa / Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Criado por</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Analista</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proposalsPage.content.map((proposal: any) => (
                  <tr key={proposal.id} className="group transition-colors hover:bg-gray-50/30">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-climbe-secondary text-xs font-black italic text-white">
                          {proposal.enterpriseName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold italic text-climbe-secondary">{proposal.enterpriseName}</p>
                          <p className="text-[10px] text-gray-400">ID: #{proposal.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-climbe-primary" />
                        <span className="text-xs font-medium text-gray-600">{proposal.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-400 font-medium">
                      {proposal.responsibleAnalystName || 'Pendente'}
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-400">
                      {proposal.createdAt ? format(new Date(proposal.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '--'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusStyle(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {proposal.status?.toUpperCase() === 'RECEIVED' && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedProposal(proposal);
                                setIsAnalystModalOpen(true); // Selecionar analista antes de aprovar ou como parte do processo
                                statusMutation.mutate({ id: proposal.id, status: 'COMMERCIAL_PROPOSAL_APPROVED' });
                              }}
                              className="p-2 text-climbe-primary hover:bg-climbe-primary/10 rounded-lg transition-all"
                              title="Aprovar"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedProposal(proposal);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                              title="Recusar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {proposal.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_APPROVED' && !proposal.responsibleAnalystId && (
                          <button 
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setIsAnalystModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-climbe-primary text-climbe-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all italic"
                          >
                            <User size={14} />
                            Selecionar Analista
                          </button>
                        )}
                        {proposal.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_APPROVED' && proposal.responsibleAnalystId && (
                          <>
                            <button 
                              onClick={() => openContractModal(proposal)}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
                            >
                              <ScrollText size={14} />
                              Gerar Contrato
                            </button>
                            <button 
                              onClick={() => {
                                setChecklistProposalId(proposal.id);
                                setIsChecklistModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-primary transition-all hover:bg-climbe-primary hover:text-climbe-secondary"
                            >
                              <FileText size={14} />
                              Checklist
                            </button>
                          </>
                        )}
                        <button className="px-2 text-[10px] font-black uppercase tracking-widest text-climbe-secondary hover:underline">Ver</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PropostaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedEnterpriseId={selectedEnterpriseId}
        onSelectedEnterpriseIdChange={setSelectedEnterpriseId}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        enterprises={enterprisesPage?.content || []}
        responsibleName={user?.name}
      />

      {/* Modal de Reprovação */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-red-500 italic tracking-tight">Reprovar Proposta</h2>
            <p className="text-xs text-gray-400">Informe o motivo da reprovação para notificar o cliente.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Motivo da Reprovação</Label>
              <textarea 
                required
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none border focus:border-red-500/20"
                placeholder="Descreva o motivo..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReject}
                disabled={statusMutation.isPending || !rejectReason}
                className="flex-1 bg-red-500 text-white font-black italic rounded-xl"
              >
                {statusMutation.isPending ? 'REPROVANDO...' : 'REPROVAR E NOTIFICAR'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Seleção de Analista */}
      <Modal isOpen={isAnalystModalOpen} onClose={() => setIsAnalystModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">Atribuir Analista</h2>
            <p className="text-xs text-gray-400">Selecione o profissional responsável por este contrato.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Selecionar Analista</Label>
              <select 
                required
                value={selectedAnalystId}
                onChange={e => setSelectedAnalystId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 appearance-none"
              >
                <option value="">Selecione um analista...</option>
                {(usersPage?.content || []).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.cargo || 'Analista'})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAnalystModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAssignAnalyst}
                disabled={!selectedAnalystId}
                className="flex-1 bg-climbe-primary text-climbe-secondary font-black italic rounded-xl"
              >
                ATRIBUIR E NOTIFICAR
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-climbe-secondary">Gerar Contrato</h2>
            <p className="text-xs text-gray-400">Formalize a parceria com {selectedProposal?.enterpriseName}.</p>
          </div>

          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Data de Início</Label>
              <Input
                type="date"
                required
                value={contractData.startDate}
                onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
              />
            </div>



            <div className="flex gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsContractModalOpen(false)} className="flex-1 font-bold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={contractMutation.isPending}
                className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20"
              >
                {contractMutation.isPending ? 'GERANDO...' : 'FINALIZAR CONTRATO'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ChecklistModal 
        isOpen={isChecklistModalOpen} 
        onClose={() => setIsChecklistModalOpen(false)} 
        proposalId={checklistProposalId} 
      />
    </div>
  );
}
