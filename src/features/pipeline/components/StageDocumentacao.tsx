import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Files, Upload, CheckCircle2, XCircle, AlertCircle, FileText, Loader2, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentProgress } from '@/components/ui/DocumentProgress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StageAccessDenied } from '@/components/ui/StageAccessDenied';
import {
  documentRequirementService,
  documentService,
  type DocumentRequirement,
  type DocumentType,
  type DocumentRequirementStatus,
} from '@/services/document.service';
import { notificationService } from '@/services/notification.service';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'BALANCO_PATRIMONIAL', label: 'Balanço da Empresa' },
  { value: 'DRE',                 label: 'DRE'                },
  { value: 'PLANILHA_GERENCIAL',  label: 'Planilhas Gerenciais' },
  { value: 'CNPJ',                label: 'Cartão CNPJ'        },
  { value: 'CONTRATO_SOCIAL',     label: 'Contrato Social'    },
];

const TYPE_LABEL: Record<DocumentType, string> = Object.fromEntries(
  DOCUMENT_TYPES.map(d => [d.value, d.label]),
) as Record<DocumentType, string>;

const STATUS_COLOR: Record<DocumentRequirementStatus, string> = {
  PENDING:       'text-amber-600 bg-amber-50 border-amber-100',
  SUBMITTED:     'text-blue-500 bg-blue-50 border-blue-100',
  NON_COMPLIANT: 'text-red-500 bg-red-50 border-red-100',
  APPROVED:      'text-green-600 bg-green-50 border-green-200',
};

interface StageDocumentacaoProps {
  empresa: any;
  proposal: any;
  docRequirements: DocumentRequirement[];
  userRole: string;
  currentStage: 'DOCUMENTACAO' | 'VALIDACAO';
  canSolicitar: boolean;
  canValidar: boolean;
  onConcluir: () => void;
}

