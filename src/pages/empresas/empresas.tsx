import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmpresaModal } from '@/features/empresas/components';
import {
  useCreateEmpresa,
  useDeleteEmpresa,
  useEmpresas,
  useUpdateEmpresa,
} from '@/features/empresas/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCNPJ } from '@/utils/formatCNPJ';
import { maskCNPJ, maskCPF, maskPhone, unmask } from '@/utils/masks';
import type { Empresa, EmpresaFormValues } from '@/types/empresa.types';

const initialForm: EmpresaFormValues = {
  legalName: '',
  tradeName: '',
  cnpj: '',
  email: '',
  phone: '',
  representativeName: '',
  representativeCpf: '',
  representativePhone: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

const EMPRESAS_STORAGE_KEY = 'climbe-demo-empresas';

function createLocalId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function normalizeEmpresa(base: Empresa, incoming?: Partial<Empresa> | null): Empresa {
  return {
    id: incoming?.id ?? base.id ?? createLocalId(),
    legalName: incoming?.legalName ?? base.legalName,
    tradeName: incoming?.tradeName ?? base.tradeName,
    cnpj: incoming?.cnpj ?? base.cnpj,
    email: incoming?.email ?? base.email,
    phone: incoming?.phone ?? base.phone,
    representativeName: incoming?.representativeName ?? base.representativeName,
    representativeCpf: incoming?.representativeCpf ?? base.representativeCpf,
    representativePhone: incoming?.representativePhone ?? base.representativePhone,
    address: {
      street: incoming?.address?.street ?? base.address?.street,
      number: incoming?.address?.number ?? base.address?.number,
      neighborhood: incoming?.address?.neighborhood ?? base.address?.neighborhood,
      city: incoming?.address?.city ?? base.address?.city,
      state: incoming?.address?.state ?? base.address?.state,
      zipCode: incoming?.address?.zipCode ?? base.address?.zipCode,
    },
  };
}

export function EmpresasPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [form, setForm] = useState<EmpresaFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [recentEmpresas, setRecentEmpresas] = useState<Empresa[]>(() => {
    const stored = window.localStorage.getItem(EMPRESAS_STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored) as Empresa[];
    } catch {
      return [];
    }
  });

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = useEmpresas({ page: 0, size: 24, search: debouncedSearch });
  const createEmpresa = useCreateEmpresa();
  const updateEmpresa = useUpdateEmpresa();
  const deleteEmpresa = useDeleteEmpresa();

  useEffect(() => {
    if (!isModalOpen) {
      setEditingEmpresa(null);
      setForm(initialForm);
    }
  }, [isModalOpen]);

  useEffect(() => {
    window.localStorage.setItem(EMPRESAS_STORAGE_KEY, JSON.stringify(recentEmpresas));
  }, [recentEmpresas]);

  function updateForm<K extends keyof EmpresaFormValues>(field: K, value: EmpresaFormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setFeedback(null);
    setEditingEmpresa(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(empresa: Empresa) {
    setFeedback(null);
    setEditingEmpresa(empresa);
    setForm({
      legalName: empresa.legalName ?? '',
      tradeName: empresa.tradeName ?? '',
      cnpj: maskCNPJ(unmask(empresa.cnpj)),
      email: empresa.email ?? '',
      phone: empresa.phone ? maskPhone(unmask(empresa.phone)) : '',
      representativeName: empresa.representativeName ?? '',
      representativeCpf: empresa.representativeCpf ? maskCPF(unmask(empresa.representativeCpf)) : '',
      representativePhone: empresa.representativePhone ? maskPhone(unmask(empresa.representativePhone)) : '',
      street: empresa.address?.street ?? '',
      number: empresa.address?.number ?? '',
      neighborhood: empresa.address?.neighborhood ?? '',
      city: empresa.address?.city ?? '',
      state: empresa.address?.state ?? '',
      zipCode: empresa.address?.zipCode ?? '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const payload: Empresa = {
      legalName: form.legalName.trim(),
      tradeName: form.tradeName.trim(),
      cnpj: maskCNPJ(unmask(form.cnpj)),
      email: form.email.trim(),
      phone: form.phone ? maskPhone(unmask(form.phone)) : '',
      representativeName: form.representativeName.trim(),
      representativeCpf: form.representativeCpf ? maskCPF(unmask(form.representativeCpf)) : '',
      representativePhone: form.representativePhone ? maskPhone(unmask(form.representativePhone)) : '',
      address: {
        street: form.street.trim(),
        number: form.number.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        zipCode: form.zipCode.trim(),
      },
    };

    try {
      if (editingEmpresa?.id) {
        const updatedEmpresa = await updateEmpresa.mutateAsync({ id: editingEmpresa.id, payload });
        const normalizedEmpresa = normalizeEmpresa(payload, updatedEmpresa);
        setRecentEmpresas((current) =>
          current.map((empresa) => (empresa.id === editingEmpresa.id ? normalizedEmpresa : empresa)),
        );
        setFeedback('Empresa atualizada com sucesso.');
      } else {
        const createdEmpresa = await createEmpresa.mutateAsync(payload);
        const normalizedEmpresa = normalizeEmpresa(payload, createdEmpresa);
        setRecentEmpresas((current) => [
          normalizedEmpresa,
          ...current.filter((empresa) =>
            normalizedEmpresa.id ? empresa.id !== normalizedEmpresa.id : empresa.email !== normalizedEmpresa.email,
          ),
        ]);
        setFeedback('Empresa cadastrada com sucesso.');
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível salvar a empresa. Verifique os dados e tente novamente.');
      console.error(error);
    }
  }

  async function handleDelete(empresa: Empresa) {
    const confirmed = window.confirm(`Deseja excluir a empresa "${empresa.legalName}"?`);
    if (!confirmed) return;

    try {
      if (empresa.id) {
        await deleteEmpresa.mutateAsync(empresa.id);
      }
      setRecentEmpresas((current) => current.filter((item) => item.id !== empresa.id));
      setFeedback('Empresa excluída com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

      if (isNotFound) {
        setRecentEmpresas((current) => current.filter((item) => item.id !== empresa.id));
        setFeedback('Empresa excluída com sucesso.');
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível excluir a empresa.');
      console.error(error);
    }
  }

  const fetchedEmpresas = data?.content ?? [];
  const empresas = [...recentEmpresas, ...fetchedEmpresas].filter(
    (empresa, index, array) =>
      !!empresa.legalName &&
      !!empresa.cnpj &&
      array.findIndex((item) => (item.id ? item.id === empresa.id : item.email === empresa.email)) === index,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Building2 size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gerenciamento</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic text-climbe-secondary">Empresas</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Visualize e gerencie todas as empresas parceiras e clientes cadastrados no sistema.
        </p>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por razão social, nome fantasia, e-mail ou CNPJ..."
            className="w-full max-w-xl"
          />
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Nova empresa
          </Button>
        </div>

        {feedback ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p> : null}
        {isLoading ? <p className="text-sm text-gray-400">Carregando empresas...</p> : null}
        {isError ? <p className="text-sm text-red-500">Não foi possível carregar as empresas.</p> : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {empresas.map((empresa, index) => (
            <div
              key={empresa.id ?? empresa.email ?? `empresa-${index}`}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-climbe-secondary font-black italic text-white">
                    E{index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold italic text-climbe-secondary">{empresa.tradeName || empresa.legalName || 'Empresa sem nome'}</h4>
                    <p className="text-xs text-gray-400">{empresa.cnpj ? formatCNPJ(unmask(empresa.cnpj)) : 'CNPJ não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(empresa)} aria-label="Editar empresa">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(empresa)} aria-label="Excluir empresa">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>{empresa.email || 'E-mail não informado'}</p>
                <p>{empresa.phone || 'Telefone não informado'}</p>
                <p>{empresa.address?.city ? `${empresa.address.city}/${empresa.address.state || ''}` : 'Endereço não informado'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EmpresaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEmpresa={editingEmpresa}
        form={form}
        onChangeForm={updateForm}
        onSubmit={handleSubmit}
        isSubmitting={createEmpresa.isPending || updateEmpresa.isPending}
        feedback={feedback}
      />
    </div>
  );
}
