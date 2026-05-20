import { Bell } from 'lucide-react';

export function NotificacoesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Bell size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Social</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Notificações</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Fique por dentro de todas as atualizações de propostas, reuniões e interações de usuários.
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-start gap-4 hover:shadow-lg hover:shadow-climbe-primary/5 transition-all cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${i === 1 ? 'bg-climbe-primary/10 text-climbe-primary' : 'bg-gray-50 text-gray-400'}`}>
              <Bell size={20} />
            </div>
            <div className="flex-1 space-y-1 py-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-climbe-secondary text-sm italic">Nova Proposta Recebida</h5>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">2h atrás</span>
              </div>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                A empresa Parceira {i} enviou uma nova proposta para o projeto de consultoria técnica.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
