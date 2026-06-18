import { type FormEvent, useState } from 'react';
import { BarChart3, Calendar, Download, Eye, FileText, Loader2, Plus, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { contractService, type Contract } from '@/services/contract.service';
import { reportService, type Report } from '@/services/report.service';

export function RelatoriosPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');
  const queryClient = useQueryClient();

  const { data: reportsPage, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.list(0, 100),
  });

  const { data: contractsPage } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.list(0, 100),
  });

  const contracts: Contract[] = contractsPage?.content || [];
  const contractsById = new Map(contracts.map((contract) => [contract.id, contract]));

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedContractId || !selectedFile) {
        throw new Error('Selecione um contrato e um arquivo PDF.');
      }

      if (selectedFile.type !== 'application/pdf' || !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Somente arquivos PDF podem ser enviados.');
      }

      return reportService.upload({ contractId: Number(selectedContractId) }, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setIsUploadOpen(false);
      setSelectedContractId('');
      setSelectedFile(null);
      setUploadError('');
    },
    onError: (error: any) => {
      setUploadError(error?.response?.data?.message || error?.message || 'Não foi possível enviar o relatório.');
    },
  });

  const handlePdfAction = async (report: Report, download = false) => {
    setActionError('');
    try {
      const url = await reportService.getViewUrl(report.id);

      if (download) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${report.id}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        return;
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setActionError(error?.response?.data?.message || 'Não foi possível acessar o PDF deste relatório.');
    }
  };

  const handleUploadSubmit = (event: FormEvent) => {
    event.preventDefault();
    setUploadError('');
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <BarChart3 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Análise</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-climbe-secondary">Relatórios</h1>
          <p className="max-w-2xl font-light text-gray-400">
            Anexe os relatórios finais em PDF e disponibilize a visualização ou o download para apresentação à empresa.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          ANEXAR RELATÓRIO PDF
        </Button>
      </div>

      {actionError ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-500">{actionError}</p>
      ) : null}

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : (reportsPage?.content || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[40px] border border-gray-100 bg-white p-20 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50 text-gray-200">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-bold italic text-climbe-secondary">Nenhum relatório anexado</h3>
          <p className="max-w-xs text-sm text-gray-400">Anexe um arquivo PDF para que ele possa ser consultado ou baixado posteriormente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportsPage!.content.map((report) => {
            const contract = contractsById.get(report.contractId);
            const reportDate = report.sentAt || report.createdAt;

            return (
              <div key={report.id} className="group rounded-[32px] border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-climbe-secondary text-white">
                    <FileText size={24} />
                  </div>
                  <span className="rounded-full bg-climbe-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-climbe-primary">
                    {report.status || 'PDF'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold italic text-climbe-secondary">Relatório #{report.id}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Contrato #{report.contractId}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {contract?.enterpriseName || contract?.proposalEnterpriseName || 'Contrato vinculado'}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">
                      {reportDate ? format(new Date(reportDate), 'dd/MM/yyyy', { locale: ptBR }) : '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handlePdfAction(report)}
                      aria-label={`Visualizar relatório ${report.id}`}
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-climbe-primary/10 hover:text-climbe-primary"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePdfAction(report, true)}
                      aria-label={`Baixar relatório ${report.id}`}
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-climbe-primary/10 hover:text-climbe-primary"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} className="max-w-lg bg-climbe-secondary text-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-white">Upload de Relatório</h2>
            <p className="text-xs text-slate-300">Selecione o contrato e anexe um arquivo em formato PDF.</p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Contrato</Label>
              <select
                required
                value={selectedContractId}
                onChange={(event) => setSelectedContractId(event.target.value)}
                className="w-full rounded-xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/40"
              >
                <option value="">Selecione um contrato...</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    Contrato #{contract.id} - {contract.enterpriseName || contract.proposalEnterpriseName || 'Empresa'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-200">Arquivo PDF</Label>
              <Input
                required
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="bg-white text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-climbe-primary file:px-3 file:py-1 file:text-xs file:font-black file:text-climbe-secondary"
              />
            </div>

            {uploadError ? (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-100">{uploadError}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUploadOpen(false)}
                className="flex-1 font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploadMutation.isPending || !selectedContractId || !selectedFile}
                className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                <Upload size={16} className="mr-2" />
                {uploadMutation.isPending ? 'ENVIANDO...' : 'ENVIAR PDF'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
