import { FileText } from 'lucide-react';

export function PropostasPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <FileText size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comercial</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Propostas</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Acompanhe o status de todas as propostas enviadas e em negociação.
        </p>
      </div>

      <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
          <FileText size={40} />
        </div>
        <h3 className="text-xl font-bold text-climbe-secondary italic">Nenhuma proposta ativa</h3>
        <p className="text-sm text-gray-400 max-w-xs">Clique no botão abaixo para criar sua primeira proposta comercial.</p>
        <button className="px-8 py-4 bg-climbe-primary text-climbe-secondary font-black rounded-2xl shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all italic text-sm mt-4">CRIAR PROPOSTA</button>
      </div>
    </div>
  );
}
