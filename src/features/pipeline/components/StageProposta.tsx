import { useState } from 'react';
import { FileText, CheckCircle2, XCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StagePropostaProps {
  empresa: any;
  canUpload: boolean;
  canApprove: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUpload: (file: File) => void;
}

export function StageProposta({ empresa, canUpload, canApprove, onApprove, onReject, onUpload }: StagePropostaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [propostaEnviada, setPropostaEnviada] = useState(false); // Simulação de estado
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      setPropostaEnviada(true);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <FileText className="shrink-0" />
        <p className="font-medium mt-0.5">
          Nesta etapa, a proposta comercial deve ser anexada pelo Analista e aprovada pelos responsáveis (CMS/CSS/CEO).
        </p>
      </div>

      {!propostaEnviada ? (
        <div className="space-y-4">
          <h3 className="font-bold italic text-climbe-secondary text-lg">Envio de Proposta</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              id="proposta-upload"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={!canUpload}
            />
            <label htmlFor="proposta-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <Upload className="text-climbe-primary w-8 h-8" />
              </div>
              <div>
                <span className="text-lg font-bold text-climbe-secondary block">
                  {file ? file.name : "Anexar Proposta (PDF)"}
                </span>
                {!file && <span className="text-sm text-gray-400">Clique para selecionar o arquivo</span>}
              </div>
            </label>
          </div>

          {canUpload && (
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleUpload}
                disabled={!file}
                className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8"
              >
                ENVIAR PROPOSTA
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-climbe-primary/20 text-climbe-primary flex items-center justify-center">
                <FileText />
              </div>
              <div>
                <p className="font-bold text-climbe-secondary">Proposta Comercial_v1.pdf</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Enviado por: Analista</p>
              </div>
            </div>
            <Button variant="outline" className="font-bold">Visualizar PDF</Button>
          </div>

          {canApprove && !showRejectForm && (
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <Button 
                onClick={() => setShowRejectForm(true)}
                className="flex-1 bg-red-50 text-red-500 hover:bg-red-100 font-black italic rounded-xl h-14"
              >
                <XCircle className="mr-2" /> REPROVAR
              </Button>
              <Button 
                onClick={onApprove}
                className="flex-1 bg-climbe-primary text-climbe-secondary hover:scale-[1.02] transition-all font-black italic rounded-xl shadow-lg shadow-climbe-primary/20 h-14"
              >
                <CheckCircle2 className="mr-2" /> APROVAR PROPOSTA
              </Button>
            </div>
          )}

          {showRejectForm && (
            <div className="bg-red-50 p-6 rounded-2xl space-y-4 border border-red-100">
              <h4 className="font-bold text-red-600">Motivo da Reprovação</h4>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Explique por que a proposta está sendo reprovada..."
                className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none border focus:border-red-500/30"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowRejectForm(false)} className="font-bold text-red-600">Cancelar</Button>
                <Button onClick={() => onReject(rejectReason)} disabled={!rejectReason} className="bg-red-500 text-white font-black italic rounded-xl">
                  CONFIRMAR REPROVAÇÃO
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
