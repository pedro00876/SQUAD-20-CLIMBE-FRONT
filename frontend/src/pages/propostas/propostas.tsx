import { FileText, Plus, User, Loader2, CheckCircle2, XCircle, Clock, ScrollText, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '@/services/proposal.service';
import { enterpriseService } from '@/services/enterprise.service';
import { contractService, type CreateContractRequest } from '@/services/contract.service';
import { PropostaModal } from '@/features/propostas/components';
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
    totalValue: 0,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnterpriseId || !user?.id) return;

    createMutation.mutate({
      enterpriseId: Number(selectedEnterpriseId),
      userId: Number(user.id),
    });
  };

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
      totalValue: 0,
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
            Acompanhe o status de todas as propostas enviadas e em negociacao.
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
            Clique no botao acima para criar sua primeira proposta comercial e iniciar o fluxo.
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
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Acoes</th>
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
                              onClick={() => statusMutation.mutate({ id: proposal.id, status: 'COMMERCIAL_PROPOSAL_APPROVED' })}
                              className="rounded-lg p-2 text-climbe-primary transition-all hover:bg-climbe-primary/10"
                              title="Aprovar"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ id: proposal.id, status: 'COMMERCIAL_PROPOSAL_REJECTED' })}
                              className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-50"
                              title="Recusar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {proposal.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_APPROVED' && (
                          <button
                            onClick={() => openContractModal(proposal)}
                            className="flex items-center gap-1.5 rounded-xl bg-climbe-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
                          >
                            <ScrollText size={14} />
                            Gerar Contrato
                          </button>
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

      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-climbe-secondary">Gerar Contrato</h2>
            <p className="text-xs text-gray-400">Formalize a parceria com {selectedProposal?.enterpriseName}.</p>
          </div>

          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Data de Inicio</Label>
              <Input
                type="date"
                required
                value={contractData.startDate}
                onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
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
                  onChange={(e) => setContractData({ ...contractData, totalValue: Number(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
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
    </div>
  );
}
