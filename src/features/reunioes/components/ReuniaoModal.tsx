import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import type { Reuniao, ReuniaoFormValues } from '@/types/reuniao.types';

interface ReuniaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingReuniao: Reuniao | null;
  form: ReuniaoFormValues;
  onChangeForm: <K extends keyof ReuniaoFormValues>(field: K, value: ReuniaoFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  feedback: string | null;
}

export function ReuniaoModal({
  isOpen,
  onClose,
  editingReuniao,
  form,
  onChangeForm,
  onSubmit,
  isSubmitting,
  feedback,
}: ReuniaoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg bg-climbe-secondary text-white"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black italic text-white">
            {editingReuniao ? 'Editar reunião' : 'Nova reunião'}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Preencha os detalhes do compromisso e os participantes envolvidos.
          </p>
        </div>

        {feedback && (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">{feedback}</p>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="reuniao-titulo" className="font-bold text-white">
              Título da reunião
            </Label>
            <Input
              id="reuniao-titulo"
              className="text-black placeholder:text-gray-400"
              value={form.titulo}
              onChange={(e) => onChangeForm('titulo', e.target.value)}
              placeholder="Ex.: Apresentação de resultados Q1"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reuniao-dataHorario" className="font-bold text-white">
                Data e horário
              </Label>
              <Input
                id="reuniao-dataHorario"
                type="datetime-local"
                className="text-black placeholder:text-gray-400"
                value={form.dataHorario}
                onChange={(e) => onChangeForm('dataHorario', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reuniao-local" className="font-bold text-white">
                Local / Link
              </Label>
              <Input
                id="reuniao-local"
                className="text-black placeholder:text-gray-400"
                value={form.local}
                onChange={(e) => onChangeForm('local', e.target.value)}
                placeholder="Ex.: Google Meet / Sala 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reuniao-participantes" className="font-bold text-white">
              Participantes
            </Label>
            <Input
              id="reuniao-participantes"
              className="text-black placeholder:text-gray-400"
              value={form.participantes}
              onChange={(e) => onChangeForm('participantes', e.target.value)}
              placeholder="Separe os nomes por vírgula"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reuniao-descricao" className="font-bold text-white">
              Descrição / Pauta
            </Label>
            <textarea
              id="reuniao-descricao"
              value={form.descricao}
              onChange={(e) => onChangeForm('descricao', e.target.value)}
              rows={3}
              placeholder="Descreva a pauta ou objetivos da reunião..."
              className="flex w-full resize-none rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-climbe-primary/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : editingReuniao
                  ? 'Salvar alterações'
                  : 'Agendar reunião'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
