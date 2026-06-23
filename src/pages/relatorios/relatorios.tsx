import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  FileText,
  Loader2,
  Plus,
  Upload,
  Folder,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { contractService, type Contract } from '@/services/contract.service';
import { proposalService, type Proposal } from '@/services/proposal.service';
import { reportService, type Report } from '@/services/report.service';
import type { EnrichedReport, ReportCompanyGroup } from '@/features/reports/types';

type ExplorerView = 'root' | 'folder';

const UNKNOWN_ENTERPRISE_NAME = 'Empresa não identificada';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

async function fetchAllReports(): Promise<Report[]> {
  const probe = await reportService.list(0, 1);
  const total = probe.totalElements;
  if (total === 0) return [];

  const pageSize = Math.min(total, 500);
  const first = await reportService.list(0, pageSize);
  let all = [...first.content];

  if (total > pageSize) {
    let page = 1;
    while (all.length < total) {
      const next = await reportService.list(page, pageSize);
      all = [...all, ...next.content];
      page += 1;
      if (next.content.length === 0) break;
    }
  }

  return all;
}

function enrichReport(
  report: Report,
  contractById: Map<number, Contract>,
  proposalById: Map<number, Proposal>,
): EnrichedReport {
  const contract = contractById.get(report.contractId);
  const proposal = contract ? proposalById.get(contract.proposalId) : undefined;
  return {
    ...report,
    enterpriseId: proposal?.enterpriseId ?? 0,
    enterpriseName: proposal?.enterpriseName ?? UNKNOWN_ENTERPRISE_NAME,
    proposalId: contract?.proposalId ?? 0,
  };
}

function sortReports(reports: EnrichedReport[]): EnrichedReport[] {
  return [...reports].sort((a, b) => {
    const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return b.id - a.id;
  });
}

function getGroupKey(group: ReportCompanyGroup): number {
  return group.enterpriseId || -(group.reports[0]?.proposalId ?? 0);
}

function groupReportsByCompany(reports: EnrichedReport[]): ReportCompanyGroup[] {
  const groups = new Map<number, ReportCompanyGroup>();

  for (const report of reports) {
    const key = report.enterpriseId || -report.proposalId;
    const existing = groups.get(key);
    if (existing) {
      existing.reports.push(report);
    } else {
      groups.set(key, {
        enterpriseId: report.enterpriseId,
        enterpriseName: report.enterpriseName,
        reports: [report],
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      reports: sortReports(group.reports),
    }))
    .sort((a, b) =>
      a.enterpriseName.localeCompare(b.enterpriseName, 'pt-BR', { sensitivity: 'base' }),
    );
}

function matchesSearch(report: EnrichedReport, term: string): boolean {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    report.enterpriseName.toLowerCase().includes(q) ||
    String(report.id).includes(q) ||
    String(report.contractId).includes(q) ||
    String(report.proposalId).includes(q)
  );
}

function matchesGroup(group: ReportCompanyGroup, term: string): boolean {
  if (!term) return true;
  const q = term.toLowerCase();
  if (group.enterpriseName.toLowerCase().includes(q)) return true;
  return group.reports.some((report) => matchesSearch(report, term));
}

