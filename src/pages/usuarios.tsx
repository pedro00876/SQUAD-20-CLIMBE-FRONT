import { Users } from 'lucide-react';

export function UsuariosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Users size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Usuários</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Administre os acessos e permissões dos usuários do sistema.
        </p>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full max-w-md px-6 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-climbe-primary/10 outline-none"
          />
        </div>
        <div className="p-8">
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-climbe-primary/20 flex items-center justify-center text-climbe-secondary font-black text-xs">U{i}</div>
                    <div>
                      <h5 className="text-sm font-bold text-climbe-secondary italic">Usuário de Teste {i}</h5>
                      <p className="text-xs text-gray-400">usuario{i}@climbe.com.br</p>
                    </div>
                 </div>
                 <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">Ativo</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
