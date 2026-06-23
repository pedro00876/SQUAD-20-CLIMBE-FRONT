import { FileText, Plus, Loader2, CheckCircle2, XCircle, Clock, ScrollText, Upload, Trash2, ClipboardCheck, MoreHorizontal, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '@/services/proposal.service';
import { enterpriseService } from '@/services/enterprise.service';
import { contractService, type CreateContractRequest } from '@/services/contract.service';
import {
  documentRequirementService,
  documentService,
  type DocumentRequirement,
  type DocumentRequirementStatus,
  type DocumentType,
} from '@/services/document.service';
import { ChecklistModal } from './components/ChecklistModal';
import { ProposalCreateWizard } from '@/features/propostas/components/ProposalCreateWizard';
import { ProposalTriagemDrawer } from '@/features/propostas/components/ProposalTriagemDrawer';
import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilterChips, type FilterChip } from '@/components/ui/FilterChips';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import {
  submitCommercialProposal,
  parseApiWorkflowError,
  getProposalStatusLabel,
  canAssignAnalyst,
  canCreateContract,
  canCreateChecklist,
  validateEnterpriseForEligible,
} from '@/features/workflow';

const documentRequirementTypes: { value: DocumentType; label: string }[] = [
  { value: 'BALANCO_PATRIMONIAL', label: 'Balanço patrimonial' },
  { value: 'DRE', label: 'DRE' },
  { value: 'CONTRATO_SOCIAL', label: 'Contrato social' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'PLANILHA_GERENCIAL', label: 'Planilha gerencial' },
];

type StatusFilter = 'TODOS' | 'EM_TRIAGEM' | 'APROVADAS' | 'REPROVADAS' | 'CONTRATO';

const STATUS_FILTER_SETS: Record<StatusFilter, string[]> = {
  TODOS:      [],
  EM_TRIAGEM: ['RECEIVED', 'IN_TRIAGE', 'PENDING_ADJUSTMENTS'],
  APROVADAS:  ['ELIGIBLE', 'COMMERCIAL_PROPOSAL', 'COMMERCIAL_PROPOSAL_APPROVED', 'READY_FOR_NEXT_STAGE'],
  REPROVADAS: ['COMMERCIAL_PROPOSAL_REJECTED'],
  CONTRATO:   ['COMMERCIAL_PROPOSAL_APPROVED', 'READY_FOR_NEXT_STAGE'],
};