export function StageDocumentacao({
  empresa,
  proposal,
  docRequirements,
  userRole,
  currentStage,
  canSolicitar,
  canValidar,
  onConcluir,
}: StageDocumentacaoProps) {
  const queryClient = useQueryClient();
  const [deadline, setDeadline] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>(
    DOCUMENT_TYPES.map(d => d.value),
  );
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const checklist = docRequirements;
  const hasChecklist = checklist.length > 0;
  const allApproved = hasChecklist && checklist.every(r => r.status === 'APPROVED');

  // ── Create checklist ───────────────────────────────────────────────────────

  const createChecklistMutation = useMutation({
    mutationFn: () =>
      documentRequirementService.createForProposal(proposal.id, {
        documentTypes: selectedTypes,
        deadline: deadline || undefined,
      }),
    onSuccess: async () => {
      if (empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Documentação solicitada — ${empresa.tradeName || empresa.legalName}`,
          `Olá! Os seguintes documentos foram solicitados: ${selectedTypes.map(t => TYPE_LABEL[t]).join(', ')}. Prazo: ${deadline || 'a combinar'}.`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ['doc-requirements', proposal.id] });
      onConcluir();
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao solicitar documentos.'),
  });

  // ── Upload document ────────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: async ({ requirementId, docType, file }: { requirementId: number; docType: DocumentType; file: File }) => {
      await documentService.upload(
        {
          enterpriseId: empresa.id,
          proposalId: proposal.id,
          documentType: docType,
          validated: false,
        },
        file,
      );
      await documentRequirementService.update(requirementId, { status: 'SUBMITTED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-requirements', proposal.id] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao fazer upload do documento.'),
  });

  // ── Validate document ──────────────────────────────────────────────────────

  const validateMutation = useMutation({
    mutationFn: async ({
      req,
      newStatus,
    }: {
      req: DocumentRequirement;
      newStatus: DocumentRequirementStatus;
    }) => {
      const rejectionReason = newStatus === 'NON_COMPLIANT' ? rejectReasons[req.id]?.trim() : undefined;
      if (newStatus === 'NON_COMPLIANT' && !rejectionReason) {
        throw new Error('Informe o motivo da não conformidade antes de reprovar.');
      }
      await documentRequirementService.update(req.id, {
        status: newStatus,
        rejectionReason: rejectionReason || undefined,
      });
      if (newStatus === 'NON_COMPLIANT' && empresa.email) {
        await notificationService.sendEmail(
          empresa.email,
          `Documento não conforme — ${TYPE_LABEL[req.documentType]}`,
          `O documento "${TYPE_LABEL[req.documentType]}" não está conforme. Motivo: ${rejectionReason}. Por favor, reenvie dentro do prazo.`,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-requirements', proposal.id] });
      setRejectReasons({});
    },
    onError: (err: any) => setError(err?.response?.data?.message || err?.message || 'Erro ao validar documento.'),
  });

  const toggleType = (type: DocumentType) => {
    setSelectedTypes(cur =>
      cur.includes(type) ? cur.filter(t => t !== type) : [...cur, type],
    );
  };

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!canSolicitar && !canValidar) {
    return (
      <StageAccessDenied
        requiredRoles={['COMPLIANCE', 'ANALISTA_SENIOR']}
        currentStageLabel="Documentação"
        hint="Compliance solicita documentos. Analista Sênior valida documentos enviados."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <Files className="shrink-0" />
        <p className="font-medium mt-0.5">
          {currentStage === 'DOCUMENTACAO'
            ? 'Solicite os documentos obrigatórios à empresa. Após o envio, o analista deve validar cada um.'
            : 'Valide os documentos enviados pela empresa. Documentos não conformes retornam para reenvio com prazo.'}
        </p>
      </div>

      {/* DocumentProgress bar */}
      {hasChecklist && (
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <DocumentProgress requirements={checklist} />
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
          {error}
        </p>
      )}

      {/* Nota Seguros */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <Shield size={15} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Nota — Seguros da Empresa</span>
          <p className="text-xs text-amber-700 mt-1 font-light leading-relaxed">
            Os <strong className="font-bold">Seguros da Empresa</strong> não são rastreáveis neste checklist digital.
            Certifique-se de verificar manualmente a documentação de seguros antes de validar todos os documentos.
          </p>
        </div>
      </div>

      {/* Criar checklist */}
      {currentStage === 'DOCUMENTACAO' && !hasChecklist && canSolicitar && (
        <div className="space-y-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-climbe-secondary mb-2">Solicitar Documentação</h3>
            <p className="text-sm text-gray-400">
              Selecione os documentos exigidos para{' '}
              <strong>{empresa.tradeName || empresa.legalName}</strong>
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENT_TYPES.map(dt => (
              <label
                key={dt.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-climbe-secondary transition hover:bg-gray-100 border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(dt.value)}
                  onChange={() => toggleType(dt.value)}
                  className="h-4 w-4 accent-climbe-primary"
                />
                {dt.label}
              </label>
            ))}
          </div>

          {/* Deadline — highlighted */}
          <div className="space-y-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-amber-700">
              <Calendar size={14} /> Prazo para envio (obrigatório)
            </Label>
            <Input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="bg-white border-amber-200 focus:ring-amber-400/20"
            />
            <p className="text-[10px] text-amber-600 font-medium">
              O prazo será exibido em destaque para a empresa contratante.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={() => { setError(''); createChecklistMutation.mutate(); }}
              disabled={selectedTypes.length === 0 || createChecklistMutation.isPending}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl hover:scale-105 transition-all"
            >
              {createChecklistMutation.isPending
                ? <><Loader2 size={16} className="mr-2 animate-spin" /> SOLICITANDO...</>
                : 'NOTIFICAR EMPRESA E SOLICITAR DOCUMENTOS'
              }
            </Button>
          </div>
        </div>
      )}

      {/* Checklist list */}
      {hasChecklist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold italic text-climbe-secondary text-lg">
              {currentStage === 'DOCUMENTACAO' ? 'Checklist de Documentos' : 'Validação de Documentos'}
            </h3>
          </div>

          <div className="grid gap-4">
            {checklist.map(req => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      req.status === 'APPROVED'
                        ? 'bg-green-50 text-green-500'
                        : req.status === 'NON_COMPLIANT'
                          ? 'bg-red-50 text-red-500'
                          : req.status === 'SUBMITTED'
                            ? 'bg-blue-50 text-blue-500'
                            : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {req.status === 'APPROVED' ? <CheckCircle2 /> : req.status === 'NON_COMPLIANT' ? <XCircle /> : <FileText />}
                  </div>
                  <div>
                    <h4 className="font-bold text-climbe-secondary">{TYPE_LABEL[req.documentType]}</h4>
                    <StatusBadge status={req.status} size="sm" className="mt-1" />
                    {/* Deadline highlighted */}
                    {req.deadline && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Calendar size={11} className="text-amber-500" />
                        <p className="text-[11px] font-bold text-amber-600">
                          Prazo: {new Date(req.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {req.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {req.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  {currentStage === 'DOCUMENTACAO' && (req.status === 'PENDING' || req.status === 'NON_COMPLIANT') && (
                    <>
                      <input
                        type="file"
                        ref={el => { fileInputRefs.current[req.id] = el; }}
                        className="hidden"
                        accept=".pdf,.xlsx,.xls,.doc,.docx"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setError('');
                            uploadMutation.mutate({ requirementId: req.id, docType: req.documentType, file: f });
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[req.id]?.click()}
                        disabled={uploadMutation.isPending}
                        className="border-dashed"
                      >
                        {uploadMutation.isPending
                          ? <><Loader2 size={12} className="mr-1 animate-spin" /> Enviando...</>
                          : <><Upload size={14} className="mr-2" /> Anexar</>
                        }
                      </Button>
                    </>
                  )}

                  {currentStage === 'VALIDACAO' && canValidar && req.status === 'SUBMITTED' && (
                    <div className="flex gap-2 w-full sm:w-auto flex-col">
                      <textarea
                        value={rejectReasons[req.id] || ''}
                        onChange={e => setRejectReasons(cur => ({ ...cur, [req.id]: e.target.value }))}
                        rows={2}
                        placeholder="Motivo da não conformidade (obrigatório para reprovar)"
                        className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-100 focus:ring-1 focus:ring-red-400 outline-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:bg-red-50 border-red-100"
                          disabled={validateMutation.isPending}
                          onClick={() => { setError(''); validateMutation.mutate({ req, newStatus: 'NON_COMPLIANT' }); }}
                        >
                          Reprovar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-climbe-primary text-climbe-secondary"
                          disabled={validateMutation.isPending}
                          onClick={() => { setError(''); validateMutation.mutate({ req, newStatus: 'APPROVED' }); }}
                        >
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* All approved banner */}
          {allApproved && currentStage === 'VALIDACAO' && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 p-5 rounded-2xl">
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <h4 className="font-black italic">Todos os documentos aprovados!</h4>
                <p className="text-sm text-green-600/80 font-light">
                  A documentação está completa. Você pode avançar para a próxima etapa.
                </p>
              </div>
            </div>
          )}

          {/* Advance button */}
          {currentStage === 'VALIDACAO' && canValidar && allApproved && (
            <div className="flex justify-end pt-8">
              <Button
                onClick={onConcluir}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-14"
              >
                DOCUMENTAÇÃO VALIDADA — LIBERAR FERRAMENTAS
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
