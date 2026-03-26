import { BarChart3 } from 'lucide-react';

export function RelatoriosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <BarChart3 size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Análise</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Relatórios</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Analise o desempenho da sua empresa através de dados precisos e relatórios customizados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-climbe-secondary p-10 rounded-[40px] text-white space-y-6">
          <h4 className="text-xl font-bold italic tracking-tight">Crescimento Mensal</h4>
          <div className="h-48 flex items-end gap-3 px-2">
            {[40, 70, 45, 90, 65, 100].map((h, i) => (
              <div key={i} className={`flex-1 rounded-sm ${i === 5 ? 'bg-climbe-primary' : 'bg-white/10'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-xs text-white/40">Total Gerado:</span>
            <span className="text-climbe-primary font-black italic">R$ 145.200,00</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
           <h4 className="text-xl font-bold text-climbe-secondary italic tracking-tight">Principais KPIs</h4>
           <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="h-3 w-32 bg-gray-200 rounded-full" />
                  <div className="h-3 w-12 bg-climbe-primary rounded-full" />
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