export function RelatoriosPage() {
  const [searchParams] = useSearchParams();
  const highlightContractId = Number(searchParams.get('contractId') || 0) || null;

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ExplorerView>('root');
  const [selectedGroupKey, setSelectedGroupKey] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data: allReports = [], isLoading } = useQuery({
    queryKey: ['reports', 'all-for-grouping'],
    queryFn: fetchAllReports,
  });

  const { data: contractsPage } = useQuery({
    queryKey: ['contracts', 'all-for-reports'],
    queryFn: () => contractService.list(0, 500),
  });

  const { data: proposalsPage } = useQuery({
    queryKey: ['proposals', 'all-for-reports'],
    queryFn: () => proposalService.list(0, 500),
  });

  const contractById = useMemo(() => {
    const map = new Map<number, Contract>();
    for (const contract of contractsPage?.content ?? []) {
      map.set(contract.id, contract);
    }
    return map;
  }, [contractsPage]);

  const proposalById = useMemo(() => {
    const map = new Map<number, Proposal>();
    for (const proposal of proposalsPage?.content ?? []) {
      map.set(proposal.id, proposal);
    }
    return map;
  }, [proposalsPage]);

  const enrichedReports = useMemo(
    () => allReports.map((r) => enrichReport(r, contractById, proposalById)),
    [allReports, contractById, proposalById],
  );

  const allGroups = useMemo(
    () => groupReportsByCompany(enrichedReports),
    [enrichedReports],
  );

  const filteredGroups = useMemo(() => {
    const term = debouncedSearch.trim();
    if (!term) return allGroups;
    return allGroups.filter((group) => matchesGroup(group, term));
  }, [allGroups, debouncedSearch]);

  const selectedGroup = useMemo(
    () =>
      selectedGroupKey === null
        ? null
        : allGroups.find((group) => getGroupKey(group) === selectedGroupKey) ?? null,
    [allGroups, selectedGroupKey],
  );

  const folderReports = useMemo(() => {
    if (!selectedGroup) return [];
    const term = debouncedSearch.trim();
    if (!term) return selectedGroup.reports;
    return selectedGroup.reports.filter((report) => matchesSearch(report, term));
  }, [selectedGroup, debouncedSearch]);

  const totalFilteredReports = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.reports.length, 0),
    [filteredGroups],
  );

  const contracts: Contract[] = contractsPage?.content || [];

  useEffect(() => {
    if (!highlightContractId || enrichedReports.length === 0) return;
    const report = enrichedReports.find((r) => r.contractId === highlightContractId);
    if (!report) return;
    const group = allGroups.find((g) =>
      g.reports.some((r) => r.contractId === highlightContractId),
    );
    if (group) {
      setSelectedGroupKey(getGroupKey(group));
      setView('folder');
    }
  }, [highlightContractId, enrichedReports, allGroups]);

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

  const handlePdfAction = async (report: EnrichedReport, download = false) => {
    setActionError('');
    setViewLoadingId(report.id);
    try {
      const url = await reportService.getViewUrl(report.id);
      if (download) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${report.id}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      if (report.pdfUrl) {
        if (download) {
          const link = document.createElement('a');
          link.href = report.pdfUrl;
          link.download = `relatorio-${report.id}.pdf`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
        } else {
          window.open(report.pdfUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        setActionError('Não foi possível abrir o relatório. Verifique se o PDF está disponível.');
      }
    } finally {
      setViewLoadingId(null);
    }
  };

  const goToRoot = () => {
    setView('root');
    setSelectedGroupKey(null);
  };

  const openFolder = (group: ReportCompanyGroup) => {
    setSelectedGroupKey(getGroupKey(group));
    setView('folder');
  };

  const renderReportCard = (report: EnrichedReport) => (
    <div
      key={report.id}
      className="group rounded-[32px] border border-border bg-background p-7 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-climbe-secondary text-white">
          <FileText size={24} />
        </div>
        <span className="rounded-full bg-climbe-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-climbe-primary">
          PDF
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-bold text-climbe-secondary">Relatório #{report.id}</h4>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Contrato #{report.contractId} · Proposta #{report.proposalId}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={12} />
          <span className="text-[10px] font-bold">
            {report.sentAt
              ? format(new Date(report.sentAt), 'dd/MM/yyyy', { locale: ptBR })
              : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={viewLoadingId === report.id}
            onClick={() => void handlePdfAction(report)}
            aria-label={`Visualizar relatório ${report.id}`}
            className="rounded-xl p-2 text-muted-foreground transition hover:bg-climbe-primary/10 hover:text-climbe-primary disabled:opacity-50"
          >
            <Eye size={17} />
          </button>
          <button
            type="button"
            disabled={viewLoadingId === report.id}
            onClick={() => void handlePdfAction(report, true)}
            aria-label={`Baixar relatório ${report.id}`}
            className="rounded-xl p-2 text-muted-foreground transition hover:bg-climbe-primary/10 hover:text-climbe-primary disabled:opacity-50"
          >
            <Download size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  const isRootView = view === 'root';
  const hasReports = enrichedReports.length > 0;
  const hasFilteredFolders = filteredGroups.length > 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <BarChart3 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Análise</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-climbe-secondary">Relatórios</h1>
          <p className="max-w-2xl font-light text-muted-foreground">
            Relatórios organizados por empresa. Visualize ou baixe os PDFs anexados a cada contrato.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="shrink-0 rounded-2xl bg-climbe-primary px-6 py-6 font-black text-climbe-secondary shadow-lg shadow-climbe-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          ANEXAR RELATÓRIO PDF
        </Button>
      </div>

      {actionError && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-500">
          {actionError}
        </p>
      )}

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por empresa, contrato ou relatório..."
          className="pl-11 rounded-2xl border-border bg-card"
        />
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-climbe-primary" />
        </div>
      ) : !hasReports ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[40px] border border-border bg-card p-20 text-center shadow-sm">
          <FileText size={48} className="text-muted-foreground/30" />
          <h3 className="text-2xl font-bold text-climbe-secondary">Nenhum relatório anexado</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Anexe um arquivo PDF para que ele possa ser consultado por empresa.
          </p>
        </div>
      ) : isRootView ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pastas por empresa</p>
            <span className="rounded-full bg-climbe-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-climbe-primary">
              {filteredGroups.length} {filteredGroups.length === 1 ? 'empresa' : 'empresas'} ·{' '}
              {totalFilteredReports} {totalFilteredReports === 1 ? 'relatório' : 'relatórios'}
            </span>
          </div>

          {!hasFilteredFolders ? (
            <div className="py-16 text-center">
              <p className="text-lg font-bold text-climbe-secondary">Nenhuma pasta encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredGroups.map((group) => (
                <button
                  key={getGroupKey(group)}
                  type="button"
                  onClick={() => openFolder(group)}
                  className="flex flex-col items-center gap-4 rounded-[32px] border border-border bg-muted p-8 text-center transition-all hover:-translate-y-1 hover:border-climbe-primary/40 hover:bg-climbe-primary/10 hover:shadow-md"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-climbe-primary/10 text-climbe-primary">
                    <Folder size={32} />
                  </div>
                  <div className="min-w-0 w-full space-y-1">
                    <p className="truncate text-sm font-black text-climbe-secondary">
                      {group.enterpriseName}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {group.reports.length}{' '}
                      {group.reports.length === 1 ? 'relatório' : 'relatórios'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={goToRoot}
                className="font-black text-climbe-primary hover:underline"
              >
                Relatórios
              </button>
              <ChevronRight size={14} className="text-muted-foreground/50" />
              <span className="font-black text-climbe-secondary truncate max-w-[240px]">
                {selectedGroup?.enterpriseName ?? 'Pasta'}
              </span>
            </nav>
            <Button type="button" variant="outline" size="sm" onClick={goToRoot} className="gap-2 shrink-0">
              <ChevronLeft size={16} />
              Voltar
            </Button>
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Building2 className="text-climbe-primary" />
            <div>
              <h2 className="text-xl font-black text-climbe-secondary">
                {selectedGroup?.enterpriseName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {folderReports.length}{' '}
                {folderReports.length === 1 ? 'relatório' : 'relatórios'} nesta pasta
              </p>
            </div>
          </div>

          {folderReports.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum relatório corresponde à busca nesta pasta.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {folderReports.map(renderReportCard)}
            </div>
          )}
        </>
      )}

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} className="form-modal-shell max-w-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Upload de Relatório</h2>
            <p className="text-xs text-muted-foreground dark:text-slate-300">
              Selecione o contrato e anexe um arquivo em formato PDF.
            </p>
          </div>

          <form onSubmit={(e: FormEvent) => { e.preventDefault(); setUploadError(''); uploadMutation.mutate(); }} className="space-y-5">
            <div className="space-y-2">
              <Label className="form-field-label">Contrato</Label>
              <select
                required
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="form-field-select"
              >
                <option value="">Selecione um contrato...</option>
                {contracts.map((contract) => {
                  const proposal = proposalById.get(contract.proposalId);
                  const label = proposal?.enterpriseName
                    ? `${proposal.enterpriseName} — Contrato #${contract.id}`
                    : `Contrato #${contract.id} — Proposta #${contract.proposalId}`;
                  return (
                    <option key={contract.id} value={contract.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">Arquivo PDF</Label>
              <Input
                required
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="form-field-control file:mr-4 file:rounded-lg file:border-0 file:bg-climbe-primary file:px-3 file:py-1 file:text-xs file:font-black file:text-climbe-secondary"
              />
            </div>

            {uploadError && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500">
                {uploadError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploadMutation.isPending || !selectedContractId || !selectedFile}
                className="flex-1 rounded-xl bg-climbe-primary font-black text-climbe-secondary"
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
