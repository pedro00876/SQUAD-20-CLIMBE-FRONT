import { BarChart3, FileText, Loader2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportService, type Report } from '@/services/report.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosPage() {
  const { data: reportsPage, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.list(0, 100)
  });

  return (
    <div className="space-y-8 pb-12">
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

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : (reportsPage?.content || []).length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <BarChart3 size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">Nenhum relatório gerado</h3>
          <p className="text-sm text-gray-400 max-w-xs">Os relatórios técnicos e comerciais aparecerão aqui assim que forem processados pelo sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportsPage.content.map((report: Report) => (
            <div key={report.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-climbe-secondary text-white flex items-center justify-center mb-6">
                 <FileText size={24} />
               </div>
               
               <div className="space-y-2">
                 <h4 className="text-lg font-bold text-climbe-secondary italic">{report.name}</h4>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TIPO: {report.type}</p>
                 <p className="text-sm text-gray-500 line-clamp-2">{report.content}</p>
               </div>

               <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">
                      {report.createdAt ? format(new Date(report.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '--'}
                    </span>
                  </div>
                  <button className="text-[10px] font-black text-climbe-primary uppercase tracking-widest hover:underline">Ver Detalhes</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
