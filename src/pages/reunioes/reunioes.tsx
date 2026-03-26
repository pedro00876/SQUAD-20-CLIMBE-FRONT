import { Calendar } from 'lucide-react';

export function ReunioesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <Calendar size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agenda</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Reuniões</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Acompanhe seus próximos compromissos e agende novas reuniões com parceiros.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          {[18, 19, 20, 21, 22, 23, 24].map((day) => (
            <div key={day} className={`min-w-[80px] h-24 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${day === 19 ? 'bg-climbe-primary text-climbe-secondary shadow-lg shadow-climbe-primary/20 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
              <span className="text-[10px] font-black uppercase tracking-tighter">Mar</span>
              <span className="text-2xl font-black italic">{day}</span>
            </div>
          ))}
        </div>
        <div className="space-y-6">
           <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-climbe-primary flex items-center justify-between">
             <div className="space-y-1">
               <h4 className="font-bold text-climbe-secondary italic">Apresentação de Resultados</h4>
               <p className="text-xs text-gray-400">14:30 - 15:30 • Google Meet</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-climbe-secondary" />
           </div>
        </div>
      </div>
    </div>
  );
}
