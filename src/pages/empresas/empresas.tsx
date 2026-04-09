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

export function EmpresasPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [form, setForm] = useState<EmpresaFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
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
        await updateEmpresa.mutateAsync({ id: editingEmpresa.id, payload });
        setFeedback('Empresa atualizada com sucesso.');
      } else {
        await createEmpresa.mutateAsync(payload);
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
      setFeedback('Empresa excluída com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

      if (isNotFound) {
        setFeedback('Empresa excluída com sucesso.');
        await refetch();
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

  const empresas = fetchedEmpresas.filter(
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
        className="max-h-[90vh] max-w-2xl overflow-y-auto bg-climbe-secondary px-8 pb-8 pt-12 text-white"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black italic text-white">{editingEmpresa ? 'Editar empresa' : 'Nova empresa'}</h3>
            <p className="mt-1 text-sm text-white/80">
              Preencha os dados cadastrais, endereço completo e informações do representante legal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Dados da empresa</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="legalName" className="font-bold text-white">Razão social</Label>
              <Input
                id="legalName"
                className="text-black placeholder:text-gray-400"
                value={form.legalName}
                onChange={(event) => updateForm('legalName', event.target.value)}
                placeholder="Ex.: Climbe Investimentos LTDA"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="tradeName" className="font-bold text-white">Nome fantasia</Label>
              <Input
                id="tradeName"
                className="text-black placeholder:text-gray-400"
                value={form.tradeName}
                onChange={(event) => updateForm('tradeName', event.target.value)}
                placeholder="Ex.: Climbe"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cnpj" className="font-bold text-white">CNPJ</Label>
              <Input
                id="cnpj"
                className="text-black placeholder:text-gray-400"
                value={form.cnpj}
                onChange={(event) => updateForm('cnpj', maskCNPJ(event.target.value))}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="font-bold text-white">E-mail de contato</Label>
              <Input
                id="email"
                type="email"
                className="text-black placeholder:text-gray-400"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="contato@empresa.com.br"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="font-bold text-white">Telefone de contato</Label>
              <Input
                id="phone"
                className="text-black placeholder:text-gray-400"
                value={form.phone}
                onChange={(event) => updateForm('phone', maskPhone(event.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Endereço</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="street" className="font-bold text-white">Logradouro</Label>
              <Input
                id="street"
                className="text-black placeholder:text-gray-400"
                value={form.street}
                onChange={(event) => updateForm('street', event.target.value)}
                placeholder="Ex.: Rua das Flores"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="number" className="font-bold text-white">Número</Label>
              <Input
                id="number"
                className="text-black placeholder:text-gray-400"
                value={form.number}
                onChange={(event) => updateForm('number', event.target.value)}
                placeholder="Ex.: 123"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="neighborhood" className="font-bold text-white">Bairro</Label>
              <Input
                id="neighborhood"
                className="text-black placeholder:text-gray-400"
                value={form.neighborhood}
                onChange={(event) => updateForm('neighborhood', event.target.value)}
                placeholder="Ex.: Centro"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="city" className="font-bold text-white">Cidade</Label>
              <Input
                id="city"
                className="text-black placeholder:text-gray-400"
                value={form.city}
                onChange={(event) => updateForm('city', event.target.value)}
                placeholder="Ex.: Aracaju"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="state" className="font-bold text-white">UF</Label>
              <Input
                id="state"
                className="text-black placeholder:text-gray-400"
                value={form.state}
                onChange={(event) => updateForm('state', event.target.value)}
                maxLength={2}
                placeholder="SE"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="zipCode" className="font-bold text-white">CEP</Label>
              <Input
                id="zipCode"
                className="text-black placeholder:text-gray-400"
                value={form.zipCode}
                onChange={(event) => updateForm('zipCode', event.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Representante legal</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="representativeName" className="font-bold text-white">
                Nome do representante legal
              </Label>
              <Input
                id="representativeName"
                className="text-black placeholder:text-gray-400"
                value={form.representativeName}
                onChange={(event) => updateForm('representativeName', event.target.value)}
                placeholder="Ex.: Maria da Silva"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="representativeCpf" className="font-bold text-white">CPF do representante</Label>
              <Input
                id="representativeCpf"
                className="text-black placeholder:text-gray-400"
                value={form.representativeCpf}
                onChange={(event) => updateForm('representativeCpf', maskCPF(event.target.value))}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="representativePhone" className="font-bold text-white">Contato do representante</Label>
              <Input
                id="representativePhone"
                className="text-black placeholder:text-gray-400"
                value={form.representativePhone}
                onChange={(event) => updateForm('representativePhone', maskPhone(event.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEmpresa.isPending || updateEmpresa.isPending}>
                {createEmpresa.isPending || updateEmpresa.isPending
                  ? 'Salvando...'
                  : editingEmpresa
                    ? 'Salvar alterações'
                    : 'Cadastrar empresa'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
