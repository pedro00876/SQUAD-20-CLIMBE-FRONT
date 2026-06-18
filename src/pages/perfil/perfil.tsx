import { User, Mail, Shield } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PerfilPage() {
  const { user } = useAuthContext();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <User size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configurações</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Meu Perfil</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Gerencie suas informações pessoais e preferências de conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
               <Avatar initials={getInitials(user?.name || 'US')} className="w-32 h-32 text-4xl ring-8 ring-climbe-primary/5 shadow-xl shadow-climbe-secondary/5" />
               <div className="absolute bottom-2 right-2 w-8 h-8 bg-climbe-primary rounded-2xl border-4 border-white flex items-center justify-center text-climbe-secondary shadow-lg">
                  <CheckCircle2 size={16} />
               </div>
            </div>
            
            <h2 className="text-2xl font-black text-climbe-secondary italic tracking-tight">{user?.name}</h2>
            <p className="text-climbe-primary font-black uppercase tracking-[0.2em] text-[10px] mt-1">{user?.role}</p>
            
            <div className="w-full h-[1px] bg-gray-50 my-8"></div>
            
            <div className="w-full space-y-4">
               <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={16} className="text-climbe-primary" />
                  <span className="text-sm font-medium">{user?.email}</span>
               </div>
               <div className="flex items-center gap-3 text-gray-400">
                  <Shield size={16} className="text-climbe-primary" />
                  <span className="text-sm font-medium">Status: Ativo</span>
               </div>
            </div>

            <Button className="w-full mt-8 bg-gray-50 text-climbe-secondary hover:bg-climbe-primary/10 hover:text-climbe-primary transition-all font-bold rounded-2xl py-6">
               ALTERAR FOTO
            </Button>
          </div>
        </div>

        {/* Details Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-bold text-climbe-secondary italic mb-6">Informações Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Cargo Atual</p>
                    <p className="text-sm font-bold text-climbe-secondary italic">{user?.role}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Departamento</p>
                    <p className="text-sm font-bold text-climbe-secondary italic">Comercial & Vendas</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Data de Cadastro</p>
                    <p className="text-sm font-bold text-climbe-secondary italic">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                 </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-lg font-bold text-climbe-secondary italic mb-6">Segurança</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-climbe-primary shadow-sm">
                          <Shield size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-climbe-secondary italic">Autenticação em duas etapas</p>
                          <p className="text-[10px] text-gray-400">Adicione uma camada extra de segurança à sua conta.</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline">Configurar</button>
                 </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-50 flex justify-end">
               <Button className="bg-climbe-secondary text-white font-black italic rounded-2xl px-10 py-6">
                  SALVAR ALTERAÇÕES
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
