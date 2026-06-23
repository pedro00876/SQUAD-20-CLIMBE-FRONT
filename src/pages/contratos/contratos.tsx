import {
  ScrollText,
  Plus,
  Calendar,
  Loader2,
  CheckCircle2,
  Eye,
  Download,
  PenLine,
  Building2,
  Search,
  Folder,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { contractService } from '@/services/contract.service';
import type {
  Contract,
  CreateContractRequest,
  EnrichedContract,
  ContractCompanyGroup,
} from '@/features/contracts/types';
import { proposalService, type Proposal } from '@/services/proposal.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

async function fetchAllContracts(): Promise<Contract[]> {
  const probe = await contractService.list(0, 1);
  const total = probe.totalElements;
  if (total === 0) return [];

  const pageSize = Math.min(total, 500);
  const first = await contractService.list(0, pageSize);
  let all = [...first.content];

  if (total > pageSize) {
    let page = 1;
    while (all.length < total) {
      const next = await contractService.list(page, pageSize);
      all = [...all, ...next.content];
      page += 1;
      if (next.content.length === 0) break;
    }
  }

  return all;
}

function getContractStatusLabel(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'DIGITALLY_SIGNED':
      return 'ASSINADO';
    case 'PENDING_SIGNATURE':
      return 'AGUARDANDO ASSINATURA';
    default:
      return status || 'ATIVO';
  }
}

function enrichContract(
  contract: Contract,
  proposalById: Map<number, Proposal>,
): EnrichedContract {
  const proposal = proposalById.get(contract.proposalId);
  return {
    ...contract,
    enterpriseId: proposal?.enterpriseId ?? 0,
    enterpriseName: proposal?.enterpriseName ?? UNKNOWN_ENTERPRISE_NAME,
  };
}

function sortContracts(contracts: EnrichedContract[]): EnrichedContract[] {
  return [...contracts].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return b.id - a.id;
  });
}

function getGroupKey(group: ContractCompanyGroup): number {
  return group.enterpriseId || -(group.contracts[0]?.proposalId ?? 0);
}

function groupContractsByCompany(
  contracts: EnrichedContract[],
): ContractCompanyGroup[] {
  const groups = new Map<number, ContractCompanyGroup>();

  for (const contract of contracts) {
    const key = contract.enterpriseId || -contract.proposalId;
    const existing = groups.get(key);
    if (existing) {
      existing.contracts.push(contract);
    } else {
      groups.set(key, {
        enterpriseId: contract.enterpriseId,
        enterpriseName: contract.enterpriseName,
        contracts: [contract],
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      contracts: sortContracts(group.contracts),
    }))
    .sort((a, b) =>
      a.enterpriseName.localeCompare(b.enterpriseName, 'pt-BR', {
        sensitivity: 'base',
      }),
    );
}

function matchesSearch(contract: EnrichedContract, term: string): boolean {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    contract.enterpriseName.toLowerCase().includes(q) ||
    String(contract.id).includes(q) ||
    String(contract.proposalId).includes(q) ||
    getContractStatusLabel(contract.status ?? undefined)
      .toLowerCase()
      .includes(q)
  );
}

function matchesGroup(group: ContractCompanyGroup, term: string): boolean {
  if (!term) return true;
  const q = term.toLowerCase();
  if (group.enterpriseName.toLowerCase().includes(q)) return true;
  return group.contracts.some((contract) => matchesSearch(contract, term));
}

