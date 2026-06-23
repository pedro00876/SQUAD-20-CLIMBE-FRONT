import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Building2, FileText, ScrollText, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { enterpriseService } from '@/services/enterprise.service';
import { proposalService } from '@/services/proposal.service';
import { contractService } from '@/services/contract.service';

type ResultType = 'empresa' | 'proposta' | 'contrato';

interface SearchResult {
  id: number;
  label: string;
  sublabel?: string;
  type: ResultType;
  route: string;
}

const TYPE_CONFIG: Record<ResultType, { icon: React.ComponentType<any>; color: string; label: string }> = {
  empresa:  { icon: Building2, color: 'text-blue-500',   label: 'Empresa' },
  proposta: { icon: FileText,  color: 'text-violet-500', label: 'Proposta' },
  contrato: { icon: ScrollText,color: 'text-indigo-500', label: 'Contrato' },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface GlobalSearchProps {
  onClose: () => void;
}

export function GlobalSearchModal({ onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    setLoading(true);

    Promise.all([
      enterpriseService.list(0, 50).catch(() => ({ content: [] })),
      proposalService.list(0, 50).catch(() => ({ content: [] })),
      contractService.list(0, 50).catch(() => ({ content: [] })),
    ]).then(([enterprises, proposals, contracts]) => {
      const r: SearchResult[] = [];

      (enterprises.content ?? [])
        .filter((e: any) =>
          e.tradeName?.toLowerCase().includes(q) ||
          e.legalName?.toLowerCase().includes(q) ||
          e.cnpj?.includes(q),
        )
        .slice(0, 4)
        .forEach((e: any) => r.push({
          id: e.id,
          label: e.tradeName || e.legalName,
          sublabel: `CNPJ: ${e.cnpj}`,
          type: 'empresa',
          route: `${routes.empresas}/${e.id}`,
        }));

      (proposals.content ?? [])
        .filter((p: any) =>
          p.enterpriseName?.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q),
        )
        .slice(0, 4)
        .forEach((p: any) => r.push({
          id: p.id,
          label: p.enterpriseName,
          sublabel: `Proposta #${p.id} · ${p.status}`,
          type: 'proposta',
          route: routes.propostas,
        }));

      (contracts.content ?? [])
        .filter((c: any) =>
          (c.enterpriseName || c.proposalEnterpriseName || '')
            .toLowerCase()
            .includes(q),
        )
        .slice(0, 3)
        .forEach((c: any) => r.push({
          id: c.id,
          label: c.enterpriseName || c.proposalEnterpriseName || `Contrato #${c.id}`,
          sublabel: `Contrato #${c.id}`,
          type: 'contrato',
          route: routes.contratos,
        }));

      setResults(r);
      setActiveIndex(0);
    }).finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.route);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const grouped = (Object.keys(TYPE_CONFIG) as ResultType[]).map(type => ({
    type,
    items: results.filter(r => r.type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl bg-card rounded-[28px] shadow-2xl border border-border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar empresa, proposta ou contrato..."
            className="flex-1 text-sm outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
          />
          <div className="flex items-center gap-2">
            {loading && <div className="w-3.5 h-3.5 border-2 border-climbe-primary border-t-transparent rounded-full animate-spin" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query.trim() && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <Search size={28} className="mx-auto mb-2 text-muted-foreground/30" />
              Comece a digitar para buscar...
            </div>
          )}
          {query.trim() && !loading && results.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              Nenhum resultado encontrado para <strong>"{query}"</strong>
            </div>
          )}
          {grouped.map(group => {
            const cfg = TYPE_CONFIG[group.type];
            const Icon = cfg.icon;
            return (
              <div key={group.type}>
                <div className="px-5 py-2 bg-muted/80 flex items-center gap-2">
                  <Icon size={12} className={cfg.color} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{cfg.label}</span>
                </div>
                {group.items.map(result => {
                  const globalIdx = results.indexOf(result);
                  const isActive = globalIdx === activeIndex;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${isActive ? 'bg-climbe-primary/10' : 'hover:bg-muted'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-climbe-primary text-climbe-secondary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{result.label}</p>
                        {result.sublabel && <p className="text-[10px] text-muted-foreground truncate">{result.sublabel}</p>}
                      </div>
                      <ArrowRight size={12} className={`shrink-0 transition-opacity ${isActive ? 'text-climbe-primary opacity-100' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Keyboard hint */}
        {results.length > 0 && (
          <div className="px-5 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground/60">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>Esc fechar</span>
          </div>
        )}
      </motion.div>
      <div className="fixed inset-0 bg-black/30 -z-10 backdrop-blur-sm" />
    </div>
  );
}
