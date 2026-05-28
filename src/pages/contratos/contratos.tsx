import { ScrollText, Plus, Calendar, DollarSign, Loader2, CheckCircle2, Eye, Download, PenLine } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { contractService, type Contract, type CreateContractRequest } from '@/services/contract.service';
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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
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

  const signMutation = useMutation({
    mutationFn: (contractId: number) => contractService.update(contractId, { status: 'DIGITALLY_SIGNED' }),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedContract(updatedContract);
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

  const getContractStatusLabel = (status?: string) => {
    switch ((status || '').toUpperCase()) {
      case 'DIGITALLY_SIGNED':
        return 'ASSINADO';
      case 'PENDING_SIGNATURE':
        return 'AGUARDANDO ASSINATURA';
      default:
        return status || 'ATIVO';
    }
  };

  const isContractSigned = (contract?: Contract | null) => {
    return contract?.status?.toUpperCase() === 'DIGITALLY_SIGNED';
  };

  const getContractHtml = (contract: Contract) => {
    const companyName = contract.enterpriseName || contract.proposalEnterpriseName || 'Empresa contratante';
    const startDate = contract.startDate
      ? format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })
      : '--';
    const endDate = contract.endDate
      ? format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })
      : 'prazo indeterminado';
    const status = getContractStatusLabel(contract.status);

    return `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Contrato ${contract.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 48px; line-height: 1.6; }
            header { border-bottom: 3px solid #79C6C0; margin-bottom: 32px; padding-bottom: 18px; }
            h1 { font-size: 28px; margin: 0 0 8px; }
            .meta { color: #6b7280; font-size: 13px; }
            .box { border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin: 20px 0; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; font-weight: 700; }
            .value { font-weight: 700; margin-top: 4px; }
            .signature { margin-top: 72px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; }
            .line { border-top: 1px solid #111827; padding-top: 10px; text-align: center; font-size: 13px; }
            @media print { body { margin: 32px; } button { display: none; } }
          </style>
        </head>
        <body>
          <header>
            <h1>Contrato de Prestacao de Servicos</h1>
            <div class="meta">Contrato #${contract.id} | Proposta #${contract.proposalId} | Status: ${status}</div>
          </header>

          <section class="box">
            <div class="grid">
              <div>
                <div class="label">Contratante</div>
                <div class="value">${companyName}</div>
              </div>
              <div>
                <div class="label">Contratada</div>
                <div class="value">Climbe Investimentos</div>
              </div>
              <div>
                <div class="label">Inicio da vigencia</div>
                <div class="value">${startDate}</div>
              </div>
              <div>
                <div class="label">Termino</div>
                <div class="value">${endDate}</div>
              </div>
            </div>
          </section>

          <section>
            <p>
              Pelo presente instrumento, as partes identificadas acima formalizam a contratacao dos servicos
              vinculados a proposta comercial aprovada, observando as condicoes negociadas entre contratante
              e contratada.
            </p>
            <p>
              A assinatura digital registrada neste sistema representa a ciencia e o aceite das partes quanto
              ao andamento do contrato para a proxima etapa operacional.
            </p>
          </section>

          <section class="signature">
            <div class="line">Climbe Investimentos</div>
            <div class="line">${companyName}</div>
          </section>
        </body>
      </html>
    `;
  };

  const openContractDocument = (contract: Contract, print = false) => {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return;

    popup.document.open();
    popup.document.write(getContractHtml(contract));
    popup.document.close();

    if (print) {
      popup.onload = () => {
        popup.focus();
        popup.print();
      };
    }
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
                    {getContractStatusLabel(contract.status)}
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

                 <div className="flex items-center justify-between gap-4">
                    <div className="flex -space-x-2">
                       {[1, 2].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                           {i === 1 ? 'AD' : 'CL'}
                         </div>
                       ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedContract(contract)}
                        className="text-[10px] font-black text-climbe-secondary uppercase tracking-widest hover:text-climbe-primary transition-colors"
                      >
                        Visualizar/Assinar
                      </button>
                      <button
                        type="button"
                        onClick={() => openContractDocument(contract, true)}
                        className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline"
                      >
                        Baixar PDF
                      </button>
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Novo Contrato */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg bg-climbe-secondary text-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-white">Formalizar Contrato</h2>
            <p className="text-xs text-slate-300">Selecione uma proposta aprovada para gerar o contrato.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Proposta Aprovada</Label>
              <select 
                required
                value={formData.proposalId}
                onChange={e => setFormData({...formData, proposalId: Number(e.target.value)})}
                className="w-full rounded-xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/40 appearance-none"
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Data de Início</Label>
              <Input 
                type="date"
                required
                className="bg-white text-slate-900"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Valor Total (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-climbe-primary" size={16} />
                <Input 
                  type="number"
                  required
                  className="bg-white pl-10 text-slate-900"
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
                className="flex-1 font-black uppercase tracking-widest text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !formData.proposalId}
                className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                {createMutation.isPending ? 'GERANDO...' : 'FINALIZAR CONTRATO'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={!!selectedContract} onClose={() => setSelectedContract(null)}>
        {selectedContract && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Contrato para assinatura</p>
                <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">
                  Contrato #{selectedContract.id}
                </h2>
                <p className="text-xs text-gray-400">
                  Visualize a minuta, baixe/imprima o PDF pelo navegador e confirme a assinatura digital.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-climbe-primary/10 text-climbe-primary text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
                <CheckCircle2 size={12} />
                {getContractStatusLabel(selectedContract.status)}
              </span>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Empresa</p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.enterpriseName || selectedContract.proposalEnterpriseName || 'Empresa contratante'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Proposta vinculada</p>
                  <p className="text-sm font-bold text-climbe-secondary italic">#{selectedContract.proposalId}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Inicio</p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.startDate ? format(new Date(selectedContract.startDate), "dd/MM/yyyy", { locale: ptBR }) : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Termino</p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.endDate ? format(new Date(selectedContract.endDate), "dd/MM/yyyy", { locale: ptBR }) : 'Prazo indeterminado'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 text-xs text-gray-500 leading-relaxed">
                Esta visualizacao gera uma minuta local com os dados do contrato cadastrado. A assinatura confirma o aceite
                no sistema e altera o status para <strong>DIGITALLY_SIGNED</strong>, liberando a proposta para a proxima etapa do fluxo.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => openContractDocument(selectedContract)}
                className="font-black uppercase tracking-widest text-[10px]"
              >
                <Eye size={16} className="mr-2" />
                Visualizar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => openContractDocument(selectedContract, true)}
                className="font-black uppercase tracking-widest text-[10px]"
              >
                <Download size={16} className="mr-2" />
                Baixar PDF
              </Button>
              <Button
                type="button"
                disabled={signMutation.isPending || isContractSigned(selectedContract)}
                onClick={() => signMutation.mutate(selectedContract.id)}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl shadow-lg shadow-climbe-primary/20"
              >
                <PenLine size={16} className="mr-2" />
                {isContractSigned(selectedContract)
                  ? 'ASSINADO'
                  : signMutation.isPending
                    ? 'ASSINANDO...'
                    : 'ASSINAR'}
              </Button>
            </div>

            {signMutation.isError && (
              <p className="text-xs font-bold text-red-500">
                Nao foi possivel assinar o contrato. Verifique a API e tente novamente.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
