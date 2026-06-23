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
        <h1 className="text-4xl font-black text-foreground tracking-tighter">Meu Perfil</h1>
        <p className="text-muted-foreground font-light max-w-2xl">
          Gerencie suas informações pessoais e preferências de conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-[40px] border border-border shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
               <Avatar initials={getInitials(user?.name || 'US')} className="w-32 h-32 text-4xl ring-8 ring-climbe-primary/5 shadow-xl shadow-climbe-secondary/5" />
               <div className="absolute bottom-2 right-2 w-8 h-8 bg-climbe-primary rounded-2xl border-4 border-card flex items-center justify-center text-climbe-secondary shadow-lg">
                  <CheckCircle2 size={16} />
               </div>
            </div>
            
            <h2 className="text-2xl font-black text-foreground tracking-tight">{user?.name}</h2>
            <p className="text-climbe-primary font-black uppercase tracking-[0.2em] text-[10px] mt-1">{user?.role}</p>
            
            <div className="w-full h-[1px] bg-border my-8"></div>
            
            <div className="w-full space-y-4">
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail size={16} className="text-climbe-primary" />
                  <span className="text-sm font-medium">{user?.email}</span>
               </div>
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield size={16} className="text-climbe-primary" />
                  <span className="text-sm font-medium">Status: Ativo</span>
               </div>
            </div>

            <Button className="w-full mt-8 bg-muted text-foreground hover:bg-climbe-primary/10 hover:text-climbe-primary transition-all font-bold rounded-2xl py-6">
               ALTERAR FOTO
            </Button>
          </div>
        </div>

        {/* Details Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-10 rounded-[40px] border border-border shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">Informações Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cargo Atual</p>
                    <p className="text-sm font-bold text-foreground">{user?.role}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Departamento</p>
                    <p className="text-sm font-bold text-foreground">Comercial &amp; Vendas</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Data de Cadastro</p>
                    <p className="text-sm font-bold text-foreground">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                 </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-6">Segurança</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-climbe-primary shadow-sm">
                          <Shield size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground">Autenticação em duas etapas</p>
                          <p className="text-[10px] text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline">Configurar</button>
                 </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border flex justify-end">
               <Button className="bg-foreground text-background font-black rounded-2xl px-10 py-6 hover:bg-foreground/90">
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
