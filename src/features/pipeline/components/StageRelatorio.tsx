import { useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface StageRelatorioProps {
  empresa: any;
  userRole: string; // ANALISTA, SENIOR, ADMIN, etc.
  onConcluir: (data: any) => void;
}

export function StageRelatorio({ empresa, userRole, onConcluir }: StageRelatorioProps) {
  const [relatorioText, setRelatorioText] = useState('');
  const [score, setScore] = useState('100');
  const [status, setStatus] = useState<'RASCUNHO' | 'REVISAO' | 'APROVADO' | 'CORRECAO'>('RASCUNHO');
  const [motivoCorrecao, setMotivoCorrecao] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const isAnalista = userRole === 'ANALISTA' || userRole === 'ADMIN';
  const isSenior = userRole === 'SENIOR' || userRole === 'ADMIN';

  const handleEnviarRevisao = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('REVISAO');
  };

  const handleAprovar = () => {
    setStatus('APROVADO');
  };

  const handleSolicitarCorrecao = () => {
    if (motivoCorrecao) {
      setStatus('CORRECAO');
      setShowCorrectionInput(false);
    }
  };

  const handleAvancar = () => {
    onConcluir({ relatorioText, score });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <BarChart3 className="shrink-0" />
        <p className="font-medium mt-0.5">
          Etapa de Relatório de Homologação. O Analista elabora o relatório de desempenho e score, e o Sênior realiza a validação final antes do encerramento.
        </p>
      </div>

      {status === 'RASCUNHO' || status === 'CORRECAO' ? (
        <div className="space-y-6">
          {status === 'CORRECAO' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-100 flex gap-2">
              <AlertCircle className="shrink-0 text-red-500" />
              <div>
                <span className="font-bold">Correção Solicitada pelo Sênior:</span>
                <p className="mt-1">{motivoCorrecao}</p>
              </div>
            </div>
          )}

          {isAnalista ? (
            <form onSubmit={handleEnviarRevisao} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">
                  Nota / Score Geral do Fornecedor (0 - 100)
                </Label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">
                  Parecer Técnico e Relatório Final
                </Label>
                <textarea
                  required
                  value={relatorioText}
                  onChange={e => setRelatorioText(e.target.value)}
                  rows={6}
                  placeholder="Escreva detalhadamente a avaliação dos documentos, reunião e capacidade técnica do fornecedor..."
                  className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
                >
                  <Send size={16} className="mr-2" /> ENVIAR PARA REVISÃO DO SÊNIOR
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-gray-400 italic font-medium">
                Aguardando que o Analista envie o parecer técnico inicial para revisão.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {status === 'REVISAO' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 flex gap-2">
            <AlertCircle className="shrink-0 text-yellow-500" />
            <p className="font-medium mt-0.5">
              Relatório submetido. Aguardando revisão técnica do Analista Sênior.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Score Avaliado</span>
              <span className="text-3xl font-black italic text-climbe-secondary">{score} / 100</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Parecer do Analista</span>
              <p className="text-sm text-climbe-secondary whitespace-pre-wrap font-medium">{relatorioText}</p>
            </div>
          </div>

          {isSenior ? (
            <div className="space-y-4">
              {showCorrectionInput ? (
                <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-red-800">
                    O que precisa ser corrigido no relatório?
                  </Label>
                  <textarea
                    required
                    value={motivoCorrecao}
                    onChange={e => setMotivoCorrecao(e.target.value)}
                    rows={3}
                    placeholder="Indique os ajustes necessários..."
                    className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none border focus:border-red-500/30"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCorrectionInput(false)} className="text-red-700">Cancelar</Button>
                    <Button size="sm" onClick={handleSolicitarCorrecao} disabled={!motivoCorrecao} className="bg-red-500 text-white font-bold rounded-lg">Solicitar Correção</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => setShowCorrectionInput(true)}>
                    Solicitar Correção
                  </Button>
                  <Button onClick={handleAprovar} className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all">
                    APROVAR RELATÓRIO
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-gray-400 italic font-medium">
                Você já submeteu o relatório. Aguarde até que um Sênior valide sua avaliação.
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'APROVADO' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-3xl border border-green-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black italic text-green-700">Relatório Aprovado</h3>
            <p className="text-green-600/80 mt-2 max-w-md mx-auto">
              A homologação técnica foi homologada e aprovada pelo Analista Sênior. Score Final: {score}/100.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleAvancar}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12"
            >
              AVANÇAR PARA AGENDAMENTO FINAL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
