import { Building2, Plus, Mail, User, MapPin, Loader2, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enterpriseService, type CreateEnterpriseRequest, type Enterprise } from '@/services/enterprise.service';
import { useState } from 'react';
import { EmpresaModal } from '@/features/empresas/components';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

  const openEditModal = (enterprise: Enterprise) => {
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gerenciamento</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-climbe-secondary">Empresas</h1>
          <p className="max-w-2xl font-light text-gray-400">
            Visualize e gerencie todas as empresas parceiras e clientes cadastrados no sistema.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          CADASTRAR EMPRESA
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(enterprisesPage?.content || []).map((enterprise: Enterprise) => (
            <div
              key={enterprise.id}
              onClick={() => navigate(`/empresas/${enterprise.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-climbe-primary/5 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative z-10 mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-climbe-secondary text-xl font-black italic text-white shadow-lg">
                  {enterprise.tradeName?.charAt(0) || enterprise.legalName.charAt(0)}
                </div>
                <div>
                  <h4 className="max-w-[180px] truncate text-lg font-bold italic leading-tight text-climbe-secondary">
                    {enterprise.tradeName || enterprise.legalName}
                  </h4>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-climbe-primary">
                    CNPJ: {enterprise.cnpj}
                  </p>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={14} className="text-climbe-primary" />
                  <span className="truncate text-xs font-medium">{enterprise.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <User size={14} className="text-climbe-primary" />
                  <span className="text-xs font-medium">{enterprise.representativeName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin size={14} className="text-climbe-primary" />
                  <span className="text-xs font-medium">
                    {enterprise.address?.city || 'Local nao informado'} - {enterprise.address?.state || '--'}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between border-t border-gray-50 pt-6">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Contratos</span>
                  <span className="font-bold text-climbe-secondary">0 Ativos</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(enterprise);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-climbe-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-climbe-primary transition-all hover:bg-climbe-primary hover:text-climbe-secondary"
                >
                  <Pencil size={12} />
                  Editar
                </button>
              </div>
            </div>
          ))}
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
