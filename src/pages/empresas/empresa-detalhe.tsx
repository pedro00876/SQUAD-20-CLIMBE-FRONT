import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProcessStepper, type ProcessStage } from '@/components/ui/ProcessStepper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthContext } from '@/contexts/AuthContext';
import { canPerformStageAction } from '@/config/roles';
import { ArrowLeft, Building2, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enterpriseService } from '@/services/enterprise.service';
import { proposalService } from '@/services/proposal.service';
import { contractService } from '@/services/contract.service';
import { documentRequirementService } from '@/services/document.service';
import { reportService } from '@/services/report.service';
import { spreadsheetService } from '@/features/spreadsheets/services';

import { StageCadastro } from '@/features/pipeline/components/StageCadastro';
import { StageReuniao } from '@/features/pipeline/components/StageReuniao';
import { StageProposta } from '@/features/pipeline/components/StageProposta';
import { StageContrato } from '@/features/pipeline/components/StageContrato';
import { StageDocumentacao } from '@/features/pipeline/components/StageDocumentacao';
import { StageFerramentas } from '@/features/pipeline/components/StageFerramentas';
import { StageRelatorio } from '@/features/pipeline/components/StageRelatorio';
import { StageAgendamento } from '@/features/pipeline/components/StageAgendamento';
import { deriveStage } from '@/features/pipeline/utils/deriveStage';

// ─── Next-step panel data ─────────────────────────────────────────────────────

const NEXT_STEP: Record<ProcessStage | 'CONCLUIDO', { who: string; action: string }> = {
  CADASTRO:        { who: 'CMO / CEO',             action: 'Confirme os dados cadastrais e avance para o registro de reunião.' },
  REUNIAO:         { who: 'CMO / CEO',             action: 'Registre a reunião inicial com o contratante e inicie a triagem.' },
  PROPOSTA:        { who: 'CMO / CSO / CEO / Contador', action: 'Envie a proposta comercial e aguarde a aprovação dos revisores.' },
  CONTRATO:        { who: 'Compliance',            action: 'Gere o contrato e elencione o analista responsável.' },
  DOCUMENTACAO:    { who: 'Compliance / Analista', action: 'Solicite a documentação obrigatória e aguarde o envio da empresa.' },
  VALIDACAO:       { who: 'Analista Sênior',       action: 'Valide cada documento enviado pela empresa.' },
  FERRAMENTAS:     { who: 'Analista Chefe',        action: 'Registre a Primeira Data, libere o ambiente Google Drive/Sheets e distribua tarefas.' },
  RELATORIO:       { who: 'Analista / Sênior',     action: 'Elabore o relatório técnico, exporte em PDF e envie para aprovação.' },
  APROVACAO_FINAL: { who: 'CPO / P5',              action: 'Agende a reunião de apresentação e registre a decisão final.' },
  CONCLUIDO:       { who: '—',                     action: 'Processo concluído com sucesso.' },
};

// ─── Role label helper ────────────────────────────────────────────────────────

