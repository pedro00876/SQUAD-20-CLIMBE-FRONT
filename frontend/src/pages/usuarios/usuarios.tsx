import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { userService } from '@/features/usuarios/services';
import type { User } from '@/features/usuarios/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function UsuariosPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: () => userService.listUsers(page, 10),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => userService.approveUser(id),
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Erro ao aprovar usuário.');
    }
  });

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
    <div className="space-y-8">
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

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full max-w-md px-6 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-climbe-primary/10 outline-none"
          />
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Página {page + 1} de {data?.totalPages || 1}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page + 1 >= (data?.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {data?.content.map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-climbe-primary/10 flex items-center justify-center text-climbe-secondary font-black text-sm">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-climbe-secondary italic">{user.fullName}</h5>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{user.cargo?.nome || 'Sem Cargo'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {user.active ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle size={12} />
                      Ativo
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Clock size={12} />
                      Pendente
                    </div>
                  )}

                  {!user.active && (
                    <Button 
                      size="sm" 
                      className="h-8 text-[10px] font-black"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                    >
                      APROVAR ACESSO
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {data?.content.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm italic">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
