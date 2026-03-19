import { useState } from 'react';
import { useLogin } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LOGO_BRANCA = '/assets/logos/Marca Climbe-03.png';
const LOGO_PRETA = '/assets/logos/Marca Climbe-01.png';

export function LoginPage() {
  const { login, isLoading, isError } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

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
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* PAINEL ESQUERDO */}
      <div className="flex-grow bg-climbe-secondary relative flex flex-col p-20 overflow-hidden">
        {/* Logo Section */}
        <div className="fade-down mb-20">
          <img 
            src={LOGO_BRANCA} 
            alt="Climbe" 
            className="h-12 object-contain"
          />
          <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold mt-4 ml-1">
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
      <div className="w-[35%] min-w-[500px] bg-white flex flex-col p-20 justify-center fade-in shadow-2xl z-20 overflow-y-auto custom-scrollbar">
        <div className="mb-14">
          <img 
            src={LOGO_PRETA} 
            alt="Climbe" 
            className="h-10 object-contain mb-8"
          />
          <h2 className="text-climbe-secondary text-5xl font-black mb-4 tracking-tighter">Bem-vindo.</h2>
          <p className="text-gray-400 font-light text-lg">Faça login para gerenciar sua carteira.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
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

          <div className="space-y-3">
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
                E-mail ou senha incorretos
              </p>
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
            className="w-full h-16 shadow-none"
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

        <div className="mt-12 text-center border-t border-gray-50 pt-10">
          <p className="text-sm text-gray-400 font-light tracking-tight">
            Ainda não tem acesso? <a href="#" className="text-climbe-primary font-bold hover:underline underline-offset-4">Solicitar conta</a>
          </p>
        </div>

        <div className="relative my-14 hidden">
          {/* Oculto para ficar mais clear conforme solicitado */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-gray-300">
            <span className="bg-white px-8">Métodos Alternativos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