function formatRole(role: string): string {
  const map: Record<string, string> = {
    CEO: 'CEO', CMO: 'CMO', CSO: 'CSO',
    COMPLIANCE: 'Compliance', CONTADOR: 'Contador',
    ANALISTA_CHEFE: 'Analista Chefe', ANALISTA_SENIOR: 'Analista Sênior',
    ANALISTA: 'Analista', ADMIN: 'Admin',
  };
  return map[role?.toUpperCase()] ?? role;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-[40px] border border-gray-100 animate-pulse ${className}`}>
      <div className="p-8 space-y-4">
        <div className="h-4 bg-gray-100 rounded-full w-1/4" />
        <div className="h-8 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3 mt-2" />
      </div>
    </div>
  );
}

// ─── Proposal status chip ──────────────────────────────────────────────────────

function proposalStatusBadgeStatus(proposalStatus: string): string {
  const map: Record<string, string> = {
    RECEIVED: 'PENDING',
    IN_TRIAGE: 'IN_PROGRESS',
    ELIGIBLE: 'IN_PROGRESS',
    PENDING_ADJUSTMENTS: 'PENDING',
    COMMERCIAL_PROPOSAL: 'SUBMITTED',
    COMMERCIAL_PROPOSAL_APPROVED: 'APPROVED',
    COMMERCIAL_PROPOSAL_REJECTED: 'REJECTED',
    READY_FOR_NEXT_STAGE: 'IN_PROGRESS',
  };
  return map[proposalStatus?.toUpperCase()] ?? 'PENDING';
}

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recebida',
  IN_TRIAGE: 'Em Triagem',
  ELIGIBLE: 'Elegível',
  PENDING_ADJUSTMENTS: 'Ajustes Pendentes',
  COMMERCIAL_PROPOSAL: 'Proposta Comercial',
  COMMERCIAL_PROPOSAL_APPROVED: 'Proposta Aprovada',
  COMMERCIAL_PROPOSAL_REJECTED: 'Proposta Reprovada',
  READY_FOR_NEXT_STAGE: 'Avançando',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function EmpresaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const enterpriseId = Number(id);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: empresa, isLoading: loadingEmpresa } = useQuery({
    queryKey: ['enterprise', enterpriseId],
    queryFn: () => enterpriseService.getById(enterpriseId),
    enabled: !!enterpriseId,
  });

  const { data: proposalsForEnterprise = [], isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals-enterprise', enterpriseId],
    queryFn: () => proposalService.listByEnterprise(enterpriseId),
    enabled: !!enterpriseId,
  });

  const latestProposal: any | null = proposalsForEnterprise.length > 0
    ? [...proposalsForEnterprise].sort((a: any, b: any) => b.id - a.id)[0]
    : null;

  const proposalId = latestProposal?.id ?? null;

  const { data: contractsForProposal = [], isLoading: loadingContracts } = useQuery({
    queryKey: ['contracts-proposal', proposalId],
    queryFn: () => contractService.listByProposal(proposalId!),
    enabled: !!proposalId,
  });

  const latestContract: any | null = contractsForProposal.length > 0
    ? [...contractsForProposal].sort((a: any, b: any) => b.id - a.id)[0]
    : null;

  const contractId = latestContract?.id ?? null;

  const { data: docRequirements = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['doc-requirements', proposalId],
    queryFn: () => documentRequirementService.listByProposal(proposalId!),
    enabled: !!proposalId,
  });

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['reports-contract', contractId],
    queryFn: () => reportService.getByContract(contractId!),
    enabled: !!contractId,
  });

  const { data: spreadsheets = [], isLoading: loadingSheets } = useQuery({
    queryKey: ['spreadsheets-contract', contractId],
    queryFn: () => spreadsheetService.getByContract(contractId!),
    enabled: !!contractId,
  });

  const isLoading =
    loadingEmpresa ||
    loadingProposals ||
    (!!proposalId && loadingContracts) ||
    (!!proposalId && loadingDocs) ||
    (!!contractId && loadingReports) ||
    (!!contractId && loadingSheets);

  // ── Stage derivation ───────────────────────────────────────────────────────

  const { stage: derivedStage, rejected } = deriveStage(
    latestProposal,
    latestContract,
    docRequirements as any[],
    reports as any[],
    spreadsheets as any[],
  );

  const [cadastroConfirmado, setCadastroConfirmado] = useState(false);
  const currentStage: ProcessStage =
    derivedStage === 'CADASTRO' && cadastroConfirmado ? 'REUNIAO' : derivedStage;

  // Allows clicking completed stages to view them (read-only)
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const viewStage: ProcessStage = selectedStage ?? currentStage;

  // ── Invalidation helpers ───────────────────────────────────────────────────

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['proposals-enterprise', enterpriseId] });
    queryClient.invalidateQueries({ queryKey: ['contracts-proposal', proposalId] });
    queryClient.invalidateQueries({ queryKey: ['doc-requirements', proposalId] });
    queryClient.invalidateQueries({ queryKey: ['reports-contract', contractId] });
    queryClient.invalidateQueries({ queryKey: ['spreadsheets-contract', contractId] });
  };

  // ── Role guards ────────────────────────────────────────────────────────────

  const userRole = user?.role ?? '';

  // ── Render — loading skeleton ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-40 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-8 w-64 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard className="h-[300px]" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-black italic text-climbe-secondary">Empresa não encontrada</h2>
        <button onClick={() => navigate('/empresas')} className="text-climbe-primary hover:underline font-bold">
          Voltar para listagem
        </button>
      </div>
    );
  }

  const stageTitles: Record<ProcessStage | 'CONCLUIDO', string> = {
    CADASTRO:        'Dados da Empresa',
    REUNIAO:         'Registro de Reunião',
    PROPOSTA:        'Proposta Comercial',
    CONTRATO:        'Gestão do Contrato',
    DOCUMENTACAO:    'Solicitação de Documentação',
    VALIDACAO:       'Validação de Documentos',
    FERRAMENTAS:     'Primeira Data / Liberação de Ferramentas',
    RELATORIO:       'Criação do Relatório',
    APROVACAO_FINAL: 'Aprovação Final',
    CONCLUIDO:       'Processo Concluído',
  };

  const nextStep = NEXT_STEP[viewStage];
  const proposalStatusKey = (latestProposal?.status || '').toUpperCase();

  return (
    <div className="pb-12 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => navigate('/empresas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft size={24} className="text-climbe-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Detalhes da Homologação</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-climbe-secondary">
              {empresa.tradeName || empresa.legalName}
            </h1>
            {proposalStatusKey && (
              <StatusBadge
                status={proposalStatusBadgeStatus(proposalStatusKey)}
                size="md"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <p className="text-sm font-medium text-gray-400">CNPJ: {empresa.cnpj}</p>
            {proposalStatusKey && PROPOSAL_STATUS_LABELS[proposalStatusKey] && (
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                · {PROPOSAL_STATUS_LABELS[proposalStatusKey]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stepper — sticky so it stays visible while scrolling stage content */}
      <div className="sticky top-0 z-10 bg-white rounded-[32px] border border-gray-100 shadow-md p-6 pb-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black italic text-climbe-secondary uppercase tracking-wider">Progresso do Fluxo</h3>
          {selectedStage && selectedStage !== currentStage && (
            <button
              onClick={() => setSelectedStage(null)}
              className="text-[10px] font-bold text-climbe-primary hover:underline"
            >
              Voltar para etapa atual
            </button>
          )}
        </div>
        <ProcessStepper
          currentStage={currentStage}
          rejected={rejected}
          selectedStage={viewStage}
          onStageClick={(stage) => {
            setSelectedStage(stage === currentStage ? null : stage);
          }}
        />
      </div>

      {/* Stage content + Next Step panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main stage card */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-black italic text-climbe-secondary">
                {stageTitles[viewStage]}
              </h2>
              {selectedStage && selectedStage !== currentStage && (
                <p className="text-xs text-gray-400 mt-1">Visualizando etapa anterior — modo leitura</p>
              )}
            </div>
            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-climbe-primary/10 text-climbe-secondary text-[10px] font-black uppercase tracking-widest">
              {formatRole(userRole)}
            </span>
          </div>

          <div className="min-h-[300px]">
            {viewStage === 'CADASTRO' && (
              <StageCadastro
                empresa={empresa}
                canAvancar={!selectedStage && canPerformStageAction(userRole, 'REUNIAO_CRIAR')}
                onAvancar={() => setCadastroConfirmado(true)}
              />
            )}

            {viewStage === 'REUNIAO' && (
              <StageReuniao
                empresa={empresa}
                proposal={latestProposal}
                userId={user?.id ? Number(user.id) : undefined}
                canEdit={!selectedStage && canPerformStageAction(userRole, 'REUNIAO_CRIAR')}
                onConcluir={refetchAll}
              />
            )}

            {viewStage === 'PROPOSTA' && (
              <StageProposta
                empresa={empresa}
                proposal={latestProposal}
                userRole={userRole}
                canUpload={!selectedStage && canPerformStageAction(userRole, 'PROPOSTA_UPLOAD')}
                canApprove={!selectedStage && canPerformStageAction(userRole, 'PROPOSTA_APROVAR')}
                onConcluir={refetchAll}
              />
            )}

            {viewStage === 'CONTRATO' && (
              <StageContrato
                empresa={empresa}
                proposal={latestProposal}
                canCreate={!selectedStage && canPerformStageAction(userRole, 'CONTRATO_CRIAR')}
                canAssignAnalyst={!selectedStage && canPerformStageAction(userRole, 'CONTRATO_ANALISTA')}
                onConcluir={refetchAll}
              />
            )}

            {(viewStage === 'DOCUMENTACAO' || viewStage === 'VALIDACAO') && (
              <StageDocumentacao
                empresa={empresa}
                proposal={latestProposal}
                docRequirements={docRequirements as any[]}
                userRole={userRole}
                currentStage={viewStage}
                canSolicitar={!selectedStage && canPerformStageAction(userRole, 'DOCUMENTACAO_SOLICITAR')}
                canValidar={!selectedStage && canPerformStageAction(userRole, 'DOCUMENTACAO_VALIDAR')}
                onConcluir={refetchAll}
              />
            )}

            {viewStage === 'FERRAMENTAS' && (
              <StageFerramentas
                empresa={empresa}
                contract={latestContract}
                userRole={userRole}
                canEdit={!selectedStage && canPerformStageAction(userRole, 'FERRAMENTAS_LIBERAR')}
                onConcluir={refetchAll}
              />
            )}

            {viewStage === 'RELATORIO' && (
              <StageRelatorio
                empresa={empresa}
                contract={latestContract}
                userRole={userRole}
                canCreate={!selectedStage && canPerformStageAction(userRole, 'RELATORIO_CRIAR')}
                canApprove={!selectedStage && canPerformStageAction(userRole, 'RELATORIO_APROVAR')}
                onConcluir={refetchAll}
              />
            )}

            {viewStage === 'APROVACAO_FINAL' && (
              <StageAgendamento
                empresa={empresa}
                proposal={latestProposal}
                userRole={userRole}
                canEdit={!selectedStage && canPerformStageAction(userRole, 'APROVACAO_FINAL')}
                onConcluir={refetchAll}
              />
            )}

            {currentStage === 'CONCLUIDO' && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                {/* Confetti-style decoration */}
                <div className="relative">
                  <div className="w-24 h-24 bg-climbe-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(206,255,26,0.5)]">
                    <Sparkles className="w-12 h-12 text-climbe-secondary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-bounce" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-3xl font-black italic text-climbe-secondary">Homologação Concluída!</h3>
                  <p className="text-gray-400 mt-2 max-w-md mx-auto font-light">
                    A empresa <strong className="text-climbe-secondary">{empresa.tradeName || empresa.legalName}</strong> está
                    100% homologada e ativa na nossa base.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-100">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">Processo encerrado com sucesso</span>
                </div>
                <Button
                  onClick={() => navigate('/empresas')}
                  variant="outline"
                  className="rounded-xl font-bold mt-4"
                >
                  <ArrowLeft size={16} className="mr-2" /> Voltar para listagem
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Next Step panel */}
        {currentStage !== 'CONCLUIDO' && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 space-y-4 sticky top-6">
            <div className="flex items-center gap-2 text-climbe-primary">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {selectedStage && selectedStage !== currentStage ? 'Sobre esta Etapa' : 'Próximo Passo'}
              </span>
            </div>
            <p className="text-sm font-medium text-climbe-secondary leading-relaxed">
              {nextStep.action}
            </p>
            <div className="pt-3 border-t border-gray-50">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Responsável</span>
              <p className="text-sm font-bold text-climbe-secondary mt-0.5">{nextStep.who}</p>
            </div>
            {rejected && (
              <div className="bg-red-50 rounded-2xl p-3 text-xs text-red-600 font-medium border border-red-100">
                Esta etapa está marcada como reprovada. Consulte o analista responsável.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
