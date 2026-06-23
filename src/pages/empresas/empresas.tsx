import { Building2, Plus, Mail, User, MapPin, Loader2, ArrowRight, AlertTriangle, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enterpriseService, type CreateEnterpriseRequest, type Enterprise } from '@/services/enterprise.service';
import { proposalService } from '@/services/proposal.service';
import { useState, useMemo } from 'react';
import { EmpresaModal } from '@/features/empresas/components';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StageBadge } from '@/components/ui/StageBadge';
import { getEnterpriseListStage } from '@/features/pipeline/utils/getEnterpriseListStage';

const initialEnterpriseForm: CreateEnterpriseRequest = {
  legalName: '',
  tradeName: '',
  cnpj: '',
  email: '',
  phone: '',
  representativeName: '',
  representativeCpf: '',
  representativePhone: '',
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
};

function getEnterpriseStageInfo(proposal: { status?: string } | null) {
  const { stage, rejected } = getEnterpriseListStage(proposal);
  const isAlert = rejected || proposal?.status?.toUpperCase() === 'COMMERCIAL_PROPOSAL_REJECTED';
  return { stage, rejected, isAlert };
}

export function EmpresasPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEnterpriseRequest>(initialEnterpriseForm);

  const { data: enterprisesPage, isLoading } = useQuery({
    queryKey: ['enterprises'],
    queryFn: () => enterpriseService.list(0, 100),
  });

  // Fetch all proposals to derive stage per empresa without N+1
  const { data: proposalsPage } = useQuery({
    queryKey: ['proposals-all-for-list'],
    queryFn: () => proposalService.list(0, 500),
  });

  // Map enterpriseId → latest proposal (by id desc)
  const proposalByEnterprise = useMemo(() => {
    const proposals: { enterpriseId: number; status?: string }[] =
      proposalsPage?.content ?? [];
    const map = new Map<number, { status?: string }>();
    for (const p of proposals) {
      const existing = map.get(p.enterpriseId);
      if (!existing || (p as any).id > (existing as any).id) {
        map.set(p.enterpriseId, p);
      }
    }
    return map;
  }, [proposalsPage]);

  const createMutation = useMutation({
    mutationFn: enterpriseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
      setIsModalOpen(false);
      setFormData(initialEnterpriseForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateEnterpriseRequest }) => enterpriseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
      setIsModalOpen(false);
      setEditingEnterprise(null);
      setFormData(initialEnterpriseForm);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEnterprise) {
      updateMutation.mutate({ id: editingEnterprise.id, data: formData });
      return;
    }
    createMutation.mutate(formData);
  };

  const openCreateModal = () => {
    setEditingEnterprise(null);
    setFormData(initialEnterpriseForm);
    setIsModalOpen(true);
  };

  const openEditModal = (enterprise: Enterprise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEnterprise(enterprise);
    setFormData({
      legalName: enterprise.legalName || '',
      tradeName: enterprise.tradeName || '',
      cnpj: enterprise.cnpj || '',
      email: enterprise.email || '',
      phone: enterprise.phone || '',
      representativeName: enterprise.representativeName || '',
      representativeCpf: enterprise.representativeCpf || '',
      representativePhone: enterprise.representativePhone || '',
      address: {
        street: enterprise.address?.street || '',
        number: enterprise.address?.number || '',
        neighborhood: enterprise.address?.neighborhood || '',
        city: enterprise.address?.city || '',
        state: enterprise.address?.state || '',
        zipCode: enterprise.address?.zipCode || '',
      },
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEnterprise(null);
    setFormData(initialEnterpriseForm);
  };

  const enterprises: Enterprise[] = enterprisesPage?.content || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gerenciamento</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Empresas</h1>
          <p className="max-w-2xl font-light text-muted-foreground">
            Acompanhe o progresso de cada empresa no fluxo de onboarding.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          CADASTRAR EMPRESA
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : enterprises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 size={48} className="mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-bold text-muted-foreground">Nenhuma empresa cadastrada</h3>
          <p className="mt-1 text-sm text-muted-foreground/60">Cadastre a primeira empresa para iniciar o fluxo.</p>
          <Button
            onClick={openCreateModal}
            className="mt-6 rounded-2xl bg-climbe-primary px-6 py-3 font-black text-climbe-secondary"
          >
            <Plus size={16} className="mr-2" />
            Cadastrar empresa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enterprises.map((enterprise) => {
            const proposal = proposalByEnterprise.get(enterprise.id) ?? null;
            const { stage, rejected, isAlert } = getEnterpriseStageInfo(proposal);

            return (
              <div
                key={enterprise.id}
                onClick={() => navigate(`/empresas/${enterprise.id}`)}
                className={`group relative cursor-pointer overflow-hidden rounded-[32px] border bg-card p-8 shadow-sm transition-all hover:shadow-xl ${
                  isAlert
                    ? 'border-red-200 dark:border-red-900/40 ring-1 ring-red-100 dark:ring-red-900/20'
                    : 'border-border hover:border-climbe-primary/20'
                }`}
              >
                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-climbe-primary/5 transition-transform duration-500 group-hover:scale-150" />

                {/* Alert indicator */}
                {isAlert && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-200">
                    <AlertTriangle size={10} />
                    Atenção
                  </div>
                )}

                <div className="relative z-10 mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-climbe-primary/15 dark:bg-climbe-primary/25 text-xl font-black text-climbe-secondary dark:text-climbe-primary shadow-lg border border-climbe-primary/10">
                    {enterprise.tradeName?.charAt(0) || enterprise.legalName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="max-w-[180px] truncate text-lg font-bold leading-tight text-foreground">
                      {enterprise.tradeName || enterprise.legalName}
                    </h4>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-climbe-primary">
                      CNPJ: {enterprise.cnpj}
                    </p>
                  </div>
                </div>

                {/* Stage badge */}
                <div className="relative z-10 mb-5">
                  <StageBadge stage={stage} rejected={rejected} size="sm" />
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail size={14} className="text-climbe-primary shrink-0" />
                    <span className="truncate text-xs font-medium">{enterprise.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User size={14} className="text-climbe-primary shrink-0" />
                    <span className="text-xs font-medium">{enterprise.representativeName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={14} className="text-climbe-primary shrink-0" />
                    <span className="text-xs font-medium">
                      {enterprise.address?.city || 'Local não informado'} - {enterprise.address?.state || '--'}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(enterprise, e)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-climbe-primary transition-colors"
                    title="Editar dados da empresa"
                  >
                    <Pencil size={11} />
                    Editar dados
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/empresas/${enterprise.id}`); }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-climbe-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-primary transition-all hover:bg-climbe-primary hover:text-climbe-secondary"
                  >
                    Ver Fluxo
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EmpresaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={editingEnterprise ? 'edit' : 'create'}
      />
    </div>
  );
}
