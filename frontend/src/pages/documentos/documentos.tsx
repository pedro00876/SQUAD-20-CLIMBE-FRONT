import { Files, FileText, Download, Trash2, Loader2, Plus, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, type Document } from '@/services/document.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DocumentosPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: docsPage, isLoading } = useQuery({
    queryKey: ['documents', page],
    queryFn: () => documentService.list(page, 12)
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleView = async (id: number) => {
    try {
      const url = await documentService.getViewUrl(id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao buscar URL de visualização', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

        <Button className="bg-climbe-primary text-climbe-secondary font-black italic rounded-2xl px-6 py-6 shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all shrink-0">
          <Plus size={20} className="mr-2" />
          UPLOAD DE ARQUIVO
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-climbe-primary animate-spin" />
        </div>
      ) : (docsPage?.content || []).length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200">
            <Files size={48} />
          </div>
          <h3 className="text-2xl font-bold text-climbe-secondary italic">Nenhum documento encontrado</h3>
          <p className="text-sm text-gray-400 max-w-xs">Faça upload de documentos para começar a organizar seu repositório.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {docsPage.content.map((doc: Document) => (
            <div key={doc.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="flex items-start justify-between mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-climbe-primary group-hover:bg-climbe-primary group-hover:text-climbe-secondary transition-colors">
                   <FileText size={24} />
                 </div>
                 <div className="flex gap-1">
                   <button 
                     onClick={() => handleView(doc.id)}
                     className="p-2 text-gray-400 hover:text-climbe-primary hover:bg-climbe-primary/5 rounded-xl transition-all"
                   >
                     <Download size={16} />
                   </button>
                   <button 
                     onClick={() => deleteMutation.mutate(doc.id)}
                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <h4 className="font-bold text-climbe-secondary italic truncate" title={doc.name}>{doc.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                     <Building2 size={10} className="text-gray-300" />
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{doc.enterpriseName}</p>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                      {doc.createdAt ? format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '--'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-full">
                      {doc.type}
                    </span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
