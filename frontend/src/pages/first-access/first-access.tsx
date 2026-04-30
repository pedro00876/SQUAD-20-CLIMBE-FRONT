import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequestAccess } from '@/features/auth/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routes } from '@/config/routes';
import { ASSETS } from '@/config/assets';

export function FirstAccessPage() {
  const [email, setEmail] = useState('');
  const { requestAccess, isLoading, isSuccess, isError, error } = useRequestAccess();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  
  const LOGO_PRETA = ASSETS.logos.dark;
  const LOGO_BRANCA = ASSETS.logos.light;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestAccess(email);
  };

  if (isSuccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="flex justify-center">
            <img src={LOGO_PRETA} alt="Climbe" className="h-16 object-contain" />
          </div>
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-climbe-secondary tracking-tighter">Solicitação Enviada</h1>
            <p className="text-gray-500 font-light">
              Sua solicitação de acesso para <span className="font-bold text-climbe-secondary">{email}</span> foi enviada com sucesso.
            </p>
            <p className="text-sm text-gray-400">
              Você receberá um e-mail assim que sua conta for aprovada pelos administradores.
            </p>
          </div>
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full h-12 border-gray-200"
              onClick={() => navigate(isAuthenticated ? routes.pendingApproval : routes.login)}
            >
              {isAuthenticated ? 'IR PARA AGUARDANDO APROVAÇÃO' : 'VOLTAR PARA O LOGIN'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-white lg:bg-climbe-secondary">
      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex flex-grow bg-climbe-secondary relative flex-col p-20 overflow-hidden">
        <div className="fade-down mb-16">
          <img src={LOGO_BRANCA} alt="Climbe" className="h-20 object-contain ml-[-8px]" />
          <p className="text-white/40 uppercase tracking-[0.5em] text-[10px] font-bold mt-1 ml-1">
            Gestão inteligente de contratos.
          </p>
        </div>
        <div className="relative z-10 max-w-2xl mt-auto mb-24">
          <h1 className="fade-up text-white text-7xl font-black leading-[1.05] mb-8 tracking-tighter">
            Primeiro<br />
            acesso ao <span className="text-climbe-primary underline decoration-climbe-primary/30 underline-offset-8">sistema.</span>
          </h1>
          <p className="text-white/60 text-lg font-light max-w-lg">
            Informe seu e-mail corporativo para solicitar sua conta de acesso à plataforma Climbe.
          </p>
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div className="w-full lg:w-[35%] lg:min-w-[500px] bg-white flex flex-col p-6 sm:p-8 justify-center fade-in shadow-2xl z-20">
        <div className="mb-8 text-center lg:text-left">
          <img src={LOGO_PRETA} alt="Climbe" className="h-10 object-contain mb-6 lg:mx-0 mx-auto" />
          <h2 className="text-climbe-secondary text-3xl font-black mb-2 tracking-tighter">Primeiro Acesso.</h2>
          <p className="text-gray-400 font-light text-sm">Insira seu e-mail para solicitar aprovação.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">E-mail Corporativo</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
              className="h-12"
            />
          </div>

          {isError && (
            <div className="flex items-center gap-2.5 px-1 py-1 animate-in fade-in slide-in-from-top-1">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <p className="text-red-500 text-[11px] font-semibold uppercase tracking-widest">
                {error && (error as any).response?.data?.message 
                  ? (error as any).response.data.message 
                  : 'Falha ao enviar solicitação. Tente novamente.'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 shadow-none"
            disabled={isLoading}
          >
            {isLoading ? 'ENVIANDO SOLICITAÇÃO...' : 'SOLICITAR ACESSO'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-sm text-gray-400 font-light tracking-tight">
            Já tem uma conta aprovada? <Link to={routes.login} className="text-climbe-primary font-bold hover:underline underline-offset-4">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