export function ContratosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<EnrichedContract | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ExplorerView>('root');
  const [selectedGroupKey, setSelectedGroupKey] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateContractRequest>({
    proposalId: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: allContracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['contracts', 'all-for-grouping'],
    queryFn: fetchAllContracts,
  });

  const { data: proposalsPage } = useQuery({
    queryKey: ['proposals', 'all-for-contracts'],
    queryFn: () => proposalService.list(0, 500),
  });

  const proposalById = useMemo(() => {
    const map = new Map<number, Proposal>();
    for (const proposal of proposalsPage?.content ?? []) {
      map.set(proposal.id, proposal);
    }
    return map;
  }, [proposalsPage]);

  const enrichedContracts = useMemo(
    () => allContracts.map((contract) => enrichContract(contract, proposalById)),
    [allContracts, proposalById],
  );

  const allGroups = useMemo(
    () => groupContractsByCompany(enrichedContracts),
    [enrichedContracts],
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
        : allGroups.find((group) => getGroupKey(group) === selectedGroupKey) ??
          null,
    [allGroups, selectedGroupKey],
  );

  const folderContracts = useMemo(() => {
    if (!selectedGroup) return [];
    const term = debouncedSearch.trim();
    if (!term) return selectedGroup.contracts;
    return selectedGroup.contracts.filter((contract) =>
      matchesSearch(contract, term),
    );
  }, [selectedGroup, debouncedSearch]);

  const totalFilteredContracts = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.contracts.length, 0),
    [filteredGroups],
  );

  const goToRoot = () => {
    setView('root');
    setSelectedGroupKey(null);
  };

  const openFolder = (group: ContractCompanyGroup) => {
    setSelectedGroupKey(getGroupKey(group));
    setView('folder');
  };

  const createMutation = useMutation({
    mutationFn: contractService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setFormData({
        proposalId: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
      });
    },
  });

  const signMutation = useMutation({
    mutationFn: (contractId: number) =>
      contractService.update(contractId, { status: 'DIGITALLY_SIGNED' }),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      const enriched = enrichContract(updatedContract, proposalById);
      setSelectedContract(enriched);
    },
  });

  const approvedProposals = (proposalsPage?.content || []).filter(
    (p) => p.status === 'COMMERCIAL_PROPOSAL_APPROVED',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposalId) return;

    const proposal = approvedProposals.find(
      (p) => p.id === formData.proposalId,
    );

    createMutation.mutate(formData, {
      onSuccess: () => {
        notificationService.notifyCompliance({
          razaoSocial: proposal?.enterpriseName,
          cnpj: (proposal as Proposal & { cnpj?: string })?.cnpj,
          analista: proposal?.responsibleAnalystName,
          dataInicio: formData.startDate,
        });

        notificationService.sendEmail(
          (proposal as Proposal & { enterpriseEmail?: string })?.enterpriseEmail ||
            'contato@empresa.com',
          `Contrato disponível para assinatura — ${proposal?.enterpriseName}`,
          `Seu contrato foi gerado e está disponível para assinatura. Acesse o sistema para visualizar e assinar o documento.`,
        );
      },
    });
  };

  const isContractSigned = (contract?: Contract | null) => {
    return contract?.status?.toUpperCase() === 'DIGITALLY_SIGNED';
  };

  const getContractHtml = (contract: EnrichedContract) => {
    const companyName = contract.enterpriseName;
    const startDate = contract.startDate
      ? format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: ptBR })
      : '--';
    const endDate = contract.endDate
      ? format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: ptBR })
      : 'prazo indeterminado';
    const status = getContractStatusLabel(contract.status ?? undefined);

    return `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Contrato ${contract.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 48px; line-height: 1.6; }
            header { border-bottom: 3px solid #79C6C0; margin-bottom: 32px; padding-bottom: 18px; }
            h1 { font-size: 28px; margin: 0 0 8px; }
            .meta { color: #6b7280; font-size: 13px; }
            .box { border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin: 20px 0; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; font-weight: 700; }
            .value { font-weight: 700; margin-top: 4px; }
            .signature { margin-top: 72px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; }
            .line { border-top: 1px solid #111827; padding-top: 10px; text-align: center; font-size: 13px; }
            @media print { body { margin: 32px; } button { display: none; } }
          </style>
        </head>
        <body>
          <header>
            <h1>Contrato de Prestacao de Servicos</h1>
            <div class="meta">Contrato #${contract.id} | Proposta #${contract.proposalId} | Status: ${status}</div>
          </header>

          <section class="box">
            <div class="grid">
              <div>
                <div class="label">Contratante</div>
                <div class="value">${companyName}</div>
              </div>
              <div>
                <div class="label">Contratada</div>
                <div class="value">Climbe Investimentos</div>
              </div>
              <div>
                <div class="label">Inicio da vigencia</div>
                <div class="value">${startDate}</div>
              </div>
              <div>
                <div class="label">Termino</div>
                <div class="value">${endDate}</div>
              </div>
            </div>
          </section>

          <section>
            <p>
              Pelo presente instrumento, as partes identificadas acima formalizam a contratacao dos servicos
              vinculados a proposta comercial aprovada, observando as condicoes negociadas entre contratante
              e contratada.
            </p>
            <p>
              A assinatura digital registrada neste sistema representa a ciencia e o aceite das partes quanto
              ao andamento do contrato para a proxima etapa operacional.
            </p>
          </section>

          <section class="signature">
            <div class="line">Climbe Investimentos</div>
            <div class="line">${companyName}</div>
          </section>
        </body>
      </html>
    `;
  };

  const openContractDocument = (contract: EnrichedContract, print = false) => {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return;

    popup.document.open();
    popup.document.write(getContractHtml(contract));
    popup.document.close();

    if (print) {
      popup.onload = () => {
        popup.focus();
        popup.print();
      };
    }
  };

  const renderContractCard = (contract: EnrichedContract) => (
    <div
      key={contract.id}
      className="rounded-[32px] border border-border bg-background p-8 shadow-sm transition-all hover:shadow-md group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-climbe-primary/10 text-climbe-primary text-[10px] font-black uppercase tracking-widest rounded-full">
          <CheckCircle2 size={12} />
          {getContractStatusLabel(contract.status ?? undefined)}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-climbe-primary flex items-center justify-center text-climbe-secondary">
            <ScrollText size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-climbe-secondary italic">
              Contrato #{contract.id}
            </h4>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              PROPOSTA #{contract.proposalId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">
                Início
              </span>
            </div>
            <p className="text-xs font-bold text-climbe-secondary italic">
              {contract.startDate
                ? format(new Date(contract.startDate), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })
                : '--'}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">
                Término
              </span>
            </div>
            <p className="text-xs font-bold text-climbe-primary italic">
              {contract.endDate
                ? format(new Date(contract.endDate), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })
                : 'Indeterminado'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedContract(contract)}
            className="text-[10px] font-black text-climbe-secondary uppercase tracking-widest hover:text-climbe-primary transition-colors"
          >
            Visualizar/Assinar
          </button>
          <button
            type="button"
            onClick={() => openContractDocument(contract, true)}
            className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline"
          >
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );

  const isLoading = isLoadingContracts;
  const hasContracts = enrichedContracts.length > 0;
  const hasFilteredFolders = filteredGroups.length > 0;
  const isRootView = view === 'root';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <ScrollText size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Comercial
            </span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">
            Contratos
          </h1>
          <p className="text-muted-foreground font-light max-w-2xl">
            Gerencie todos os contratos firmados e acompanhe seus períodos de
            vigência.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-climbe-primary text-climbe-secondary font-black italic rounded-2xl px-6 py-6 shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all shrink-0"
        >
          <Plus size={20} className="mr-2" />
          CRIAR NOVO CONTRATO
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : !hasContracts ? (
        <div className="rounded-[40px] border border-border bg-card p-20 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-muted flex items-center justify-center text-muted-foreground/40">
            <ScrollText size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">
            Nenhum contrato formalizado
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Os contratos aparecerão aqui assim que forem gerados a partir de
            propostas aprovadas.
          </p>
        </div>
      ) : (
        <div className="rounded-[40px] border border-border bg-card shadow-sm p-8 md:p-10 space-y-8">
          {isRootView ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-xl">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por empresa, contrato ou proposta..."
                    className="pl-11 rounded-2xl border-border bg-background"
                  />
                </div>
                <span className="rounded-full bg-climbe-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-climbe-primary shrink-0">
                  {filteredGroups.length}{' '}
                  {filteredGroups.length === 1 ? 'empresa' : 'empresas'} ·{' '}
                  {totalFilteredContracts}{' '}
                  {totalFilteredContracts === 1 ? 'contrato' : 'contratos'}
                </span>
              </div>

              {!hasFilteredFolders ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-lg font-bold text-climbe-secondary italic">
                    Nenhuma empresa ou contrato encontrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar por outro nome de empresa, número de contrato
                    ou proposta.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredGroups.map((group) => {
                    const contractCount = group.contracts.length;
                    return (
                      <button
                        key={getGroupKey(group)}
                        type="button"
                        onClick={() => openFolder(group)}
                        className="flex flex-col items-center gap-4 rounded-[32px] border border-border bg-muted p-8 text-center transition-all hover:-translate-y-1 hover:border-climbe-primary/40 hover:bg-climbe-primary/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-climbe-primary/40"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-climbe-primary/10 text-climbe-primary">
                          <Folder size={32} />
                        </div>
                        <div className="space-y-1 min-w-0 w-full">
                          <p className="text-sm font-black italic text-climbe-secondary truncate">
                            {group.enterpriseName}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {contractCount}{' '}
                            {contractCount === 1 ? 'contrato' : 'contratos'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <nav
                  aria-label="Navegação de pastas"
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <button
                    type="button"
                    onClick={goToRoot}
                    className="font-black italic text-climbe-primary hover:underline"
                  >
                    Contratos
                  </button>
                  <ChevronRight size={14} className="text-muted-foreground/50" />
                  <span className="font-black italic text-climbe-secondary truncate max-w-[240px] sm:max-w-none">
                    {selectedGroup?.enterpriseName ?? 'Pasta'}
                  </span>
                </nav>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToRoot}
                  className="gap-2 shrink-0"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </Button>
              </div>

              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-climbe-primary/10 text-climbe-primary">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic text-climbe-secondary">
                    {selectedGroup?.enterpriseName}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {selectedGroup?.contracts.length ?? 0}{' '}
                    {(selectedGroup?.contracts.length ?? 0) === 1
                      ? 'contrato'
                      : 'contratos'}
                  </p>
                </div>
              </div>

              <div className="relative max-w-xl">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar contratos nesta pasta..."
                  className="pl-11 rounded-2xl border-border bg-background"
                />
              </div>

              {folderContracts.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <p className="text-lg font-bold text-climbe-secondary italic">
                    Nenhum contrato nesta pasta corresponde à busca
                  </p>
                  <Button type="button" variant="outline" onClick={goToRoot}>
                    Voltar para Contratos
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {folderContracts.map(renderContractCard)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="form-modal-shell max-w-lg"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">
              Formalizar Contrato
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-300">
              Selecione uma proposta aprovada para gerar o contrato.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="form-field-label">Proposta Aprovada</Label>
              <select
                required
                value={formData.proposalId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proposalId: Number(e.target.value),
                  })
                }
                className="form-field-select appearance-none"
              >
                <option value="">Selecione uma proposta...</option>
                {approvedProposals.map((proposal) => (
                  <option key={proposal.id} value={proposal.id}>
                    #{proposal.id} - {proposal.enterpriseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="form-field-label">Data de Início</Label>
              <Input
                type="date"
                required
                className="form-field-control"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-black uppercase tracking-widest text-climbe-primary hover:bg-muted dark:hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !formData.proposalId}
                className="flex-1 rounded-xl bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                {createMutation.isPending ? 'GERANDO...' : 'FINALIZAR CONTRATO'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedContract}
        onClose={() => setSelectedContract(null)}
      >
        {selectedContract && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">
                  Contrato para assinatura
                </p>
                <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">
                  Contrato #{selectedContract.id}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Visualize a minuta, baixe/imprima o PDF pelo navegador e
                  confirme a assinatura digital.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-climbe-primary/10 text-climbe-primary text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
                <CheckCircle2 size={12} />
                {getContractStatusLabel(selectedContract.status ?? undefined)}
              </span>
            </div>

            <div className="rounded-3xl border border-border bg-muted p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Empresa
                  </p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.enterpriseName}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Proposta vinculada
                  </p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    #{selectedContract.proposalId}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Inicio
                  </p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.startDate
                      ? format(
                          new Date(selectedContract.startDate),
                          'dd/MM/yyyy',
                          { locale: ptBR },
                        )
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Termino
                  </p>
                  <p className="text-sm font-bold text-climbe-secondary italic">
                    {selectedContract.endDate
                      ? format(
                          new Date(selectedContract.endDate),
                          'dd/MM/yyyy',
                          { locale: ptBR },
                        )
                      : 'Prazo indeterminado'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-4 text-xs text-muted-foreground leading-relaxed">
                Esta visualizacao gera uma minuta local com os dados do contrato
                cadastrado. A assinatura confirma o aceite no sistema e altera o
                status para <strong>DIGITALLY_SIGNED</strong>, liberando a
                proposta para a proxima etapa do fluxo.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => openContractDocument(selectedContract)}
                className="font-black uppercase tracking-widest text-[10px]"
              >
                <Eye size={16} className="mr-2" />
                Visualizar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => openContractDocument(selectedContract, true)}
                className="font-black uppercase tracking-widest text-[10px]"
              >
                <Download size={16} className="mr-2" />
                Baixar PDF
              </Button>
              <Button
                type="button"
                disabled={
                  signMutation.isPending || isContractSigned(selectedContract)
                }
                onClick={() => signMutation.mutate(selectedContract.id)}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl shadow-lg shadow-climbe-primary/20"
              >
                <PenLine size={16} className="mr-2" />
                {isContractSigned(selectedContract)
                  ? 'ASSINADO'
                  : signMutation.isPending
                    ? 'ASSINANDO...'
                    : 'ASSINAR'}
              </Button>
            </div>

            {signMutation.isError && (
              <p className="text-xs font-bold text-red-500">
                Nao foi possivel assinar o contrato. Verifique a API e tente
                novamente.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
