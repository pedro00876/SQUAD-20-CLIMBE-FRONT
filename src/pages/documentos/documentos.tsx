import axios from 'axios';
import { Files, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  useCreateDocumento,
  useDeleteDocumento,
  useDocumentos,
  useUpdateDocumento,
} from '@/features/documentos/hooks';
import { useEmpresas } from '@/features/empresas/hooks';
import { useUsuarios } from '@/features/usuarios/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { Documento, DocumentoFormValues } from '@/types/documento.types';

const initialForm: DocumentoFormValues = {
  enterpriseId: '',
  documentType: '',
  url: '',
  validated: false,
  analystId: '',
};

export function DocumentosPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [form, setForm] = useState<DocumentoFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = useDocumentos({ page: 0, size: 20, search: debouncedSearch });
  const { data: empresasData } = useEmpresas({ page: 0, size: 100 });
  const { data: usuariosData } = useUsuarios({ page: 0, size: 100 });
  const createDocumento = useCreateDocumento();
  const updateDocumento = useUpdateDocumento();
  const deleteDocumento = useDeleteDocumento();

  useEffect(() => {
    if (!isModalOpen) {
      setEditingDocumento(null);
      setForm(initialForm);
    }
  }, [isModalOpen]);

  const fetchedEmpresas = empresasData?.content ?? [];
  const empresas = fetchedEmpresas.filter(
    (empresa, index, array) =>
      !!empresa.id &&
      !!empresa.legalName &&
      array.findIndex((item) => item.id === empresa.id) === index,
  );

  const fetchedUsuarios = usuariosData?.content ?? [];
  const usuarios = fetchedUsuarios.filter(
    (usuario, index, array) =>
      !!usuario.id &&
      !!usuario.fullName &&
      array.findIndex((item) => item.id === usuario.id) === index,
  );

  function openCreateModal() {
    setFeedback(null);
    setEditingDocumento(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(documento: Documento) {
    setFeedback(null);
    setEditingDocumento(documento);
    setForm({
      enterpriseId: String(documento.enterpriseId ?? ''),
      documentType: documento.documentType ?? '',
      url: documento.url ?? '',
      validated: Boolean(documento.validated),
      analystId: documento.analystId ? String(documento.analystId) : '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const payload: Documento = {
      enterpriseId: Number(form.enterpriseId),
      documentType: form.documentType.trim(),
      url: form.url.trim(),
      validated: form.validated,
      analystId: form.analystId ? Number(form.analystId) : null,
    };

    try {
      if (editingDocumento?.id) {
        await updateDocumento.mutateAsync({ id: editingDocumento.id, payload });
        setFeedback('Documento atualizado com sucesso.');
      } else {
        await createDocumento.mutateAsync(payload);
        setFeedback('Documento cadastrado com sucesso.');
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível salvar o documento. Verifique os dados e tente novamente.');
      console.error(error);
    }
  }

  async function handleDelete(documento: Documento) {
    const confirmed = window.confirm(`Deseja excluir o documento "${documento.documentType}"?`);
    if (!confirmed) return;

    try {
      if (documento.id) {
        await deleteDocumento.mutateAsync(documento.id);
      }
      setFeedback('Documento excluído com sucesso.');
      await refetch();
    } catch (error) {
      const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;
      if (isNotFound) {
        setFeedback('Documento excluído com sucesso.');
        await refetch();
        return;
      }

      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      setFeedback(apiMessage ?? 'Não foi possível excluir o documento.');
      console.error(error);
    }
  }

  const fetchedDocumentos = data?.content ?? [];
  const documentos = fetchedDocumentos.filter(
    (documento, index, array) =>
      !!documento.enterpriseId &&
      !!documento.documentType &&
      array.findIndex((item) => (item.id ? item.id === documento.id : item.url === documento.url)) === index,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Files size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Repositório</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic text-climbe-secondary">Documentos</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Centralize todos os arquivos, contratos e documentos importantes da operação.
        </p>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por empresa, tipo de documento ou analista..."
            className="w-full max-w-xl"
          />
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Novo documento
          </Button>
        </div>

        {feedback ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p> : null}
        {isLoading ? <p className="text-sm text-gray-400">Carregando documentos...</p> : null}
        {isError ? <p className="text-sm text-red-500">Não foi possível carregar os documentos.</p> : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {documentos.map((documento) => (
            <article key={documento.id ?? documento.url} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-climbe-primary">
                    {documento.validated ? 'Validado' : 'Pendente'}
                  </p>
                  <h3 className="mt-2 text-lg font-bold italic text-climbe-secondary">{documento.documentType}</h3>
                  <p className="text-sm text-gray-500">{documento.enterpriseName || `Empresa ${documento.enterpriseId}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(documento)} aria-label="Editar documento">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(documento)} aria-label="Excluir documento">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Analista: {documento.analystName || 'Não atribuído'}</p>
                <p className="truncate">URL: {documento.url}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-2xl bg-climbe-secondary text-white"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-black italic text-white">
              {editingDocumento ? 'Editar documento' : 'Novo documento'}
            </h3>
            <p className="mt-1 text-sm text-white/80">Associe o documento à empresa e defina o status de validação.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="enterpriseId" className="font-bold text-white">Empresa</Label>
              <select
                id="enterpriseId"
                value={form.enterpriseId}
                onChange={(event) => setForm((current) => ({ ...current, enterpriseId: event.target.value }))}
                className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
                required
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.tradeName || empresa.legalName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType" className="font-bold text-white">Tipo de documento</Label>
              <Input
                id="documentType"
                className="text-black placeholder:text-gray-400"
                value={form.documentType}
                onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}
                placeholder="Ex.: Contrato social"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="font-bold text-white">URL do arquivo</Label>
              <Input
                id="url"
                className="text-black placeholder:text-gray-400"
                value={form.url}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analystId" className="font-bold text-white">Analista responsável</Label>
              <select
                id="analystId"
                value={form.analystId}
                onChange={(event) => setForm((current) => ({ ...current, analystId: event.target.value }))}
                className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
              >
                <option value="">Não atribuído</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.fullName}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 text-sm text-white">
              <input
                type="checkbox"
                checked={form.validated}
                onChange={(event) => setForm((current) => ({ ...current, validated: event.target.checked }))}
              />
              Documento validado
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createDocumento.isPending || updateDocumento.isPending}>
                {createDocumento.isPending || updateDocumento.isPending
                  ? 'Salvando...'
                  : editingDocumento
                    ? 'Salvar alterações'
                    : 'Cadastrar documento'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
