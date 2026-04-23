import { Files } from 'lucide-react';

export function DocumentosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Files size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Repositório</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Documentos</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Centralize todos os arquivos, contratos e documentos importantes da sua empresa.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {['Contratos', 'Financeiro', 'RH', 'Jurídico'].map((folder) => (
          <div key={folder} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-climbe-primary/30 hover:shadow-xl hover:shadow-climbe-primary/5 transition-all group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-climbe-primary mb-6 group-hover:bg-climbe-primary group-hover:text-climbe-secondary transition-colors">
              <Files size={24} />
            </div>
            <h4 className="font-bold text-climbe-secondary italic mb-1">{folder}</h4>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">12 Arquivos</p>
          </div>
        ))}
      </div>
    </div>
  );
}
