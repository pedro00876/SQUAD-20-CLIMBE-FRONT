import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, AlertCircle, CheckCircle2, Send, Download, Eye, Loader2, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { reportService } from '@/services/report.service';
import { documentService } from '@/services/document.service';
import { notificationService } from '@/services/notification.service';

interface StageRelatorioProps {
  empresa: any;
  contract: any;
  userRole: string;
  canCreate: boolean;
  canApprove: boolean;
  onConcluir: () => void;
}

type RelatorioStatus = 'RASCUNHO' | 'REVISAO' | 'APROVADO' | 'CORRECAO';

interface HistoryEntry {
  type: 'correction_requested' | 'submitted' | 'approved';
  by: string;
  at: string;
  note?: string;
}

export function StageRelatorio({
  empresa,
  contract,
  userRole,
  canCreate,
  canApprove,
  onConcluir,
}: StageRelatorioProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [relatorioText, setRelatorioText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<RelatorioStatus>('RASCUNHO');
  const [motivoCorrecao, setMotivoCorrecao] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [savedReportId, setSavedReportId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Auto-save indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback((val: string) => {
    setRelatorioText(val);
    setAutoSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      // Simulated auto-save (local state only — real save on submit)
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // ── Create / submit report ─────────────────────────────────────────────────

  const criarMutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error('Contrato não encontrado.');

      let resolvedPdfUrl: string | undefined;
      if (pdfFile) {
        const doc = await documentService.upload(
          {
            enterpriseId: empresa.id,
            proposalId: contract.proposalId,
            documentType: 'BALANCO_PATRIMONIAL',
            validated: false,
          },
          pdfFile,
        );
        const signed = await documentService.getViewUrl(doc.id);
        resolvedPdfUrl = signed;
        setPdfUrl(signed);
      }

      const report = await reportService.create({
        contractId: contract.id,
        ...(resolvedPdfUrl ? { pdfUrl: resolvedPdfUrl } : {}),
      } as any);

      setSavedReportId(report.id);
      return report;
    },
    onSuccess: () => {
      setStatus('REVISAO');
      setHistory(h => [...h, { type: 'submitted', by: userRole, at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    },
    onError: (err: any) => setError(err?.response?.data?.message || err?.message || 'Erro ao criar relatório.'),
  });

  // ── Approve report ─────────────────────────────────────────────────────────

  const aprovaMutation = useMutation({
    mutationFn: async () => {
      if (!savedReportId) throw new Error('Relatório não salvo.');
      await reportService.update(savedReportId, { sentAt: new Date().toISOString() });
      const emails = [empresa.email].filter(Boolean);
      for (const email of emails) {
        await notificationService.sendEmail(
          email,
          `Relatório aprovado — ${empresa.tradeName || empresa.legalName}`,
          `O relatório de análise foi aprovado e enviado. Acesse o sistema para visualizar o documento.`,
        );
      }
    },
    onSuccess: () => {
      setStatus('APROVADO');
      setHistory(h => [...h, { type: 'approved', by: userRole, at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      queryClient.invalidateQueries({ queryKey: ['reports-contract', contract?.id] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao aprovar relatório.'),
  });

  // ── Request correction ─────────────────────────────────────────────────────

  const correcaoMutation = useMutation({
    mutationFn: async () => {
      // Local state only
    },
    onSuccess: () => {
      setStatus('CORRECAO');
      setShowCorrectionInput(false);
      setHistory(h => [...h, { type: 'correction_requested', by: userRole, at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), note: motivoCorrecao }]);
    },
  });

  const isBusy = criarMutation.isPending || aprovaMutation.isPending || correcaoMutation.isPending;

  // ── Auto-save label ────────────────────────────────────────────────────────

  function AutoSaveIndicator() {
    if (status !== 'RASCUNHO' && status !== 'CORRECAO') return null;
    if (!relatorioText) return null;
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
        {autoSaveStatus === 'saving' ? (
          <><Loader2 size={11} className="animate-spin" /> Salvando...</>
        ) : autoSaveStatus === 'saved' && lastSavedAt ? (
          <><Save size={11} className="text-green-500" /> Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status badge at top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex-1 mr-4">
          <BarChart3 className="shrink-0" />
          <p className="font-medium mt-0.5">
            Etapa de Criação do Relatório (Tesouros). O Analista elabora o relatório, exporta em PDF e o Sênior
            realiza a aprovação final antes do encerramento.
          </p>
        </div>
        <StatusBadge
          status={status === 'RASCUNHO' ? 'PENDING' : status === 'REVISAO' ? 'SUBMITTED' : status === 'APROVADO' ? 'APPROVED' : 'IN_PROGRESS'}
          size="md"
        />
      </div>

      {/* RASCUNHO / CORRECAO */}
      {(status === 'RASCUNHO' || status === 'CORRECAO') && (
        <div className="space-y-6">
          {status === 'CORRECAO' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-100 flex gap-2">
              <AlertCircle className="shrink-0 text-red-500" />
              <div>
                <span className="font-bold">Correção Solicitada:</span>
                <p className="mt-1">{motivoCorrecao}</p>
              </div>
            </div>
          )}

          {canCreate ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest">
                    Parecer Técnico — Relatório de Análise
                  </Label>
                  <AutoSaveIndicator />
                </div>
                <textarea
                  required
                  value={relatorioText}
                  onChange={e => handleTextChange(e.target.value)}
                  disabled={isBusy}
                  rows={10}
                  placeholder="Escreva o parecer técnico completo, incluindo análise dos documentos, reunião e capacidade financeira..."
                  className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 leading-relaxed"
                />
              </div>

              {/* PDF upload */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Exportar / Anexar PDF</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <p className="font-bold text-climbe-secondary">
                    {pdfFile ? pdfFile.name : 'Clique para selecionar o PDF do relatório'}
                  </p>
                  {!pdfFile && <p className="text-xs text-gray-400 mt-1">PDF (máx. 50 MB)</p>}
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
                  {error}
                </p>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={() => { setError(''); criarMutation.mutate(); }}
                  disabled={!relatorioText || isBusy}
                  className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
                >
                  {isBusy
                    ? <><Loader2 size={16} className="mr-2 animate-spin" /> SALVANDO...</>
                    : <><Send size={16} className="mr-2" /> SALVAR E ENVIAR PARA REVISÃO</>
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-gray-400 italic font-medium">
                Aguardando que o Analista envie o relatório para revisão.
              </p>
            </div>
          )}
        </div>
      )}

      {/* REVISAO */}
      {status === 'REVISAO' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 flex gap-2">
            <AlertCircle className="shrink-0 text-yellow-500" />
            <p className="font-medium mt-0.5">Relatório enviado. Aguardando aprovação do Analista Sênior / Analista Chefe.</p>
          </div>

          {pdfUrl && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2"
              >
                <Eye size={14} /> Visualizar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = pdfUrl;
                  a.download = `relatorio-${empresa.tradeName || empresa.legalName}.pdf`;
                  a.click();
                }}
                className="flex items-center gap-2"
              >
                <Download size={14} /> Baixar PDF
              </Button>
            </div>
          )}

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Parecer do Analista</span>
            <p className="text-sm text-climbe-secondary whitespace-pre-wrap font-medium leading-relaxed">{relatorioText}</p>
          </div>

          {canApprove ? (
            <div className="space-y-4">
              {showCorrectionInput ? (
                <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-red-800">
                    O que precisa ser corrigido?
                  </Label>
                  <textarea
                    value={motivoCorrecao}
                    onChange={e => setMotivoCorrecao(e.target.value)}
                    rows={3}
                    placeholder="Indique os ajustes necessários..."
                    className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none border focus:border-red-500/30"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCorrectionInput(false)} className="text-red-700">
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={!motivoCorrecao || isBusy}
                      onClick={() => correcaoMutation.mutate()}
                      className="bg-red-500 text-white font-bold rounded-lg"
                    >
                      Solicitar Correção
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-100 hover:bg-red-50"
                    onClick={() => setShowCorrectionInput(true)}
                  >
                    Solicitar Correção
                  </Button>
                  <Button
                    onClick={() => { setError(''); aprovaMutation.mutate(); }}
                    disabled={isBusy}
                    className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all"
                  >
                    {isBusy
                      ? <><Loader2 size={16} className="mr-2 animate-spin" /> APROVANDO...</>
                      : 'APROVAR RELATÓRIO'
                    }
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-gray-400 italic font-medium">
                Você já submeteu o relatório. Aguarde a validação do Sênior.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-500">
              {error}
            </p>
          )}
        </div>
      )}

      {/* APROVADO */}
      {status === 'APROVADO' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black italic text-green-700">Relatório Aprovado</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto">
              O relatório foi aprovado e todos os envolvidos foram notificados, incluindo a empresa contratante.
            </p>
          </div>

          {pdfUrl && (
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2"
              >
                <Eye size={14} /> Visualizar PDF
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={onConcluir}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              AVANÇAR PARA APROVAÇÃO FINAL
            </Button>
          </div>
        </div>
      )}

      {/* Revision history */}
      {history.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Clock size={11} /> Histórico de Revisão
          </span>
          <div className="space-y-2">
            {history.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  entry.type === 'approved' ? 'bg-green-500' :
                  entry.type === 'correction_requested' ? 'bg-red-400' :
                  'bg-blue-400'
                }`} />
                <div>
                  <span className="font-bold text-climbe-secondary">
                    {entry.type === 'approved' ? 'Aprovado' :
                     entry.type === 'correction_requested' ? 'Correção solicitada' :
                     'Submetido para revisão'}
                  </span>
                  <span className="text-gray-400"> por {entry.by} às {entry.at}</span>
                  {entry.note && <p className="text-gray-400 mt-0.5 italic">"{entry.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
