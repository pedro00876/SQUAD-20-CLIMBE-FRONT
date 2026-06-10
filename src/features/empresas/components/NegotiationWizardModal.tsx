import { useQuery } from '@tanstack/react-query';
import { proposalService } from '@/services/proposal.service';
import { contractService } from '@/services/contract.service';
import { documentRequirementService } from '@/services/document.service';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { 
  Building2, 
  Clock, 
  FileText, 
  ScrollText, 
  ClipboardCheck, 
  Play, 
  Check, 
  Lock, 
  AlertCircle, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Address {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Enterprise {
  id: number;
  legalName: string;
  tradeName?: string;
  cnpj: string;
  email: string;
  phone?: string;
  representativeName?: string;
  address?: Address;
}

interface NegotiationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise: Enterprise | null;
}

type StepKey = 'triage' | 'proposal' | 'contract' | 'documents' | 'operation';

interface Step {
  key: StepKey;
  label: string;
  description: string;
  icon: any;
}

const steps: Step[] = [
  { key: 'triage', label: 'Triagem', description: 'Reunião e qualificação', icon: Clock },
  { key: 'proposal', label: 'Proposta', description: 'Proposta comercial', icon: FileText },
  { key: 'contract', label: 'Contrato', description: 'Analista e contrato', icon: ScrollText },
  { key: 'documents', label: 'Documentação', description: 'Validação de documentos', icon: ClipboardCheck },
  { key: 'operation', label: 'Operação', description: 'Ferramentas e relatórios', icon: Play },
];

export function NegotiationWizardModal({ isOpen, onClose, enterprise }: NegotiationWizardModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StepKey>('triage');

  // Queries
  const { data: proposalsPage, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.list(0, 100),
    enabled: !!enterprise,
  });

  const { data: contractsPage, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.list(0, 100),
    enabled: !!enterprise,
  });

  const proposals = proposalsPage?.content || [];
  const enterpriseProposals = enterprise ? proposals.filter((p: any) => p.enterpriseId === enterprise.id) : [];
  // Sort by id descending (newest first)
  const latestProposal = [...enterpriseProposals].sort((a: any, b: any) => b.id - a.id)[0];

  const { data: docRequirements = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['document-requirements', latestProposal?.id],
    queryFn: () => documentRequirementService.listByProposal(latestProposal.id),
    enabled: !!latestProposal?.id,
  });

  const contracts = contractsPage?.content || [];
  const associatedContract = latestProposal ? contracts.find((c: any) => c.proposalId === latestProposal.id) : null;

  if (!enterprise) return null;

  const isLoading = isLoadingProposals || isLoadingContracts || (!!latestProposal?.id && isLoadingDocs);

  // Status mapping logic
  const getStepStatus = (stepKey: StepKey): 'completed' | 'active' | 'locked' | 'failed' => {
    if (!latestProposal) return stepKey === 'triage' ? 'active' : 'locked';

    const status = latestProposal.status?.toUpperCase() || '';

    switch (stepKey) {
      case 'triage':
        if (status === 'RECEIVED' || status === 'IN_TRIAGE' || status === 'PENDING_ADJUSTMENTS') {
          return 'active';
        }
        return 'completed';

      case 'proposal':
        if (status === 'RECEIVED' || status === 'IN_TRIAGE' || status === 'PENDING_ADJUSTMENTS') {
          return 'locked';
        }
        if (status === 'ELIGIBLE' || status === 'COMMERCIAL_PROPOSAL') {
          return 'active';
        }
        if (status === 'COMMERCIAL_PROPOSAL_REJECTED') {
          return 'failed';
        }
        return 'completed';

      case 'contract':
        if (
          status === 'RECEIVED' ||
          status === 'IN_TRIAGE' ||
          status === 'PENDING_ADJUSTMENTS' ||
          status === 'ELIGIBLE' ||
          status === 'COMMERCIAL_PROPOSAL' ||
          status === 'COMMERCIAL_PROPOSAL_REJECTED'
        ) {
          return 'locked';
        }
        // If proposal is approved/next stage, but no contract or analyst yet
        if (!associatedContract || !latestProposal.responsibleAnalystId) {
          return 'active';
        }
        return 'completed';

      case 'documents':
        // Locked if contract step not completed
        if (
          status === 'RECEIVED' ||
          status === 'IN_TRIAGE' ||
          status === 'PENDING_ADJUSTMENTS' ||
          status === 'ELIGIBLE' ||
          status === 'COMMERCIAL_PROPOSAL' ||
          status === 'COMMERCIAL_PROPOSAL_REJECTED' ||
          !associatedContract ||
          !latestProposal.responsibleAnalystId
        ) {
          return 'locked';
        }
        // Active if docs are not fully approved
        const hasDocs = docRequirements.length > 0;
        const allApproved = hasDocs && docRequirements.every((d: any) => d.status === 'APPROVED');
        return allApproved ? 'completed' : 'active';

      case 'operation':
        if (
          status === 'RECEIVED' ||
          status === 'IN_TRIAGE' ||
          status === 'PENDING_ADJUSTMENTS' ||
          status === 'ELIGIBLE' ||
          status === 'COMMERCIAL_PROPOSAL' ||
          status === 'COMMERCIAL_PROPOSAL_REJECTED' ||
          !associatedContract ||
          !latestProposal.responsibleAnalystId
        ) {
          return 'locked';
        }
        const hasRequirements = docRequirements.length > 0;
        const requirementsAllApproved = hasRequirements && docRequirements.every((d: any) => d.status === 'APPROVED');
        return requirementsAllApproved ? 'active' : 'locked';

      default:
        return 'locked';
    }
  };

  // Determine current active step to show in the detailed card by default
  const getCurrentStepKey = (): StepKey => {
    if (!latestProposal) return 'triage';
    for (const step of [...steps].reverse()) {
      const s = getStepStatus(step.key);
      if (s === 'active' || s === 'failed') {
        return step.key;
      }
    }
    return 'triage';
  };

  useEffect(() => {
    if (latestProposal) {
      setActiveTab(getCurrentStepKey());
    }
  }, [latestProposal]);

  // Helper labels
  const getProposalStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      RECEIVED: 'Recebida',
      IN_TRIAGE: 'Em triagem',
      ELIGIBLE: 'Triagem aprovada (Elegível)',
      PENDING_ADJUSTMENTS: 'Ajustes pendentes',
      COMMERCIAL_PROPOSAL: 'Proposta comercial enviada',
      COMMERCIAL_PROPOSAL_APPROVED: 'Proposta comercial aprovada',
      COMMERCIAL_PROPOSAL_REJECTED: 'Proposta comercial recusada',
      READY_FOR_NEXT_STAGE: 'Pronto para próxima etapa',
    };
    return labels[status?.toUpperCase()] || status || 'N/A';
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BALANCO_PATRIMONIAL: 'Balanço patrimonial',
      DRE: 'DRE',
      CONTRATO_SOCIAL: 'Contrato social',
      CNPJ: 'CNPJ',
      PLANILHA_GERENCIAL: 'Planilha gerencial',
    };
    return labels[type] || type;
  };

  const getDocStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Solicitado (Aguardando envio)',
      SUBMITTED: 'Enviado (Pendente de análise)',
      NON_COMPLIANT: 'Não conforme (Recusado)',
      APPROVED: 'Aprovado',
    };
    return labels[status] || status;
  };

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-success bg-success/10 border-success/20';
      case 'SUBMITTED':
        return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'NON_COMPLIANT':
        return 'text-danger bg-danger/10 border-danger/20';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const handleCreateFirstProposal = () => {
    onClose();
    navigate(routes.propostas, { state: { createForEnterpriseId: enterprise.id } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="bg-[#F8FAFC]">
      <div className="space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-climbe-secondary text-lg font-black italic text-white shadow-md">
            {enterprise.tradeName?.charAt(0) || enterprise.legalName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-climbe-primary">
              <Building2 size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Negociação & Fluxo</span>
            </div>
            <h2 className="text-xl font-black italic tracking-tight text-climbe-secondary leading-tight mt-0.5">
              {enterprise.tradeName || enterprise.legalName}
            </h2>
            <p className="text-[10px] text-gray-400 font-light mt-0.5">
              CNPJ: {enterprise.cnpj} • Email: {enterprise.email}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <span className="animate-spin h-8 w-8 text-climbe-primary border-4 border-current border-t-transparent rounded-full" />
          </div>
        ) : !latestProposal ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-[28px] bg-white space-y-4">
            <div className="p-4 bg-climbe-primary/5 rounded-full text-climbe-primary">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="font-bold text-climbe-secondary text-sm">Sem Negociação Ativa</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1 font-light">
                Esta empresa foi cadastrada no sistema, mas ainda não possui nenhuma proposta comercial vinculada para iniciar o fluxo.
              </p>
            </div>
            <Button onClick={handleCreateFirstProposal} className="italic text-xs font-black">
              INICIAR FLUXO COMERCIAL
            </Button>
          </div>
        ) : (
          /* Stepper visual pipeline */
          <div className="space-y-6">
            {/* Horizontal timeline */}
            <div className="relative flex justify-between items-center w-full px-2">
              {/* Connecting line backgrounds */}
              <div className="absolute left-10 right-10 top-[22px] h-[3px] bg-gray-200 -z-10" />
              
              {steps.map((step) => {
                const status = getStepStatus(step.key);
                const StepIcon = step.icon;
                const isTabActive = activeTab === step.key;

                return (
                  <button
                    key={step.key}
                    onClick={() => setActiveTab(step.key)}
                    className="flex flex-col items-center focus:outline-none group relative z-10 flex-1"
                  >
                    {/* Circle */}
                    <div
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${status === 'completed' 
                          ? 'bg-climbe-primary border-climbe-primary text-climbe-secondary shadow-md shadow-climbe-primary/10' 
                          : status === 'active'
                          ? 'bg-white border-climbe-primary text-climbe-primary ring-4 ring-climbe-primary/10'
                          : status === 'failed'
                          ? 'bg-danger border-danger text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                        }
                        ${isTabActive ? 'scale-110 shadow-lg' : 'hover:scale-105'}
                      `}
                    >
                      {status === 'completed' ? (
                        <Check size={16} strokeWidth={3} />
                      ) : status === 'locked' ? (
                        <Lock size={14} />
                      ) : (
                        <StepIcon size={16} />
                      )}
                    </div>

                    {/* Step label */}
                    <span
                      className={`
                        text-[9px] font-black uppercase tracking-wider mt-2.5 transition-all text-center
                        ${isTabActive 
                          ? 'text-climbe-secondary font-black scale-105' 
                          : 'text-gray-400 group-hover:text-slate-600'
                        }
                      `}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step detail panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm min-h-[180px] flex flex-col justify-between"
              >
                {/* Active tab content */}
                <div>
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                        Etapa {steps.findIndex(s => s.key === activeTab) + 1}
                      </span>
                      <h3 className="text-sm font-black italic text-climbe-secondary">
                        {steps.find(s => s.key === activeTab)?.label}
                      </h3>
                    </div>
                    
                    <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2.5 py-0.5
                      ${getStepStatus(activeTab) === 'completed'
                        ? 'text-success bg-success/5 border-success/15'
                        : getStepStatus(activeTab) === 'active'
                        ? 'text-climbe-primary bg-climbe-primary/5 border-climbe-primary/15'
                        : getStepStatus(activeTab) === 'failed'
                        ? 'text-danger bg-danger/5 border-danger/15'
                        : 'text-gray-400 bg-gray-50 border-gray-200/60'
                      }
                    `}>
                      {getStepStatus(activeTab) === 'completed' && 'Concluído'}
                      {getStepStatus(activeTab) === 'active' && 'Em Andamento'}
                      {getStepStatus(activeTab) === 'failed' && 'Recusado/Erro'}
                      {getStepStatus(activeTab) === 'locked' && 'Aguardando'}
                    </span>
                  </div>

                  {/* Subcontent depending on step */}
                  {activeTab === 'triage' && (
                    <div className="space-y-2 text-xs font-light">
                      <p className="text-gray-500">
                        O processo inicia com a qualificação da empresa. São recolhidos dados básicos de contato e realizada uma reunião inicial para entender a demanda.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100/60">
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Status da Proposta</span>
                          <span className="font-bold text-climbe-secondary">{getProposalStatusLabel(latestProposal.status)}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Data de Cadastro</span>
                          <span className="font-medium text-gray-600">
                            {latestProposal.createdAt ? new Date(latestProposal.createdAt).toLocaleDateString('pt-BR') : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'proposal' && (
                    <div className="space-y-2 text-xs font-light">
                      <p className="text-gray-500">
                        Elaboração e validação da proposta comercial detalhada descrevendo os serviços que serão prestados.
                      </p>
                      {latestProposal.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_REJECTED' && (
                        <div className="flex items-start gap-2.5 bg-danger/5 text-danger border border-danger/15 rounded-2xl p-4 mt-2">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black uppercase tracking-wider text-[9px] block">Proposta Recusada pelo Cliente</span>
                            <span className="font-light block mt-0.5 text-xs text-danger/80">
                              O cliente solicitou revisão ou recusou a proposta comercial apresentada. Acesse o menu comercial para enviar uma nova proposta ou negociar.
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100/60">
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Fase da Proposta</span>
                          <span className="font-bold text-climbe-secondary">{getProposalStatusLabel(latestProposal.status)}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Elaborador</span>
                          <span className="font-medium text-gray-600">{latestProposal.userName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contract' && (
                    <div className="space-y-2 text-xs font-light">
                      <p className="text-gray-500">
                        Após aprovação comercial, o compliance elabora o contrato. Também é designado o Analista Sênior que ficará responsável pelo acompanhamento direto da conta.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100/60">
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Analista Responsável</span>
                          <span className="font-bold text-climbe-secondary">{latestProposal.responsibleAnalystName || 'Pendente'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Status do Contrato</span>
                          <span className="font-bold text-climbe-secondary">
                            {associatedContract 
                              ? `R$ ${associatedContract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - Ativo` 
                              : 'Contrato não gerado'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-3 text-xs font-light">
                      <p className="text-gray-500">
                        A empresa contratada deve enviar toda a documentação legal e financeira exigida pelo analista responsável para homologação.
                      </p>
                      
                      {getStepStatus('documents') === 'locked' ? (
                        <div className="text-center py-4 text-gray-400">
                          Aguardando a conclusão do contrato para iniciar a coleta de documentos.
                        </div>
                      ) : docRequirements.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status do Checklist</span>
                          <div className="grid gap-2 max-h-[150px] overflow-y-auto pr-1">
                            {docRequirements.map((req: any) => (
                              <div key={req.id} className="flex justify-between items-center p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px]">
                                <span className="font-bold text-climbe-secondary">{getDocTypeLabel(req.documentType)}</span>
                                <span className={`border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getDocStatusColor(req.status)}`}>
                                  {getDocStatusLabel(req.status)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mt-2">
                          <AlertCircle size={15} />
                          <span>Checklist documental ainda não foi gerado pelo analista.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'operation' && (
                    <div className="space-y-2 text-xs font-light">
                      <p className="text-gray-500">
                        Homologação completa. Com todos os documentos validados, as ferramentas da planilha de acompanhamento e pastas são liberadas, dando início oficial à operação e entrega dos relatórios mensais.
                      </p>
                      <div className="flex items-start gap-2 bg-success/5 border border-success/10 rounded-2xl p-4 mt-4 text-success">
                        <Check size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-black uppercase tracking-wider text-[9px] block">Operação Iniciada</strong>
                          <span className="block text-[11px] text-success-foreground mt-0.5">
                            Todas as ferramentas do contratante estão liberadas. Próximo passo: Geração do primeiro Relatório Mensal pelo Analista.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons / Quick Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-4">
                  <Button variant="ghost" onClick={onClose} className="text-xs font-black italic">
                    FECHAR
                  </Button>
                  
                  {/* Shortcut action to simplify navigation for users */}
                  {latestProposal.status && (
                    <Button 
                      onClick={() => {
                        onClose();
                        navigate(routes.propostas);
                      }}
                      className="text-xs font-black italic flex items-center gap-1 bg-climbe-primary text-climbe-secondary shadow-sm"
                    >
                      ACESSAR FLUXO COMERCIAL
                      <ChevronRight size={14} />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </Modal>
  );
}
