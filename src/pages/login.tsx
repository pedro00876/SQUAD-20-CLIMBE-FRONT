import { useState } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for login will go here
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
      <div className="flex-grow bg-[#1E1F1C] relative flex flex-col p-16 overflow-hidden">
        {/* Logo Section */}
        <div className="fade-down flex flex-col gap-1 mb-16">
          <div className="flex items-center">
            <span className="text-white text-5xl font-black lowercase tracking-tighter">climb</span>
            <div className="flex flex-col gap-[4px] ml-3">
              <div className="h-1 bg-[#79C6C0] rounded-full" style={{ width: '18px' }}></div>
              <div className="h-1 bg-[#79C6C0] rounded-full" style={{ width: '26px' }}></div>
              <div className="h-1 bg-[#79C6C0] rounded-full" style={{ width: '36px' }}></div>
            </div>
          </div>
          <p className="text-white/45 uppercase tracking-[0.4em] text-[11px] font-light">
            Gerencie contratos com total segurança.
          </p>
        </div>

        {/* Headline Section */}
        <div className="relative z-10 max-w-2xl mt-auto mb-24">
          <h1 className="fade-up text-white text-6xl font-black leading-[1.05] mb-8">
            Acesse propostas,<br />
            documentos e reuniões <span className="text-[#79C6C0]">em um só lugar.</span>
          </h1>
          {/* <p className="fade-up delay-150 text-white/40 text-xl font-light leading-relaxed mb-16 max-w-lg">
            Acesse sua carteira e tome decisões com segurança.
          </p> */}

          <BarChart />
        </div>

        {/* Textura de Tijolos */}
        <BrickPattern />
      </div>

      {/* PAINEL DIREITO */}
      <div className="w-[36%] min-w-[440px] bg-white flex flex-col p-16 justify-center fade-in shadow-2xl z-20">
        <div className="w-10 h-1 bg-[#79C6C0] rounded-full mb-12"></div>

        <div className="mb-12">
          <h2 className="text-[#1E1F1C] text-4xl font-bold mb-3 tracking-tight">Acesse o sistema</h2>
          <p className="text-gray-400 font-light text-base">Climbe · Gestão de Contratos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#1E1F1C]">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-5 py-4 bg-[#F4F7F9] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#79C6C0]/50 transition-all font-light text-sm placeholder:text-gray-300"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#1E1F1C]">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-[#F4F7F9] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#79C6C0]/50 transition-all font-light text-sm placeholder:text-gray-300"
              required
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 border-gray-200 rounded text-[#79C6C0] focus:ring-[#79C6C0] transition-colors"
              />
              <span className="text-xs text-gray-400 font-light group-hover:text-gray-600 transition-colors">Lembrar de mim</span>
            </label>
            <a href="#" className="text-xs text-[#79C6C0] font-semibold hover:underline underline-offset-4">Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-[#79C6C0] text-white font-bold uppercase tracking-[0.2em] text-sm rounded-xl shadow-xl shadow-[#79C6C0]/30 hover:bg-[#68B4AE] transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400 font-light">
            Não tem uma conta? <a href="#" className="text-[#79C6C0] font-bold hover:underline underline-offset-4">Inscrever-se</a>
          </p>
        </div>

        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
            <span className="bg-white px-6">ou entre com</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center py-4 border border-gray-100 rounded-2xl hover:border-[#79C6C0] hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="flex-1 flex items-center justify-center py-4 border border-gray-100 rounded-2xl hover:border-[#79C6C0] hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.248h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button className="flex-1 flex items-center justify-center py-4 border border-gray-100 rounded-2xl hover:border-[#79C6C0] hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5 fill-black" viewBox="0 0 384 512">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.1-205.8c15.2-18.7 25.5-44.6 22.7-70.4-22.4 1.1-49.5 16.3-65.1 34.6-12.7 14.8-24 41-21.2 65.9 25 1.7 48.9-12.3 63.6-30.1z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
