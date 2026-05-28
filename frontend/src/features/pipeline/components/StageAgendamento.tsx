import { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StageAgendamentoProps {
  empresa: any;
  canEdit: boolean;
  onConcluir: (data: any) => void;
}

export function StageAgendamento({ empresa, canEdit, onConcluir }: StageAgendamentoProps) {
  const [dataReuniao, setDataReuniao] = useState('');
  const [horaReuniao, setHoraReuniao] = useState('');
  const [linkVideo, setLinkVideo] = useState('');
  const [isFinalizado, setIsFinalizado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinalizado(true);
  };

  const handleFinishProcess = () => {
    onConcluir({ dataReuniao, horaReuniao, linkVideo });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <Calendar className="shrink-0" />
        <p className="font-medium mt-0.5">
          Etapa Final: Agendamento da Reunião de Homologação. Marque a reunião com a empresa {empresa.tradeName} para formalização do encerramento e assinatura do termo de homologação.
        </p>
      </div>

      {!isFinalizado ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Data da Reunião Final
              </Label>
              <Input 
                type="date" 
                required 
                value={dataReuniao}
                onChange={e => setDataReuniao(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Horário
              </Label>
              <Input 
                type="time" 
                required 
                value={horaReuniao}
                onChange={e => setHoraReuniao(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Video size={14} /> Link da Videochamada (Google Meet / Teams / Zoom)
            </Label>
            <Input 
              type="url" 
              required 
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={linkVideo}
              onChange={e => setLinkVideo(e.target.value)}
              disabled={!canEdit}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              type="submit"
              disabled={!canEdit || !dataReuniao || !horaReuniao || !linkVideo}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-12 disabled:opacity-50"
            >
              AGENDAR REUNIÃO E AVANÇAR
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center bg-climbe-primary/10 rounded-3xl border border-climbe-primary/20">
            <div className="w-20 h-20 bg-climbe-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Award className="w-10 h-10 text-climbe-secondary" />
            </div>
            <h3 className="text-2xl font-black italic text-climbe-secondary">Reunião Agendada & Homologação Pronta</h3>
            <p className="text-climbe-secondary/80 mt-2 max-w-md mx-auto">
              Reunião marcada para o dia {new Date(dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR')} às {horaReuniao}. O link do convite foi enviado para todos os participantes.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleFinishProcess}
              className="bg-climbe-primary text-climbe-secondary font-black italic rounded-xl px-8 hover:scale-105 transition-all shadow-lg shadow-climbe-primary/20 h-14 w-full sm:w-auto"
            >
              CONCLUIR PROCESSO DE HOMOLOGAÇÃO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
