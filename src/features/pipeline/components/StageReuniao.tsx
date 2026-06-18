import { useState } from 'react';
import { Calendar, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StageReuniaoProps {
  empresa: any;
  onConcluir: (data: { dataReuniao: string; pauta: string; file: File | null }) => void;
  canEdit: boolean;
}

export function StageReuniao({ empresa, onConcluir, canEdit }: StageReuniaoProps) {
  const [dataReuniao, setDataReuniao] = useState('');
  const [pauta, setPauta] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConcluir({ dataReuniao, pauta, file });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6">
        <p className="font-medium">
          Registre os detalhes da reunião inicial com <strong>{empresa.tradeName || empresa.legalName}</strong>. 
          Você pode anexar a ata da reunião.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Data da Reunião
            </Label>
            <Input 
              type="date" 
              required 
              value={dataReuniao}
              onChange={e => setDataReuniao(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Pauta / Resumo
          </Label>
          <textarea
            required
            value={pauta}
            onChange={e => setPauta(e.target.value)}
            disabled={!canEdit}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-climbe-primary/10 transition-all outline-none border focus:border-climbe-primary/20"
            placeholder="Descreva os principais pontos discutidos..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Upload size={14} /> Anexar Ata (Opcional)
          </Label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              id="ata-upload"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={!canEdit}
            />
            <label htmlFor="ata-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <FileText className="text-gray-400" />
              </div>
              <span className="text-sm font-medium text-climbe-secondary">
                {file ? file.name : "Clique para anexar o documento da ata"}
              </span>
              {!file && <span className="text-xs text-gray-400">PDF, DOCX (Max 10MB)</span>}
            </label>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <Button 
              type="submit"
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20"
            >
              SALVAR REGISTRO
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
