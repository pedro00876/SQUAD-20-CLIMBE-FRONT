import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, CheckCircle, Clock, ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import { userService } from '@/features/usuarios/services';
import type { User } from '@/features/usuarios/types';
import { Button } from '@/components/ui/button';
import { FilterChips, type FilterChip } from '@/components/ui/FilterChips';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { toast } from 'sonner';

type StatusFilter = 'TODOS' | 'ATIVOS' | 'PENDENTES';

const AVAILABLE_ROLES = [
  { value: 'CEO',             label: 'CEO' },
  { value: 'CMO',             label: 'CMO' },
  { value: 'CSO',             label: 'CSO' },
  { value: 'CFO',             label: 'CFO' },
  { value: 'COMPLIANCE',      label: 'Compliance' },
  { value: 'CONTADOR',        label: 'Contador' },
  { value: 'ANALISTA_CHEFE',  label: 'Analista Chefe' },
  { value: 'ANALISTA_SENIOR', label: 'Analista Sênior' },
  { value: 'ANALISTA',        label: 'Analista' },
];

function isUserPending(user: User) {
  const status = user.status?.toUpperCase();
  return (
    status === 'PENDING' ||
    status === 'PENDENTE' ||
    status === 'AGUARDANDO_APROVACAO' ||
    status === 'AGUARDANDO'
  );
}

function isUserActive(user: User) {
  const status = user.status?.toUpperCase();
  return user.active === true || status === 'ATIVO' || status === 'ACTIVE';
}

function needsApproval(user: User) {
  return !isUserActive(user);
}

// Inline approval row for pending users
function PendingUserRow({
  user,
  onApprove,
  onReject,
  isLoading,
}: {
  user: User;
  onApprove: (id: number, role: string) => void;
  onReject: (id: number) => void;
  isLoading: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState(user.role ?? '');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
          {user.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h5 className="text-sm font-bold text-climbe-secondary italic truncate">{user.fullName}</h5>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Role picker */}
        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="text-xs rounded-xl border border-amber-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-climbe-primary/20 appearance-none"
          disabled={isLoading}
        >
          <option value="">Selecionar papel...</option>
          {AVAILABLE_ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <button
          disabled={isLoading || !selectedRole}
          onClick={() => onApprove(user.id, selectedRole)}
          className="flex items-center gap-1.5 px-4 py-2 bg-climbe-primary text-climbe-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Aprovar acesso"
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Aprovar
        </button>
        <button
          disabled={isLoading}
          onClick={() => onReject(user.id)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 border border-red-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          title="Recusar acesso"
        >
          <X size={12} />
          Recusar
        </button>
      </div>
    </div>
  );
}

export function UsuariosPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => userService.listUsers(page, pageSize),
  });

  const { data: pendingPage } = useQuery({
    queryKey: ['users-pending'],
    queryFn: () => userService.listPending(0, 20),
  });

  const pendingUsers: User[] = pendingPage?.content ?? [];

  const approveMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => userService.approveUser(id, role),
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-pending'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Erro ao aprovar usuário.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success('Acesso recusado.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-pending'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Erro ao recusar usuário.');
    },
  });

  const allUsers: User[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSearching = search.trim().length > 0;
  const canGoBack = !isSearching && page > 0;
  const canGoForward = !isSearching && page + 1 < totalPages;

  const filtered = allUsers.filter(user => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [user.fullName, user.email, user.role, user.status].some(v => v?.toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'ATIVOS' && isUserActive(user)) ||
      (statusFilter === 'PENDENTES' && needsApproval(user));
    return matchesSearch && matchesStatus;
  });

  const filterChips: FilterChip<StatusFilter>[] = [
    { value: 'TODOS',     label: 'Todos',    count: allUsers.length },
    { value: 'ATIVOS',    label: 'Ativos',   count: allUsers.filter(isUserActive).length },
    { value: 'PENDENTES', label: 'Pendentes', count: allUsers.filter(needsApproval).length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-climbe-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-[32px] border border-red-100">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-red-900 font-bold">Erro ao carregar usuários</h3>
        <p className="text-red-600 text-sm">Verifique sua conexão com o backend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Users size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Usuários</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Administre os acessos e aprove as solicitações de novos colaboradores.
        </p>
      </div>

      {/* Pending section */}
      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              Aguardando Aprovação ({pendingUsers.length})
            </span>
          </div>
          {pendingUsers
        .filter((user) => !allUsers.some((u) => u.id === user.id))
        .map((user) => (
            <PendingUserRow
              key={user.id}
              user={user}
              onApprove={(id, role) => approveMutation.mutate({ id, role })}
              onReject={(id) => rejectMutation.mutate(id)}
              isLoading={approveMutation.isPending || rejectMutation.isPending}
            />
          ))}
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou cargo..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full max-w-md px-5 py-3 bg-gray-50 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-climbe-primary/10 outline-none"
          />
          <FilterChips chips={filterChips} active={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {filtered.map((user: User) => {
              const approvable = needsApproval(user);

              if (approvable) {
                return (
                  <PendingUserRow
                    key={user.id}
                    user={user}
                    onApprove={(id, role) => approveMutation.mutate({ id, role })}
                    onReject={(id) => rejectMutation.mutate(id)}
                    isLoading={approveMutation.isPending || rejectMutation.isPending}
                  />
                );
              }

              return (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-climbe-primary/10 text-climbe-secondary">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-climbe-secondary italic">{user.fullName}</h5>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={user.role ?? ''} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle size={11} />
                      Ativo
                    </span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm italic">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-xs text-gray-400">Página {page + 1} de {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!canGoBack} onClick={() => setPage(p => Math.max(0, p - 1))}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={!canGoForward} onClick={() => setPage(p => p + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
