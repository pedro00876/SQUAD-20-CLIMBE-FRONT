import { useState } from 'react';
import { ScrollText, Upload, User, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StageContratoProps {
  empresa: any;
  canCreate: boolean; // COMPLIANCE, ADMIN
  canAssignAnalyst: boolean; // APROVADOR, SENIOR, ADMIN
  onConcluir: (data: any) => void;
  users: any[]; // Lista de usuários para o select de analista
}

export function StageContrato({ empresa, canCreate, canAssignAnalyst, onConcluir, users }: StageContratoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [analistaId, setAnalistaId] = useState('');
  const [isAssinado, setIsAssinado] = useState(false);
  const [contratoCriado, setContratoCriado] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setContratoCriado(true);
  };

  const handleFinalize = () => {
    onConcluir({ file, dataInicio, analistaId, isAssinado });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <ScrollText className="shrink-0" />
        <p className="font-medium mt-0.5">
          Proposta aprovada! O Compliance deve gerar o contrato, colher a assinatura e o Aprovador deve elencar o Analista responsável.
        </p>
      </div>

      {!contratoCriado ? (
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              id="contrato-upload"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={!canCreate}
            />
            <label htmlFor="contrato-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <Upload className="text-climbe-primary w-8 h-8" />
              </div>
              <div>
                <span className="text-lg font-bold text-climbe-secondary block">
                  {file ? file.name : "Fazer Upload do Contrato"}
                </span>
                {!file && <span className="text-sm text-gray-400">Clique para selecionar o PDF do contrato</span>}
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Vigência Inicial
              </Label>
              <Input 
                type="date" 
                required 
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                disabled={!canCreate}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Analista Responsável
              </Label>
              <select 
                required
                value={analistaId}
                onChange={e => setAnalistaId(e.target.value)}
                disabled={!canAssignAnalyst && !canCreate}
                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20 appearance-none"
              >
                <option value="">Selecione um analista...</option>
                <option value="1">João Analista</option>
                <option value="2">Maria Analista</option>
                {/* Aqui seria feito um map em `users` vindo das props */}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input 
              type="checkbox" 
              id="assinado" 
              checked={isAssinado}
              onChange={e => setIsAssinado(e.target.checked)}
              disabled={!canCreate}
              className="w-5 h-5 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
            />
            <label htmlFor="assinado" className="text-sm font-medium text-climbe-secondary cursor-pointer">
              O contrato já foi assinado por todas as partes
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button 
              type="submit"
              disabled={!canCreate || !file || !dataInicio || !analistaId || !isAssinado}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              FINALIZAR CONTRATO
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black italic text-green-700">Contrato Vigente</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto">
              O contrato foi assinado e o analista responsável foi notificado. O fluxo de análise documental já pode iniciar.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleFinalize}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              INICIAR ETAPA DE DOCUMENTAÇÃO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
