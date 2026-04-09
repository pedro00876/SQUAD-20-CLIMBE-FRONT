import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import type { Documento, DocumentoFormValues } from '@/types/documento.types';
import type { Empresa } from '@/types/empresa.types';

const DOCUMENTO_TIPOS = [
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'RH', label: 'RH' },
  { value: 'JURIDICO', label: 'Jurídico' },
  { value: 'OUTRO', label: 'Outro' },
];

interface DocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDocumento: Documento | null;
  form: DocumentoFormValues;
  onChangeForm: <K extends keyof DocumentoFormValues>(field: K, value: DocumentoFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  feedback: string | null;
  empresas?: Empresa[];
}

export function DocumentoModal({
  isOpen,
  onClose,
  editingDocumento,
  form,
  onChangeForm,
  onSubmit,
  isSubmitting,
  feedback,
  empresas = [],
}: DocumentoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg bg-climbe-secondary text-white"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black italic text-white">
            {editingDocumento ? 'Editar documento' : 'Novo documento'}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Preencha as informações do arquivo e selecione a categoria e empresa vinculada.
          </p>
        </div>

        {feedback && (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">{feedback}</p>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="documento-nome" className="font-bold text-white">
              Nome do documento
            </Label>
            <Input
              id="documento-nome"
              className="text-black placeholder:text-gray-400"
              value={form.nome}
              onChange={(e) => onChangeForm('nome', e.target.value)}
              placeholder="Ex.: Contrato de Parceria 2025"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documento-tipo" className="font-bold text-white">
                Categoria
              </Label>
              <select
                id="documento-tipo"
                value={form.tipo}
                onChange={(e) => onChangeForm('tipo', e.target.value)}
                className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
                required
              >
                <option value="">Selecione</option>
                {DOCUMENTO_TIPOS.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {empresas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="documento-empresaId" className="font-bold text-white">
                  Empresa vinculada
                </Label>
                <select
                  id="documento-empresaId"
                  value={form.empresaId}
                  onChange={(e) => onChangeForm('empresaId', e.target.value)}
                  className="flex h-12 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
                >
                  <option value="">Sem empresa</option>
                  {empresas
                    .filter((empresa) => empresa.id && empresa.legalName)
                    .map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.tradeName || empresa.legalName}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento-url" className="font-bold text-white">
              URL ou caminho do arquivo
            </Label>
            <Input
              id="documento-url"
              className="text-black placeholder:text-gray-400"
              value={form.url}
              onChange={(e) => onChangeForm('url', e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento-descricao" className="font-bold text-white">
              Descrição
            </Label>
            <textarea
              id="documento-descricao"
              value={form.descricao}
              onChange={(e) => onChangeForm('descricao', e.target.value)}
              rows={3}
              placeholder="Detalhes adicionais sobre o documento..."
              className="flex w-full resize-none rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : editingDocumento
                  ? 'Salvar alterações'
                  : 'Cadastrar documento'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
