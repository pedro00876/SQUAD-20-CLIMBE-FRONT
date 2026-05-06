import { Building2 } from 'lucide-react';

export function EmpresasPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Building2 size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gerenciamento</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Empresas</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Visualize e gerencie todas as empresas parceiras e clientes cadastrados no sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 rounded-2xl bg-climbe-secondary flex items-center justify-center text-white font-black italic">
                 E{i}
               </div>
               <div>
                 <h4 className="font-bold text-climbe-secondary italic">Empresa Parceira {i}</h4>
                 <p className="text-xs text-gray-400">CNPJ: 00.000.000/0001-0{i}</p>
               </div>
             </div>
             <div className="space-y-3">
               <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                 <div className="h-full bg-climbe-primary w-2/3" />
               </div>
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Contratos Ativos: 12</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
