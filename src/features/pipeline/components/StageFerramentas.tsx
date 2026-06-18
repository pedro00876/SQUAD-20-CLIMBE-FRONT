import { useState } from 'react';
import { ToggleLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageFerramentasProps {
  empresa: any;
  canEdit: boolean;
  onConcluir: (data: any) => void;
}

interface Ferramenta {
  id: string;
  nome: string;
  descricao: string;
  liberada: boolean;
}

const FERRAMENTAS_PADRAO: Ferramenta[] = [
  { id: '1', nome: 'Portal do Fornecedor (Climbe)', descricao: 'Acesso para gerenciamento de pedidos e faturas', liberada: false },
  { id: '2', nome: 'Integração de Catálogos (ERP)', descricao: 'Sincronização de produtos e serviços contratados', liberada: false },
  { id: '3', nome: 'Módulo de Avaliação de Desempenho', descricao: 'Acompanhamento periódico de SLAs e KPIs', liberada: false },
  { id: '4', nome: 'Canal de Comunicação Direto', descricao: 'Acesso ao Slack/Teams compartilhado corporativo', liberada: false },
];

export function StageFerramentas({ empresa, canEdit, onConcluir }: StageFerramentasProps) {
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>(FERRAMENTAS_PADRAO);
  const [isConcluido, setIsConcluido] = useState(false);

  const handleToggle = (id: string) => {
    if (!canEdit) return;
    setFerramentas(ferramentas.map(f => f.id === id ? { ...f, liberada: !f.liberada } : f));
  };

  const handleSave = () => {
    setIsConcluido(true);
  };

  const handleNext = () => {
    onConcluir(ferramentas);
  };

  const todasLiberadas = ferramentas.every(f => f.liberada);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <ToggleLeft className="shrink-0" />
        <p className="font-medium mt-0.5">
          Documentos validados com sucesso! Agora, o Analista/Sênior deve configurar as ferramentas e sistemas que a empresa {empresa.tradeName} terá acesso na nossa plataforma.
        </p>
      </div>

      {!isConcluido ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {ferramentas.map(f => (
              <div 
                key={f.id} 
                onClick={() => handleToggle(f.id)}
                className={`flex items-center justify-between p-5 bg-white border rounded-2xl shadow-sm transition-all ${
                  canEdit ? 'cursor-pointer hover:border-climbe-primary' : ''
                } ${f.liberada ? 'border-climbe-primary bg-climbe-primary/5' : 'border-gray-100'}`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-climbe-secondary">{f.nome}</h4>
                  <p className="text-xs text-gray-400">{f.descricao}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    f.liberada ? 'bg-climbe-primary' : 'bg-gray-200'
                  }`}>
                    <div className={`bg-climbe-secondary w-4 h-4 rounded-full shadow-md transform duration-300 ${
                      f.liberada ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              onClick={handleSave}
              disabled={!canEdit || !todasLiberadas}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12 disabled:opacity-50"
            >
              SALVAR CONFIGURAÇÃO
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black italic text-green-700">Ferramentas Configuradas</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto">
              Todos os acessos e integrações foram concedidos e liberados para a empresa. O fluxo pode avançar para a emissão do relatório final de homologação.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleNext}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              AVANÇAR PARA RELATÓRIO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
