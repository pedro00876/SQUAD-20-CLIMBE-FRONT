import { LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visão Geral</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Dashboard</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Bem-vindo ao painel de controle. Aqui você tem uma visão completa de suas propostas, contratos e reuniões.
        </p>
      </div>

      {/* Grid de Cards (Esqueleto) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-climbe-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-climbe-primary group-hover:text-climbe-secondary transition-colors italic font-black">
              0{i}
            </div>
            <div className="h-4 w-24 bg-gray-50 rounded-full mb-3" />
            <div className="h-4 w-32 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Tabela de Exemplo (Esqueleto) */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-climbe-secondary tracking-tight italic">Atividades Recentes</h3>
          <button className="text-xs text-climbe-primary font-bold hover:underline">Ver tudo</button>
        </div>
        <div className="p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50" />
                <div className="space-y-1">
                  <div className="h-4 w-40 bg-gray-100 rounded-full" />
                  <div className="h-3 w-24 bg-gray-50 rounded-full" />
                </div>
              </div>
              <div className="h-6 w-20 bg-climbe-primary/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