// Simple inline dropdown for secondary row actions
function ActionMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-climbe-secondary transition-colors"
        title="Mais ações"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5"
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function ActionMenuItem({ onClick, icon: Icon, label, danger }: { onClick: () => void; icon: React.ComponentType<any>; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors ${
        danger ? 'text-red-500 hover:bg-red-50' : 'text-climbe-secondary hover:bg-gray-50'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

export function PropostasPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isTriagemDrawerOpen, setIsTriagemDrawerOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCommercialProposalModalOpen, setIsCommercialProposalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDocumentChecklistModalOpen, setIsDocumentChecklistModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
  const [proposalActionError, setProposalActionErrorState] = useState('');
  const [proposalActionHint, setProposalActionHint] = useState('');
  const setProposalActionError = (msg: string, hint = '') => {
    setProposalActionErrorState(msg);
    setProposalActionHint(hint);
  };
  const [commercialProposalFile, setCommercialProposalFile] = useState<File | null>(null);
  const [documentChecklistDeadline, setDocumentChecklistDeadline] = useState('');
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<DocumentType[]>(
    documentRequirementTypes.map((type) => type.value),
  );
  const [requirementRejectionReasons, setRequirementRejectionReasons] = useState<Record<number, string>>({});
  
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
      setIsWizardOpen(false);
      setSelectedEnterpriseId('');
    },
  });

  const { data: triageEnterprise } = useQuery({
    queryKey: ['enterprise', selectedProposal?.enterpriseId],
    queryFn: () => enterpriseService.getById(Number(selectedProposal.enterpriseId)),
    enabled: isTriagemDrawerOpen && !!selectedProposal?.enterpriseId,
  });

  const triageValidationIssues = validateEnterpriseForEligible(triageEnterprise);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => proposalService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setProposalActionError('');
    },
    onError: (error: unknown) => {
      const parsed = parseApiWorkflowError(error);
      setProposalActionError(parsed.message, parsed.hint);
      console.error('[statusMutation]', parsed);
    },
  });

  const commercialProposalMutation = useMutation({
    mutationFn: () => {
      if (!selectedProposal || !commercialProposalFile) {
        throw new Error('Selecione o arquivo da proposta comercial.');
      }

      return submitCommercialProposal(
        Number(selectedProposal.id),
        Number(selectedProposal.enterpriseId),
        commercialProposalFile,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsCommercialProposalModalOpen(false);
      setSelectedProposal(null);
      setCommercialProposalFile(null);
      setProposalActionError('');
    },
    onError: (error: unknown) => {
      const parsed = parseApiWorkflowError(error);
      setProposalActionError(parsed.message, parsed.hint);
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

  const deleteMutation = useMutation({
    mutationFn: proposalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsDeleteModalOpen(false);
      setSelectedProposal(null);
      setProposalActionError('');
    },
    onError: (error: any) => {
      setProposalActionError(error?.response?.data?.message || 'Nao foi possivel excluir a proposta.');
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

  const {
    data: documentRequirements = [],
    isLoading: isLoadingDocumentRequirements,
  } = useQuery({
    queryKey: ['document-requirements', selectedProposal?.id],
    queryFn: () => documentRequirementService.listByProposal(Number(selectedProposal.id)),
    enabled: isDocumentChecklistModalOpen && !!selectedProposal?.id,
  });

  const createDocumentRequirementsMutation = useMutation({
    mutationFn: () => {
      if (!selectedProposal?.id) {
        throw new Error('Selecione uma proposta para solicitar documentos.');
      }

      return documentRequirementService.createForProposal(Number(selectedProposal.id), {
        documentTypes: selectedDocumentTypes,
        deadline: documentChecklistDeadline || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-requirements', selectedProposal?.id] });
      setProposalActionError('');
    },
    onError: (error: any) => {
      setProposalActionError(error?.response?.data?.message || error?.message || 'Nao foi possivel solicitar os documentos.');
    },
  });

  const updateDocumentRequirementMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status?: DocumentRequirementStatus; deadline?: string; rejectionReason?: string; validatedById?: number } }) =>
      documentRequirementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-requirements', selectedProposal?.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setProposalActionError('');
    },
    onError: (error: any) => {
      setProposalActionError(error?.response?.data?.message || 'Nao foi possivel atualizar o checklist documental.');
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

  const handleWizardSubmit = ({ enterpriseId }: { enterpriseId: number; analystId?: number; meetingDate?: string }) => {
    if (!user?.id) return;
    createMutation.mutate({ enterpriseId, userId: Number(user.id) });
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
            `Olá, ${analyst.fullName || 'analista'}. Você foi selecionado como analista responsável pelo contrato da empresa ${selectedProposal.enterpriseName}. Acesse o sistema para mais detalhes.`
          );
        }
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
        setIsAnalystModalOpen(false);
      })
      .catch((error: any) => {
        const data = error?.response?.data;
        const msg = data?.message || data?.detail || (typeof data === 'string' ? data : null) || 'Não foi possível atribuir o analista.';
        setProposalActionError(msg);
      });
  };

  // ... (rest of the component logic)
  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;
    if (!canCreateContract(selectedProposal.status)) {
      setProposalActionError('Contrato só pode ser criado com proposta em COMMERCIAL_PROPOSAL_APPROVED.');
      return;
    }
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

  const openCommercialProposalModal = (proposal: any) => {
    setSelectedProposal(proposal);
    setCommercialProposalFile(null);
    setProposalActionError('');
    setIsCommercialProposalModalOpen(true);
  };

  const handleStatusChange = (proposal: any, status: string) => {
    setSelectedProposal(proposal);
    setProposalActionError('');
    statusMutation.mutate({ id: proposal.id, status });
  };

  const handleCommercialProposalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setProposalActionError('');
    commercialProposalMutation.mutate();
  };

  const openDocumentChecklistModal = (proposal: any) => {
    if (!canCreateChecklist(proposal.status)) {
      setProposalActionError(
        'Checklist documental disponível apenas após assinatura do contrato (READY_FOR_NEXT_STAGE).',
        'Assine o contrato em Contratos para liberar esta etapa.',
      );
      return;
    }
    setSelectedProposal(proposal);
    setDocumentChecklistDeadline('');
    setSelectedDocumentTypes(documentRequirementTypes.map((type) => type.value));
    setRequirementRejectionReasons({});
    setProposalActionError('');
    setIsDocumentChecklistModalOpen(true);
  };

  const toggleDocumentType = (type: DocumentType) => {
    setSelectedDocumentTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const updateRequirementStatus = (requirement: DocumentRequirement, status: DocumentRequirementStatus) => {
    const rejectionReason = requirementRejectionReasons[requirement.id]?.trim();

    if (status === 'NON_COMPLIANT' && !rejectionReason) {
      setProposalActionError('Informe o motivo da nao conformidade antes de reprovar o documento.');
      return;
    }

    updateDocumentRequirementMutation.mutate({
      id: requirement.id,
      data: {
        status,
        rejectionReason: status === 'NON_COMPLIANT' ? rejectionReason : undefined,
        validatedById: (status === 'APPROVED' || status === 'NON_COMPLIANT') && user?.id ? Number(user.id) : undefined,
      },
    });
  };

  const openRequirementDocument = async (documentId?: number) => {
    if (!documentId) return;
    const url = await documentService.getViewUrl(documentId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteProposal = () => {
    if (!selectedProposal?.id) return;
    setProposalActionError('');
    deleteMutation.mutate(selectedProposal.id);
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

  const getStatusLabel = (status: string) => getProposalStatusLabel(status);

  const getStatusIcon = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMMERCIAL_PROPOSAL_APPROVED' || s === 'APROVADA') return <CheckCircle2 size={12} />;
    if (s === 'COMMERCIAL_PROPOSAL_REJECTED' || s === 'RECUSADA') return <XCircle size={12} />;
    return <Clock size={12} />;
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentRequirementTypes.find((item) => item.value === type)?.label || type || '--';
  };

  const getRequirementStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Solicitado',
      SUBMITTED: 'Enviado',
      NON_COMPLIANT: 'Nao conforme',
      APPROVED: 'Aprovado',
    };

    return labels[status || ''] || status || '--';
  };

  const getRequirementStatusStyle = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-climbe-primary/10 text-climbe-primary border-climbe-primary/20';
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'NON_COMPLIANT':
        return 'bg-red-50 text-red-500 border-red-100';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const allProposals: any[] = proposalsPage?.content || [];

  const filterChips: FilterChip<StatusFilter>[] = [
    { value: 'TODOS',      label: 'Todos',          count: allProposals.length },
    { value: 'EM_TRIAGEM', label: 'Em Triagem',      count: allProposals.filter(p => STATUS_FILTER_SETS.EM_TRIAGEM.includes(p.status?.toUpperCase())).length },
    { value: 'APROVADAS',  label: 'Aprovadas',       count: allProposals.filter(p => STATUS_FILTER_SETS.APROVADAS.includes(p.status?.toUpperCase())).length },
    { value: 'REPROVADAS', label: 'Reprovadas',      count: allProposals.filter(p => STATUS_FILTER_SETS.REPROVADAS.includes(p.status?.toUpperCase())).length },
    { value: 'CONTRATO',   label: 'Contrato Gerado', count: allProposals.filter(p => STATUS_FILTER_SETS.CONTRATO.includes(p.status?.toUpperCase())).length },
  ];

  const filteredProposals = statusFilter === 'TODOS'
    ? allProposals
    : allProposals.filter(p => STATUS_FILTER_SETS[statusFilter].includes(p.status?.toUpperCase()));

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
          onClick={() => setIsWizardOpen(true)}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          CRIAR NOVA PROPOSTA
        </Button>
      </div>

      {proposalActionError && !isCommercialProposalModalOpen && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500 space-y-1">
          <p>{proposalActionError}</p>
          {proposalActionHint && (
            <p className="font-medium text-red-400/90">{proposalActionHint}</p>
          )}
        </div>
      )}

      <FilterChips chips={filterChips} active={statusFilter} onChange={setStatusFilter} />

      {isLoadingProposals ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[40px] border border-gray-100 bg-white p-20 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50 text-gray-200">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-bold italic text-climbe-secondary">
            {statusFilter === 'TODOS' ? 'Nenhuma proposta ativa' : 'Nenhuma proposta neste filtro'}
          </h3>
          <p className="max-w-xs text-sm text-gray-400">
            {statusFilter === 'TODOS'
              ? 'Clique em "Criar Nova Proposta" para iniciar o fluxo.'
              : 'Selecione outro filtro ou crie uma nova proposta.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Empresa / Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Analista</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProposals.map((proposal: any) => {
                  const status = proposal.status?.toUpperCase();
                  return (
                    <tr key={proposal.id} className="group transition-colors hover:bg-gray-50/30">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-climbe-secondary text-xs font-black italic text-white shrink-0">
                            {proposal.enterpriseName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold italic text-climbe-secondary">{proposal.enterpriseName}</p>
                            <p className="text-[10px] text-gray-400">#{proposal.id} · por {proposal.userName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-400 font-medium">
                        {proposal.responsibleAnalystName || <span className="text-amber-500">Pendente</span>}
                      </td>
                      <td className="px-8 py-6 text-xs font-medium text-gray-400">
                        {proposal.createdAt ? format(new Date(proposal.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '--'}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusStyle(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          {getStatusLabel(proposal.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* Primary action — one per status */}
                          {status === 'RECEIVED' && (
                            <button
                              disabled={statusMutation.isPending}
                              onClick={() => handleStatusChange(proposal, 'IN_TRIAGE')}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 disabled:opacity-50"
                            >
                              <Clock size={13} />
                              Iniciar triagem
                            </button>
                          )}
                          {(status === 'IN_TRIAGE' || status === 'PENDING_ADJUSTMENTS') && (
                            <button
                              onClick={() => { setSelectedProposal(proposal); setIsTriagemDrawerOpen(true); }}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-secondary transition-all hover:scale-105"
                            >
                              <CheckCircle2 size={13} />
                              {status === 'IN_TRIAGE' ? 'Triar proposta' : 'Retomar triagem'}
                            </button>
                          )}
                          {(status === 'ELIGIBLE' || status === 'COMMERCIAL_PROPOSAL_REJECTED') && (
                            <button
                              onClick={() => openCommercialProposalModal(proposal)}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-secondary transition-all hover:scale-105"
                            >
                              <Upload size={13} />
                              Enviar proposta
                            </button>
                          )}
                          {status === 'COMMERCIAL_PROPOSAL' && (
                            <div className="flex items-center gap-1">
                              <button
                                disabled={statusMutation.isPending}
                                onClick={() => handleStatusChange(proposal, 'COMMERCIAL_PROPOSAL_APPROVED')}
                                className="p-2 text-climbe-primary hover:bg-climbe-primary/10 rounded-lg transition-all disabled:opacity-50"
                                title="Aprovar proposta"
                              >
                                <CheckCircle2 size={17} />
                              </button>
                              <button
                                disabled={statusMutation.isPending}
                                onClick={() => { setSelectedProposal(proposal); setIsRejectModalOpen(true); }}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                title="Reprovar proposta"
                              >
                                <XCircle size={17} />
                              </button>
                            </div>
                          )}
                          {canAssignAnalyst(status) && !proposal.responsibleAnalystId && (
                            <button
                              onClick={() => { setSelectedProposal(proposal); setIsAnalystModalOpen(true); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-climbe-primary text-climbe-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                            >
                              <User size={13} />
                              Selecionar Analista
                            </button>
                          )}
                          {canCreateContract(status) && proposal.responsibleAnalystId && (
                            <button
                              onClick={() => openContractModal(proposal)}
                              className="flex items-center gap-1.5 rounded-xl bg-climbe-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
                            >
                              <ScrollText size={13} />
                              Gerar Contrato
                            </button>
                          )}

                          {/* Secondary actions in ⋯ dropdown */}
                          <ActionMenu>
                            {canCreateChecklist(status) && (
                              <ActionMenuItem
                                icon={FileText}
                                label="Checklist"
                                onClick={() => { setChecklistProposalId(proposal.id); setIsChecklistModalOpen(true); }}
                              />
                            )}
                            {canCreateChecklist(status) && (
                              <ActionMenuItem
                                icon={ClipboardCheck}
                                label="Documentos"
                                onClick={() => openDocumentChecklistModal(proposal)}
                              />
                            )}
                            <ActionMenuItem
                              icon={FileText}
                              label="Ver detalhes"
                              onClick={() => { setSelectedProposal(proposal); setIsDetailsModalOpen(true); }}
                            />
                            <ActionMenuItem
                              icon={Trash2}
                              label="Excluir"
                              danger
                              onClick={() => { setSelectedProposal(proposal); setProposalActionError(''); setIsDeleteModalOpen(true); }}
                            />
                          </ActionMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProposalCreateWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        enterprises={enterprisesPage?.content || []}
        users={(usersPage?.content || []).map((u: any) => ({ id: u.id, fullName: u.fullName, role: u.role, email: u.email }))}
        currentUserId={user?.id ? Number(user.id) : undefined}
        currentUserName={(user as any)?.fullName || (user as any)?.name}
        isSubmitting={createMutation.isPending}
        onSubmit={handleWizardSubmit}
      />

      <ProposalTriagemDrawer
        isOpen={isTriagemDrawerOpen}
        onClose={() => { setIsTriagemDrawerOpen(false); setSelectedProposal(null); }}
        proposal={selectedProposal}
        isLoading={statusMutation.isPending}
        enterpriseValidationIssues={triageValidationIssues}
        onApprove={() => {
          if (!selectedProposal) return;
          statusMutation.mutate({ id: selectedProposal.id, status: 'ELIGIBLE' }, {
            onSuccess: () => setIsTriagemDrawerOpen(false),
          });
        }}
        onRequestAdjustments={() => {
          if (!selectedProposal) return;
          const isInTriage = selectedProposal.status?.toUpperCase() === 'IN_TRIAGE';
          statusMutation.mutate(
            { id: selectedProposal.id, status: isInTriage ? 'PENDING_ADJUSTMENTS' : 'IN_TRIAGE' },
            { onSuccess: () => setIsTriagemDrawerOpen(false) },
          );
        }}
      />

      <Modal
        isOpen={isCommercialProposalModalOpen}
        onClose={() => setIsCommercialProposalModalOpen(false)}
        className="form-modal-shell max-w-lg"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">Enviar Proposta Comercial</h2>
            <p className="text-xs text-muted-foreground dark:text-slate-300">Anexe o arquivo comercial para registrar esta etapa da proposta.</p>
          </div>

          <form onSubmit={handleCommercialProposalSubmit} className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm dark:bg-gray-50">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empresa</span>
              <strong className="text-foreground dark:text-climbe-secondary">{selectedProposal?.enterpriseName || '--'}</strong>
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">Arquivo da Proposta</Label>
              <Input
                required
                type="file"
                onChange={(event) => setCommercialProposalFile(event.target.files?.[0] || null)}
                className="form-field-control file:mr-4 file:rounded-lg file:border-0 file:bg-climbe-primary file:px-3 file:py-1 file:text-xs file:font-black file:text-climbe-secondary"
              />
            </div>

            {proposalActionError && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
                {proposalActionError}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCommercialProposalModalOpen(false)}
                className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={commercialProposalMutation.isPending || !commercialProposalFile}
                className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                <Upload size={16} className="mr-2" />
                {commercialProposalMutation.isPending ? 'ENVIANDO...' : 'ENVIAR'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isDocumentChecklistModalOpen}
        onClose={() => setIsDocumentChecklistModalOpen(false)}
        className="form-modal-shell max-h-[90vh] max-w-3xl overflow-y-auto"
      >
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Checklist documental</p>
            <h2 className="text-2xl font-black italic tracking-tight">
              Proposta #{selectedProposal?.id}
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-300">
              Solicite formalmente os documentos da empresa, acompanhe o envio e registre a validacao do analista.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-4 dark:bg-white/5">
            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-300">Empresa</span>
            <strong className="text-sm italic text-foreground dark:text-white">{selectedProposal?.enterpriseName || '--'}</strong>
          </div>

          {proposalActionError && (
            <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">
              {proposalActionError}
            </p>
          )}

          {isLoadingDocumentRequirements ? (
            <div className="flex items-center justify-center rounded-3xl bg-white/5 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-climbe-primary" />
            </div>
          ) : documentRequirements.length === 0 ? (
            <div className="space-y-5 rounded-3xl border border-border bg-muted/40 p-5 dark:border-white/10 dark:bg-white/5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-white">Solicitar documentos</h3>
                <p className="text-xs text-muted-foreground dark:text-slate-300">
                  Ao criar a solicitacao, o backend registra o checklist e dispara a notificacao formal para a empresa.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="form-field-label">Prazo para envio</Label>
                <Input
                  type="date"
                  value={documentChecklistDeadline}
                  onChange={(event) => setDocumentChecklistDeadline(event.target.value)}
                  className="form-field-control"
                />
              </div>

              <div className="space-y-3">
                <Label className="form-field-label">Documentos exigidos</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {documentRequirementTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocumentTypes.includes(type.value)}
                        onChange={() => toggleDocumentType(type.value)}
                        className="h-4 w-4 accent-climbe-primary"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDocumentChecklistModalOpen(false)}
                  className="font-black uppercase tracking-widest text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={createDocumentRequirementsMutation.isPending || selectedDocumentTypes.length === 0}
                  onClick={() => createDocumentRequirementsMutation.mutate()}
                  className="rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 disabled:bg-white/10 disabled:text-slate-400"
                >
                  <ClipboardCheck size={16} className="mr-2" />
                  {createDocumentRequirementsMutation.isPending ? 'SOLICITANDO...' : 'SOLICITAR DOCUMENTOS'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col justify-between gap-2 rounded-2xl bg-white/5 p-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Checklist solicitado</h3>
                  <p className="text-xs text-slate-300">
                    {documentRequirements.filter((item) => item.status === 'APPROVED').length} de {documentRequirements.length} documentos aprovados.
                  </p>
                </div>
                <span className="rounded-full bg-climbe-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-climbe-primary">
                  {documentRequirements.every((item) => item.status === 'APPROVED') ? 'Completo' : 'Em andamento'}
                </span>
              </div>

              {documentRequirements.map((requirement) => (
                <div key={requirement.id} className="rounded-3xl bg-white p-5 text-slate-900 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-black italic text-climbe-secondary">
                        {getDocumentTypeLabel(requirement.documentType)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Prazo: {requirement.deadline ? format(new Date(requirement.deadline), 'dd/MM/yyyy', { locale: ptBR }) : 'sem prazo'}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getRequirementStatusStyle(requirement.status)}`}>
                      {getRequirementStatusLabel(requirement.status)}
                    </span>
                  </div>

                  {requirement.rejectionReason && (
                    <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
                      Motivo da nao conformidade: {requirement.rejectionReason}
                    </p>
                  )}

                  {requirement.status === 'SUBMITTED' && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={requirementRejectionReasons[requirement.id] || ''}
                        onChange={(event) =>
                          setRequirementRejectionReasons((current) => ({
                            ...current,
                            [requirement.id]: event.target.value,
                          }))
                        }
                        className="min-h-20 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/20"
                        placeholder="Motivo da nao conformidade, caso seja necessario reprovar..."
                      />
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!requirement.documentId}
                      onClick={() => openRequirementDocument(requirement.documentId)}
                      className="rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                    >
                      Ver documento
                    </Button>
                    <Button
                      type="button"
                      disabled={requirement.status !== 'SUBMITTED' || updateDocumentRequirementMutation.isPending}
                      onClick={() => updateRequirementStatus(requirement, 'NON_COMPLIANT')}
                      className="rounded-xl bg-red-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Nao conforme
                    </Button>
                    <Button
                      type="button"
                      disabled={requirement.status !== 'SUBMITTED' || updateDocumentRequirementMutation.isPending}
                      onClick={() => updateRequirementStatus(requirement, 'APPROVED')}
                      className="rounded-xl bg-climbe-primary text-[10px] font-black uppercase tracking-widest text-climbe-secondary disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        className="form-modal-shell max-w-lg"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">Detalhes da Proposta</h2>
            <p className="text-xs text-muted-foreground dark:text-slate-300">Resumo dos dados cadastrados para acompanhamento comercial.</p>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empresa</span>
              <strong className="text-foreground">{selectedProposal?.enterpriseName || '--'}</strong>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Criado por</span>
                <strong className="text-foreground">{selectedProposal?.userName || '--'}</strong>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analista</span>
                <strong className="text-foreground">{selectedProposal?.responsibleAnalystName || 'Pendente'}</strong>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                <strong className="text-foreground">{getStatusLabel(selectedProposal?.status)}</strong>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data</span>
                <strong className="text-foreground">
                  {selectedProposal?.createdAt ? format(new Date(selectedProposal.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '--'}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              className="rounded-xl bg-climbe-primary font-black italic text-climbe-secondary"
            >
              FECHAR
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-red-500">Excluir Proposta</h2>
            <p className="text-xs text-gray-400">
              Esta acao remove a proposta e os registros vinculados no fluxo, como contratos, relatorios e planilhas.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Proposta</span>
            <strong className="text-climbe-secondary">
              #{selectedProposal?.id} - {selectedProposal?.enterpriseName || '--'}
            </strong>
          </div>

          {proposalActionError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {proposalActionError}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeleteProposal}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl bg-red-500 font-black italic text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? 'EXCLUINDO...' : 'EXCLUIR'}
            </Button>
          </div>
        </div>
      </Modal>

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
                  <option key={u.id} value={u.id}>{u.fullName} ({u.role || 'Analista'})</option>
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
