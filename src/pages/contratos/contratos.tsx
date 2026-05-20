import { ScrollText, Plus, Calendar, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { contractService, type CreateContractRequest } from '@/services/contract.service';
import { proposalService } from '@/services/proposal.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContratosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateContractRequest>({
    proposalId: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    totalValue: 0
  });

  const { data: contractsPage, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.list(0, 100)
  });

  const { data: proposalsPage } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.list(0, 100)
  });

  const createMutation = useMutation({
    mutationFn: contractService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setFormData({
        proposalId: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        totalValue: 0
      });
    }
  });

  // Somente propostas aprovadas que não têm contrato ainda (simplificado: todas as aprovadas)
  const approvedProposals = (proposalsPage?.content || []).filter((p: any) => 
    p.status === 'COMMERCIAL_PROPOSAL_APPROVED'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposalId) return;
    
    const proposal = approvedProposals.find((p: any) => p.id === formData.proposalId);
    
    createMutation.mutate(formData, {
      onSuccess: () => {
        // Notificar Compliance
        notificationService.notifyCompliance({
          razaoSocial: proposal?.enterpriseName,
          cnpj: proposal?.cnpj,
          analista: proposal?.responsibleAnalystName,
          dataInicio: formData.startDate
        });

        // Enviar e-mail para a empresa
        notificationService.sendEmail(
          proposal?.enterpriseEmail || 'contato@empresa.com',
          `Contrato disponível para assinatura — ${proposal?.enterpriseName}`,
          `Seu contrato foi gerado e está disponível para assinatura. Acesse o sistema para visualizar e assinar o documento.`
        );
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <ScrollText size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comercial</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Contratos</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Gerencie todos os contratos firmados e acompanhe seus períodos de vigência.
          </p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-climbe-primary text-climbe-secondary font-black italic rounded-2xl px-6 py-6 shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all shrink-0"
        >
          <Plus size={20} className="mr-2" />
          CRIAR NOVO CONTRATO
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : (contractsPage?.content || []).length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <ScrollText size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">Nenhum contrato formalizado</h3>
          <p className="text-sm text-gray-400 max-w-xs">Os contratos aparecerão aqui assim que forem gerados a partir de propostas aprovadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contractsPage.content.map((contract: any) => (
            <div key={contract.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8">
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-climbe-primary/10 text-climbe-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    <CheckCircle2 size={12} />
                    {contract.status || 'ATIVO'}
                 </span>
               </div>

               <div className="flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-climbe-primary flex items-center justify-center text-climbe-secondary">
                      <ScrollText size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-climbe-secondary italic">{contract.enterpriseName || 'Empresa'}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CONTRATO #{contract.id}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
                      </div>
                      <p className="text-xs font-bold text-climbe-secondary italic">
                        {contract.startDate ? format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR }) : '--'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <DollarSign size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Valor Total</span>
                      </div>
                      <p className="text-xs font-bold text-climbe-primary italic">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.totalValue || 0)}
                      </p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {[1, 2].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                           {i === 1 ? 'AD' : 'CL'}
                         </div>
                       ))}
                    </div>
                    <button className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline">Baixar PDF</button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Novo Contrato */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">Formalizar Contrato</h2>
            <p className="text-xs text-gray-400">Selecione uma proposta aprovada para gerar o contrato.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Proposta Aprovada</Label>
              <select 
                required
                value={formData.proposalId}
                onChange={e => setFormData({...formData, proposalId: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 appearance-none"
              >
                <option value="">Selecione uma proposta...</option>
                {approvedProposals.map((proposal: any) => (
                  <option key={proposal.id} value={proposal.id}>
                    #{proposal.id} - {proposal.enterpriseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Data de Início</Label>
              <Input 
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
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
                  value={formData.totalValue}
                  onChange={e => setFormData({...formData, totalValue: Number(e.target.value)})}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !formData.proposalId}
                className="flex-1 bg-climbe-primary text-climbe-secondary font-black italic rounded-xl shadow-lg shadow-climbe-primary/20"
              >
                {createMutation.isPending ? 'GERANDO...' : 'FINALIZAR CONTRATO'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
