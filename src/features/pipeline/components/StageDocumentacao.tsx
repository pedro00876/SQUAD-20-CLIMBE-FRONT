import { useState } from 'react';
import { Files, Upload, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Documento {
  id: string;
  nome: string;
  status: 'PENDENTE' | 'ENVIADO' | 'APROVADO' | 'REPROVADO';
  fileUrl?: string;
  motivoReprovacao?: string;
}

const DOCUMENTOS_PADRAO: Documento[] = [
  { id: '1', nome: 'Balanço da Empresa', status: 'PENDENTE' },
  { id: '2', nome: 'DRE', status: 'PENDENTE' },
  { id: '3', nome: 'Planilhas Gerenciais', status: 'PENDENTE' },
  { id: '4', nome: 'Cartão CNPJ', status: 'PENDENTE' },
  { id: '5', nome: 'Contrato Social', status: 'PENDENTE' },
];

interface StageDocumentacaoProps {
  empresa: any;
  userRole: string;
  currentStage: 'DOCUMENTACAO' | 'VALIDACAO';
  onConcluir: () => void;
}

export function StageDocumentacao({ empresa, userRole, currentStage, onConcluir }: StageDocumentacaoProps) {
  const [docs, setDocs] = useState<Documento[]>(DOCUMENTOS_PADRAO);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null); // Armazena ID do doc sendo reprovado
  const [rejectReason, setRejectReason] = useState('');

  const handleSolicitar = () => {
    // Na vida real, chamaria a API para enviar e-mail à empresa
    setSolicitacaoEnviada(true);
  };

  const handleUploadSimulado = (id: string) => {
    setDocs(docs.map(d => d.id === id ? { ...d, status: 'ENVIADO', fileUrl: 'blob:simulado' } : d));
  };

  const handleAprovar = (id: string) => {
    setDocs(docs.map(d => d.id === id ? { ...d, status: 'APROVADO' } : d));
  };

  const handleReprovarConfirm = () => {
    if (showRejectModal) {
      setDocs(docs.map(d => d.id === showRejectModal ? { ...d, status: 'REPROVADO', motivoReprovacao: rejectReason } : d));
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  const isEmpresa = userRole === 'EMPRESA';
  const isAnalista = userRole === 'ANALISTA' || userRole === 'ADMIN' || userRole === 'SENIOR';
  
  const todosEnviados = docs.every(d => d.status === 'ENVIADO' || d.status === 'APROVADO');
  const todosAprovados = docs.every(d => d.status === 'APROVADO');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <Files className="shrink-0" />
        <p className="font-medium mt-0.5">
          {currentStage === 'DOCUMENTACAO' 
            ? "Etapa de Solicitação e Upload de Documentos. O Analista solicita a lista de documentos e a Empresa realiza os anexos correspondentes."
            : "Etapa de Validação de Documentos. O Analista deve revisar todos os documentos enviados e aprovar ou solicitar correção."
          }
        </p>
      </div>

      {currentStage === 'DOCUMENTACAO' && !solicitacaoEnviada && isAnalista ? (
        <div className="space-y-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-climbe-secondary mb-2">Solicitar Documentação</h3>
            <p className="text-sm text-gray-400">Verifique os documentos que serão exigidos para a empresa {empresa.tradeName || empresa.legalName}</p>
          </div>
          
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <CheckCircle2 className="text-climbe-primary" size={18} />
                <span className="text-sm font-medium text-climbe-secondary">{doc.nome}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button 
              onClick={handleSolicitar}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl hover:scale-105 transition-all"
            >
              NOTIFICAR EMPRESA E SOLICITAR
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="font-bold italic text-climbe-secondary text-lg">
            {currentStage === 'DOCUMENTACAO' ? 'Upload de Documentos' : 'Análise/Validação dos Documentos'}
          </h3>
          <div className="grid gap-4">
            {docs.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.status === 'APROVADO' ? 'bg-green-50 text-green-500' : doc.status === 'REPROVADO' ? 'bg-red-50 text-red-500' : doc.status === 'ENVIADO' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'}`}>
                    {doc.status === 'APROVADO' ? <CheckCircle2 /> : doc.status === 'REPROVADO' ? <XCircle /> : <FileText />}
                  </div>
                  <div>
                    <h4 className="font-bold text-climbe-secondary">{doc.nome}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${doc.status === 'APROVADO' ? 'text-green-500' : doc.status === 'REPROVADO' ? 'text-red-500' : doc.status === 'ENVIADO' ? 'text-blue-500' : 'text-gray-400'}`}>
                      {doc.status}
                    </span>
                    {doc.motivoReprovacao && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {doc.motivoReprovacao}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Visão de Upload: apenas na etapa DOCUMENTACAO */}
                  {currentStage === 'DOCUMENTACAO' && (doc.status === 'PENDENTE' || doc.status === 'REPROVADO') && (
                    <Button variant="outline" size="sm" onClick={() => handleUploadSimulado(doc.id)} className="w-full sm:w-auto border-dashed">
                      <Upload size={14} className="mr-2" /> Anexar
                    </Button>
                  )}

                  {/* Visão de Validação: apenas na etapa VALIDACAO */}
                  {currentStage === 'VALIDACAO' && isAnalista && doc.status === 'ENVIADO' && (
                    <>
                      <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100" onClick={() => setShowRejectModal(doc.id)}>
                        Reprovar
                      </Button>
                      <Button size="sm" onClick={() => handleAprovar(doc.id)} className="bg-climbe-primary text-climbe-secondary hover:bg-climbe-primary/90">
                        Aprovar
                      </Button>
                    </>
                  )}

                  {doc.fileUrl && (
                     <Button size="sm" variant="ghost" className="text-gray-400 hover:text-climbe-secondary">Visualizar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Simplificado para Justificativa */}
          {showRejectModal && (
            <div className="bg-red-50 p-6 rounded-2xl space-y-4 border border-red-100 mt-4">
              <h4 className="font-bold text-red-600 flex items-center gap-2"><AlertCircle size={16}/> Motivo da Reprovação</h4>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Informe por que o documento não é válido para notificar a empresa..."
                className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none border focus:border-red-500/30"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="font-bold text-red-600">Cancelar</Button>
                <Button onClick={handleReprovarConfirm} disabled={!rejectReason} className="bg-red-500 text-white font-black italic rounded-xl">
                  REPROVAR DOCUMENTO
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-8">
            {currentStage === 'DOCUMENTACAO' ? (
              <Button 
                onClick={onConcluir}
                disabled={!todosEnviados}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-14 w-full sm:w-auto disabled:opacity-50"
              >
                ENVIAR TODOS OS DOCUMENTOS PARA VALIDAÇÃO
              </Button>
            ) : (
              isAnalista && (
                <Button 
                  onClick={onConcluir}
                  disabled={!todosAprovados}
                  className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-14 w-full sm:w-auto disabled:opacity-50"
                >
                  CONFIRMAR DOCUMENTAÇÃO VÁLIDA E LIBERAR FERRAMENTAS
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

