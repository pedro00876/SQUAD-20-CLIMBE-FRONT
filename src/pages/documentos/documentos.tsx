import { useState, type FormEvent } from 'react';
import { Files, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentoModal } from '@/features/documentos/components';
import type { Documento, DocumentoFormValues } from '@/types/documento.types';

const initialForm: DocumentoFormValues = {
  nome: '',
  tipo: '',
  empresaId: '',
  descricao: '',
  url: '',
};

const DOCUMENTOS_STORAGE_KEY = 'climbe-demo-documentos';

const TIPO_LABELS: Record<string, string> = {
  CONTRATO: 'Contratos',
  FINANCEIRO: 'Financeiro',
  RH: 'RH',
  JURIDICO: 'Jurídico',
  OUTRO: 'Outro',
};

function createLocalId() {
  return String(Date.now() + Math.floor(Math.random() * 1000));
}

export function DocumentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [form, setForm] = useState<DocumentoFormValues>(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>(() => {
    const stored = window.localStorage.getItem(DOCUMENTOS_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as Documento[];
    } catch {
      return [];
    }
  });

  function updateForm<K extends keyof DocumentoFormValues>(field: K, value: DocumentoFormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

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
      nome: documento.nome ?? '',
      tipo: documento.tipo ?? '',
      empresaId: documento.empresaId ?? '',
      descricao: documento.descricao ?? '',
      url: documento.url ?? '',
    });
    setIsModalOpen(true);
  }

  function handleDelete(documento: Documento) {
    const confirmed = window.confirm(`Deseja excluir o documento "${documento.nome}"?`);
    if (!confirmed) return;
    const updated = documentos.filter((d) => d.id !== documento.id);
    setDocumentos(updated);
    window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(updated));
    setFeedback('Documento excluído com sucesso.');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (editingDocumento?.id) {
      const updated = documentos.map((d) =>
        d.id === editingDocumento.id
          ? { ...d, ...form }
          : d,
      );
      setDocumentos(updated);
      window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(updated));
      setFeedback('Documento atualizado com sucesso.');
    } else {
      const novoDocumento: Documento = {
        id: createLocalId(),
        ...form,
      };
      const updated = [novoDocumento, ...documentos];
      setDocumentos(updated);
      window.localStorage.setItem(DOCUMENTOS_STORAGE_KEY, JSON.stringify(updated));
      setFeedback('Documento cadastrado com sucesso.');
    }

    setIsModalOpen(false);
  }

  // Agrupar documentos por tipo para exibição nos cards
  const pastasFixas = ['CONTRATO', 'FINANCEIRO', 'RH', 'JURIDICO'];
  const pastaDocsCount = (tipo: string) => documentos.filter((d) => d.tipo === tipo).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Files size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Repositório</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Documentos</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Centralize todos os arquivos, contratos e documentos importantes da sua empresa.
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p>
      )}

      {/* Cards de pastas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {pastasFixas.map((tipo) => (
          <div
            key={tipo}
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-climbe-primary/30 hover:shadow-xl hover:shadow-climbe-primary/5 transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-climbe-primary mb-6 group-hover:bg-climbe-primary group-hover:text-climbe-secondary transition-colors">
              <Files size={24} />
            </div>
            <h4 className="font-bold text-climbe-secondary italic mb-1">{TIPO_LABELS[tipo]}</h4>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {pastaDocsCount(tipo)} Arquivo{pastaDocsCount(tipo) !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Botão e lista de documentos */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold italic text-climbe-secondary">Todos os documentos</h3>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus size={16} />
            Novo documento
          </Button>
        </div>

        {documentos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[40px] border border-dashed border-gray-200 px-8 py-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-200">
              <Files size={40} />
            </div>
            <h3 className="mt-4 text-xl font-bold italic text-climbe-secondary">Nenhum documento cadastrado</h3>
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Adicione contratos, relatórios e outros arquivos importantes.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {documentos.map((documento) => (
            <div
              key={documento.id}
              className="flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-climbe-primary/10 text-climbe-primary">
                  <Files size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold italic text-climbe-secondary">{documento.nome}</h5>
                  <p className="text-xs text-gray-400">
                    {TIPO_LABELS[documento.tipo] ?? documento.tipo}
                    {documento.descricao ? ` • ${documento.descricao}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {documento.url && (
                  <a
                    href={documento.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-climbe-primary underline"
                  >
                    Ver arquivo
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(documento)}
                  aria-label="Editar documento"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(documento)}
                  aria-label="Excluir documento"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingDocumento={editingDocumento}
        form={form}
        onChangeForm={updateForm}
        onSubmit={handleSubmit}
        isSubmitting={false}
        feedback={null}
      />
    </div>
  );
}
