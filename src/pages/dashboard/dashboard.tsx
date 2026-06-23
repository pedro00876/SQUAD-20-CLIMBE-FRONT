import {
  LayoutDashboard, FileText, Briefcase, Users, CalendarDays,
  ArrowRight, Clock, AlertTriangle, Building2, CheckCircle2,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineFunnelChart } from '@/components/dashboard/PipelineFunnelChart';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { proposalService } from '@/services/proposal.service';
import { enterpriseService } from '@/services/enterprise.service';
import { meetingService } from '@/features/reunioes/services';
import { userService } from '@/features/usuarios/services';
import { useAuthContext } from '@/contexts/AuthContext';
import { hasAnyLogicalRole } from '@/config/roles';
import { routes } from '@/config/routes';
import { deriveStage } from '@/features/pipeline/utils/deriveStage';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ProcessStage } from '@/components/ui/ProcessStepper';

const PROPOSAL_ACTION_STATUSES = ['RECEIVED', 'IN_TRIAGE', 'PENDING_ADJUSTMENTS', 'COMMERCIAL_PROPOSAL'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const userRole = user?.role ?? '';
  const isAdmin = hasAnyLogicalRole(userRole, ['ADMIN', 'CPO']);
  const isAnalista = hasAnyLogicalRole(userRole, ['ANALISTA']);

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  // Proposals for next-actions
  const { data: proposalsPage } = useQuery({
    queryKey: ['proposals-dashboard'],
    queryFn: () => proposalService.list(0, 100),
  });

  // All enterprises for funnel
  const { data: enterprisesPage } = useQuery({
    queryKey: ['enterprises-dashboard'],
    queryFn: () => enterpriseService.list(0, 200),
  });

  // Proposals for enterprise-funnel mapping
  const { data: allProposalsPage } = useQuery({
    queryKey: ['proposals-funnel'],
    queryFn: () => proposalService.list(0, 500),
  });

  // Meetings for today widget
  const { data: meetingsPage } = useQuery({
    queryKey: ['meetings-dashboard'],
    queryFn: () => meetingService.listMeetings(0, 50),
  });

  // Pending users (admin only)
  const { data: pendingUsersPage } = useQuery({
    queryKey: ['pending-users-dashboard'],
    queryFn: () => userService.listPending(0, 5),
    enabled: isAdmin,
  });

  // Analyst-specific: proposals assigned to this user
  const { data: myProposals = [] } = useQuery({
    queryKey: ['my-proposals-dashboard', user?.id],
    queryFn: () => user?.id ? proposalService.listByUser(Number(user.id)) : Promise.resolve([]),
    enabled: isAnalista && !!user?.id,
  });

  const allProposals: any[] = proposalsPage?.content ?? [];
  const allEnterprises: any[] = enterprisesPage?.content ?? [];
  const allProposalsFunnel: any[] = allProposalsPage?.content ?? [];
  const todayMeetings = (meetingsPage?.content ?? []).filter((m: any) => {
    try { return isToday(new Date(m.date)); } catch { return false; }
  });
  const pendingUsers = pendingUsersPage?.content ?? [];

  // Build pipeline funnel data from proposals
  const funnelData: { stage: ProcessStage | 'CONCLUIDO'; count: number }[] = (() => {
    const counts = new Map<ProcessStage | 'CONCLUIDO', number>();
    // For each enterprise, derive stage from its latest proposal
    const proposalByEnterprise = new Map<number, any>();
    for (const p of allProposalsFunnel) {
      const existing = proposalByEnterprise.get(p.enterpriseId);
      if (!existing || p.id > existing.id) proposalByEnterprise.set(p.enterpriseId, p);
    }
    for (const enterprise of allEnterprises) {
      const proposal = proposalByEnterprise.get(enterprise.id) ?? null;
      const { stage } = deriveStage(proposal, null, [], [], []);
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([stage, count]) => ({ stage, count }));
  })();

  // Next actions
  const actionableProposals = allProposals.filter(p =>
    PROPOSAL_ACTION_STATUSES.includes(p.status?.toUpperCase()),
  );
  const pendingApproval = allProposals.filter(p =>
    p.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL',
  );

  const isLoading = loadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-climbe-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3 text-climbe-primary">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visão Geral</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Dashboard</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          {isAdmin
            ? 'Visão gerencial do pipeline. Clique nos cards para navegar diretamente.'
            : 'Suas tarefas e empresas atribuídas em destaque.'}
        </p>
      </motion.div>

      {/* Próximas Ações — cockpit card */}
      {(actionableProposals.length > 0 || pendingUsers.length > 0 || todayMeetings.length > 0) && (
        <div className="bg-white border border-gray-100 dark:border-none shadow-sm dark:bg-climbe-secondary text-slate-800 dark:text-white rounded-[32px] p-8">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={16} className="text-climbe-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Próximas Ações</span>
          </div>
          <div className="space-y-3">
            {actionableProposals.slice(0, 3).map((p: any) => (
              <button
                key={p.id}
                onClick={() => navigate(routes.propostas)}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-100/50 hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 dark:border-transparent rounded-2xl px-5 py-3.5 transition-all group text-left text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-3">
                  <FileText size={15} className="text-climbe-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.enterpriseName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/60 uppercase tracking-widest font-medium">
                      {p.status === 'COMMERCIAL_PROPOSAL' ? 'Aguardando aprovação da proposta' :
                       p.status === 'IN_TRIAGE' ? 'Triagem em andamento' :
                       p.status === 'RECEIVED' ? 'Proposta recebida' : 'Ajustes pendentes'}
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-climbe-primary" />
              </button>
            ))}
            {actionableProposals.length > 3 && (
              <button
                onClick={() => navigate(routes.propostas)}
                className="text-xs text-climbe-primary font-bold hover:underline ml-2"
              >
                + {actionableProposals.length - 3} propostas aguardando ação
              </button>
            )}
            {pendingApproval.length > 0 && (
              <button
                onClick={() => navigate(routes.propostas)}
                className="w-full flex items-center justify-between bg-climbe-primary/10 dark:bg-climbe-primary/20 hover:bg-climbe-primary/20 dark:hover:bg-climbe-primary/30 rounded-2xl px-5 py-3.5 transition-all group text-left text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-climbe-primary shrink-0" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingApproval.length} {pendingApproval.length === 1 ? 'proposta' : 'propostas'} aguardando aprovação
                  </p>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-climbe-primary" />
              </button>
            )}
            {isAdmin && pendingUsers.length > 0 && (
              <button
                onClick={() => navigate(routes.usuarios)}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-100/50 hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 dark:border-transparent rounded-2xl px-5 py-3.5 transition-all group text-left text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-3">
                  <Users size={15} className="text-climbe-primary shrink-0" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingUsers.length} {pendingUsers.length === 1 ? 'usuário aguarda aprovação' : 'usuários aguardam aprovação'}
                  </p>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-climbe-primary" />
              </button>
            )}
            {todayMeetings.length > 0 && (
              <button
                onClick={() => navigate(routes.agenda)}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-100/50 hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 dark:border-transparent rounded-2xl px-5 py-3.5 transition-all group text-left text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={15} className="text-climbe-primary shrink-0" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {todayMeetings.length} {todayMeetings.length === 1 ? 'reunião hoje' : 'reuniões hoje'}
                  </p>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-climbe-primary" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards — clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Propostas"
          value={String(stats?.totalProposals ?? 0)}
          icon={FileText}
          trend="neutral"
          onClick={() => navigate(routes.propostas)}
        />
        <StatCard
          title="Contratos"
          value={String(stats?.totalContracts ?? 0)}
          icon={Briefcase}
          trend="neutral"
          onClick={() => navigate(routes.contratos)}
        />
        <StatCard
          title="Empresas"
          value={String(stats?.totalEnterprises ?? 0)}
          icon={Building2}
          trend="neutral"
          onClick={() => navigate(routes.empresas)}
        />
      </div>

      {/* Bottom row: Funnel + Today's meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Pipeline funnel */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-climbe-secondary italic leading-tight">Funil do Pipeline</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
              Empresas por etapa do fluxo
            </p>
          </div>
          <PipelineFunnelChart data={funnelData} />
        </div>

        {/* Today's meetings + Analista view */}
        <div className="space-y-6">
          {/* Reuniões de hoje */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-climbe-secondary italic text-sm">Reuniões de Hoje</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <button
                onClick={() => navigate(routes.agenda)}
                className="text-[10px] font-black uppercase tracking-widest text-climbe-primary hover:underline"
              >
                Ver agenda
              </button>
            </div>
            {todayMeetings.length === 0 ? (
              <div className="text-center py-6">
                <CalendarDays size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Nenhuma reunião hoje</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeetings.slice(0, 4).map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(routes.agenda)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-climbe-primary/10 flex items-center justify-center shrink-0">
                      <Clock size={13} className="text-climbe-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-climbe-secondary truncate">{m.title}</p>
                      <p className="text-[10px] text-gray-400">{m.time} · {m.enterpriseName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analista: Minhas empresas */}
          {isAnalista && myProposals.length > 0 && (
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-climbe-secondary italic text-sm mb-4">Minhas Empresas</h3>
              <div className="space-y-2">
                {myProposals.slice(0, 4).map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`${routes.empresas}/${p.enterpriseId}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-climbe-primary/15 dark:bg-climbe-primary/25 text-climbe-secondary dark:text-climbe-primary border border-climbe-primary/10 flex items-center justify-center font-black italic text-xs shrink-0">
                      {p.enterpriseName?.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-climbe-secondary truncate flex-1">{p.enterpriseName}</p>
                    <ArrowRight size={12} className="text-gray-300 group-hover:text-climbe-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
