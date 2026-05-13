import { FileText, Plus, Search, Calendar, User, Building2, Loader2, CheckCircle2, XCircle, Clock, ScrollText, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService, type CreateProposalRequest } from '@/services/proposal.service';
import { enterpriseService } from '@/services/enterprise.service';
import { contractService, type CreateContractRequest } from '@/services/contract.service';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PropostasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
  
  const [contractData, setContractData] = useState<CreateContractRequest>({
    proposalId: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    totalValue: 0
  });

  const { data: proposalsPage, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.list(0, 100)
  });

  const { data: enterprisesPage } = useQuery({
    queryKey: ['enterprises'],
    queryFn: () => enterpriseService.list(0, 100)
  });

  const createMutation = useMutation({
    mutationFn: proposalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsModalOpen(false);
      setSelectedEnterpriseId('');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => proposalService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const contractMutation = useMutation({
    mutationFn: contractService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsContractModalOpen(false);
      setSelectedProposal(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnterpriseId || !user?.id) return;
    
    createMutation.mutate({
      enterpriseId: Number(selectedEnterpriseId),
      userId: Number(user.id)
    });
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;
    contractMutation.mutate({
      ...contractData,
      proposalId: selectedProposal.id
    });
  };

  const openContractModal = (proposal: any) => {
    setSelectedProposal(proposal);
    setContractData({
      proposalId: proposal.id,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      totalValue: 0
    });
    setIsContractModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMMERCIAL_PROPOSAL_APPROVED' || s === 'APROVADA') return 'bg-climbe-primary/10 text-climbe-primary border-climbe-primary/20';
    if (s === 'COMMERCIAL_PROPOSAL_REJECTED' || s === 'RECUSADA') return 'bg-red-50 text-red-500 border-red-100';
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <FileText size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comercial</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Propostas</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Acompanhe o status de todas as propostas enviadas e em negociação.
          </p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-climbe-primary text-climbe-secondary font-black italic rounded-2xl px-6 py-6 shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all shrink-0"
        >
          <Plus size={20} className="mr-2" />
          CRIAR NOVA PROPOSTA
        </Button>
      </div>

      {isLoadingProposals ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : (proposalsPage?.content || []).length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">Nenhuma proposta ativa</h3>
          <p className="text-sm text-gray-400 max-w-xs">Clique no botão acima para criar sua primeira proposta comercial e iniciar o fluxo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa / Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Criado por</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proposalsPage.content.map((proposal: any) => (
                  <tr key={proposal.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-climbe-secondary flex items-center justify-center text-white font-black italic text-xs">
                          {proposal.enterpriseName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-climbe-secondary italic">{proposal.enterpriseName}</p>
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
                      {proposal.createdAt ? format(new Date(proposal.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '--'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {proposal.status?.toUpperCase() === 'RECEIVED' && (
                          <>
                            <button 
                              onClick={() => statusMutation.mutate({ id: proposal.id, status: 'COMMERCIAL_PROPOSAL_APPROVED' })}
                              className="p-2 text-climbe-primary hover:bg-climbe-primary/10 rounded-lg transition-all"
                              title="Aprovar"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => statusMutation.mutate({ id: proposal.id, status: 'COMMERCIAL_PROPOSAL_REJECTED' })}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                              title="Recusar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {proposal.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_APPROVED' && (
                          <button 
                            onClick={() => openContractModal(proposal)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-climbe-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all italic"
                          >
                            <ScrollText size={14} />
                            Gerar Contrato
                          </button>
                        )}
                        <button className="text-[10px] font-black text-climbe-secondary uppercase tracking-widest hover:underline px-2">Ver</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Nova Proposta */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tight">Nova Proposta</h2>
            <p className="text-xs text-slate-300">Inicie um novo processo comercial selecionando o cliente.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Selecionar Empresa</Label>
              <select 
                required
                value={selectedEnterpriseId}
                onChange={e => setSelectedEnterpriseId(e.target.value)}
                className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-climbe-primary/40 transition-all outline-none border focus:border-climbe-primary/40 appearance-none"
              >
                <option value="">Selecione uma empresa...</option>
                {(enterprisesPage?.content || []).map((enterprise: any) => (
                  <option key={enterprise.id} value={enterprise.id}>
                    {enterprise.tradeName || enterprise.legalName} ({enterprise.cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
               <div className="flex items-center gap-2 text-climbe-primary">
                 <User size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Responsável</span>
               </div>
               <p className="text-xs font-bold text-slate-200 italic">{user?.name}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !selectedEnterpriseId}
                className="flex-1 bg-climbe-primary text-climbe-secondary font-black italic rounded-xl shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                {createMutation.isPending ? 'CRIANDO...' : 'CRIAR PROPOSTA'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Gerar Contrato */}
      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">Gerar Contrato</h2>
            <p className="text-xs text-gray-400">Formalize a parceria com {selectedProposal?.enterpriseName}.</p>
          </div>

          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Data de Início</Label>
              <Input 
                type="date"
                required
                value={contractData.startDate}
                onChange={e => setContractData({...contractData, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Valor Total (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-climbe-primary" size={16} />
                <Input 
                  type="number"
                  required
                  className="pl-10"
                  value={contractData.totalValue}
                  onChange={e => setContractData({...contractData, totalValue: Number(e.target.value)})}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsContractModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={contractMutation.isPending}
                className="flex-1 bg-climbe-primary text-climbe-secondary font-black italic rounded-xl shadow-lg shadow-climbe-primary/20"
              >
                {contractMutation.isPending ? 'GERANDO...' : 'FINALIZAR CONTRATO'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
