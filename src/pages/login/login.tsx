import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '@/features/auth/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routes } from '@/config/routes';
import { ASSETS } from '@/config/assets';
import { env } from '@/config/env';

const LOGO_BRANCA = ASSETS.logos.light;
const LOGO_PRETA = ASSETS.logos.dark;

export function LoginPage() {
  const { login, isLoading, isError, error } = useLogin();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const pendingApprovalError = (error as any)?.response?.status === 403
    && (error as any)?.response?.data?.message === 'PENDING_APPROVAL';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  const BrickPattern = () => {
    const rows = 6;
    const cols = 12;
    const opacities = [0.1, 0.2, 0.35, 0.55, 0.8, 1.0];

    return (
      <div className="absolute bottom-0 left-0 w-full p-8 grid grid-cols-12 gap-1.5 opacity-60">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="h-2 rounded-[1px] transition-all duration-1000"
              style={{
                backgroundColor: (rowIndex + colIndex) % 2 === 0 ? '#79C6C0' : '#3E3E3C',
                opacity: opacities[rows - 1 - rowIndex],
                transform: `translateX(${rowIndex * 6}px)`
              }}
            />
          ))
        ))}
      </div>
    );
  };

  const BarChart = () => {
    const bars = [35, 80, 55, 100, 75];
    return (
      <div className="flex items-end gap-5 h-40 mb-16 px-2">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-8 rounded-sm animate-bar"
            style={{
              height: `${height}%`,
              backgroundColor: i % 2 === 0 ? '#79C6C0' : '#3E3E3C',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-white lg:bg-climbe-secondary">
      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex flex-grow bg-climbe-secondary relative flex-col p-20 overflow-hidden">
        {/* Logo Section */}
        <div className="fade-down mb-16">
          <img
            src={LOGO_BRANCA}
            alt="Climbe"
            className="h-20 object-contain ml-[-8px]"
          />
          <p className="text-white/40 uppercase tracking-[0.5em] text-[9px] font-bold mt-1 ml-1">
            Gestão inteligente de contratos.
          </p>
        </div>

        {/* Headline Section */}
        <div className="relative z-10 max-w-2xl mt-auto mb-24">
          <h1 className="fade-up text-white text-7xl font-black leading-[1.05] mb-8 tracking-tighter">
            Acesse propostas,<br />
            documentos e reuniões <span className="text-climbe-primary underline decoration-climbe-primary/30 underline-offset-8">em um só lugar.</span>
          </h1>
          <BarChart />
        </div>

        {/* Textura de Tijolos */}
        <BrickPattern />
      </div>

      {/* PAINEL DIREITO */}
      <div className="w-full lg:w-[35%] lg:min-w-[500px] bg-white flex flex-col p-6 sm:p-8 justify-center fade-in shadow-2xl z-20">
        <div className="mb-6">
          <img
            src={LOGO_PRETA}
            alt="Climbe"
            className="h-12 object-contain mb-4"
          />
          <h2 className="text-climbe-secondary text-3xl font-black mb-1 tracking-tighter">Bem-vindo.</h2>
          <p className="text-gray-400 font-light text-sm">Faça login para gerenciar sua carteira.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">E-mail Corporativo</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary ml-1">Senha de Acesso</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {/* Mensagem de erro — Clean & Discrete */}
          {isError && (
            <div className="flex items-center gap-2.5 px-1 py-1 animate-in fade-in slide-in-from-top-1">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <p className="text-red-500 text-[11px] font-semibold uppercase tracking-widest">
                {pendingApprovalError ? 'Aguardando aprovação do CEO' : 'E-mail ou senha incorretos'}
              </p>
            </div>
          )}

          {pendingApprovalError && (
            <div className="px-1">
              <Link to="/primeiro-acesso" className="text-xs text-climbe-primary font-bold hover:underline underline-offset-4">
                Ir para primeiro acesso
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between py-1 px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 border-gray-100 rounded-lg text-climbe-primary focus:ring-climbe-primary/20 transition-all cursor-pointer bg-gray-50"
              />
              <span className="text-xs text-gray-400 font-medium group-hover:text-climbe-secondary transition-colors">Lembrar acesso</span>
            </label>
            <a href="#" className="text-xs text-climbe-primary font-bold hover:underline underline-offset-4">Esqueceu a senha?</a>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 shadow-none mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Validando...
              </span>
            ) : 'ENTRAR NO SISTEMA'}
          </Button>
        </form>

        <div className="mt-6 text-center border-t border-gray-50 pt-4">
          <p className="text-sm text-gray-400 font-light tracking-tight">
            Ainda não tem acesso? <Link to="/primeiro-acesso" className="text-climbe-primary font-bold hover:underline underline-offset-4">Primeiro Acesso</Link>
          </p>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-gray-300">
            <span className="bg-white px-8">Ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 shadow-none border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3"
          onClick={() => { window.location.href = `${env.apiUrl}/login/oauth2/authorization/google`; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
             <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
             <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
             <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
             <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <span className="text-gray-600 font-semibold text-sm">Continuar com Google</span>
        </Button>
      </div>
    </div>
  );
}
