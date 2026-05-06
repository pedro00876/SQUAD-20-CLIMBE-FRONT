import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, CalendarDays, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  meetingService,
  type MeetingCreateRequest,
  type MeetingDTO,
  type PaginatedResponse,
} from '@/features/reunioes/services';

const meetingSchema = z.object({
  enterpriseId: z.coerce.number().int().positive('Informe a empresa da reunião'),
  title: z.string().min(3, 'Informe um título para a reunião'),
  date: z.string().min(1, 'Informe a data da reunião'),
  time: z.string().min(1, 'Informe o horário de início'),
  endTime: z.string().min(1, 'Informe o horário de término'),
  inPerson: z.coerce.boolean(),
  location: z.string().max(500, 'Máximo de 500 caracteres').optional().or(z.literal('')),
  agenda: z.string().max(2000, 'Máximo de 2000 caracteres').optional().or(z.literal('')),
  status: z.string().max(50, 'Máximo de 50 caracteres').default('AGENDADA'),
  participantIds: z
    .string()
    .optional()
    .transform((value) =>
      (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
    ),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const formatToday = () =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

const formatMeetingTime = (meeting: Partial<MeetingDTO>) => {
  const startTime = meeting.time?.slice(0, 5);
  const endTime = meeting.endTime?.slice(0, 5);

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return 'Horário indisponível';
};

const formatMeetingSummary = (meeting: MeetingDTO) => meeting.title || 'Reunião sem título';

export function ReunioesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [meetingsResponse, setMeetingsResponse] = useState<PaginatedResponse<MeetingDTO> | null>(null);
  const [meetings, setMeetings] = useState<MeetingDTO[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      enterpriseId: 1,
      title: '',
      date: new Date().toISOString().slice(0, 10),
      time: '14:00:00',
      endTime: '15:00:00',
      inPerson: true,
      location: '',
      agenda: '',
      status: 'AGENDADA',
      participantIds: '',
    },
  });

  useEffect(() => {
    let isActive = true;

    const loadMeetings = async () => {
      setIsLoadingMeetings(true);
      setMeetingsError(null);

      try {
        const response = await meetingService.listMeetings({ page, size: pageSize, sort: 'date,asc' });

        if (!isActive) {
          return;
        }

        setMeetingsResponse(response);
        setMeetings(response.content || []);
      } catch (error: any) {
        if (!isActive) {
          return;
        }

        setMeetings([]);
        setMeetingsError(error?.response?.data?.message || 'Não foi possível carregar as reuniões.');
      } finally {
        if (isActive) {
          setIsLoadingMeetings(false);
        }
      }
    };

    void loadMeetings();

    return () => {
      isActive = false;
    };
  }, [page, pageSize]);

  const closeModal = () => {
    setIsCreateOpen(false);
    setSubmitError(null);
    reset({
      enterpriseId: 1,
      title: '',
      date: new Date().toISOString().slice(0, 10),
      time: '14:00:00',
      endTime: '15:00:00',
      inPerson: true,
      location: '',
      agenda: '',
      status: 'AGENDADA',
      participantIds: '',
    });
  };

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: MeetingCreateRequest = {
        enterpriseId: data.enterpriseId,
        title: data.title,
        date: data.date,
        time: data.time,
        endTime: data.endTime,
        inPerson: data.inPerson,
        location: data.location || undefined,
        agenda: data.agenda || undefined,
        status: data.status || 'AGENDADA',
        participantIds: data.participantIds,
      };

      const createdMeeting = await meetingService.createMeeting(payload);
      setMeetings((currentMeetings) => [createdMeeting, ...currentMeetings]);
      setMeetingsResponse((currentResponse) => {
        if (!currentResponse) {
          return currentResponse;
        }

        return {
          ...currentResponse,
          content: [createdMeeting, ...currentResponse.content],
          totalElements: currentResponse.totalElements + 1,
        };
      });
      closeModal();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || 'Não foi possível criar a reunião.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Calendar size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agenda</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Reuniões</h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Acompanhe seus próximos compromissos, veja a data de hoje e agende novas reuniões com parceiros.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[28px] border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-climbe-secondary">
            <CalendarDays size={18} className="text-climbe-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hoje</span>
          </div>
          <p className="text-lg font-black italic text-climbe-secondary capitalize">{formatToday()}</p>
          <Button type="button" onClick={() => setIsCreateOpen(true)} className="w-fit gap-2 self-start">
            <Plus size={16} />
            Criar reunião
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-climbe-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-climbe-primary">
              {meetingsResponse?.totalElements ?? meetings.length} reuniões cadastradas
            </span>
            <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
              Endpoint: GET /api/meetings
            </span>
          </div>

          {meetingsError ? <p className="text-sm font-semibold text-red-500">{meetingsError}</p> : null}

          {isLoadingMeetings ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 rounded-3xl border border-gray-100 bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {meeting.status}
                      </span>
                      <h4 className="text-lg font-black italic text-climbe-secondary">{formatMeetingSummary(meeting)}</h4>
                      <p className="text-sm text-gray-500">{meeting.enterpriseName || (meeting.enterpriseId ? `Empresa ${meeting.enterpriseId}` : 'Empresa não informada')}</p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-climbe-secondary text-white">
                      <Calendar size={18} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-gray-500">
                    <p>
                      <span className="font-bold text-climbe-secondary">Data:</span> {meeting.date || 'Data indisponível'}
                    </p>
                    <p>
                      <span className="font-bold text-climbe-secondary">Horário:</span> {formatMeetingTime(meeting)}
                    </p>
                    <p>
                      <span className="font-bold text-climbe-secondary">Formato:</span> {meeting.inPerson ? 'Presencial' : 'Online'}
                    </p>
                    {meeting.location ? (
                      <p>
                        <span className="font-bold text-climbe-secondary">Local:</span> {meeting.location}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Página {(meetingsResponse?.number ?? page) + 1} de {Math.max(meetingsResponse?.totalPages ?? 1, 1)}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={page <= 0 || isLoadingMeetings} onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}>
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMeetings || !meetingsResponse || page >= meetingsResponse.totalPages - 1}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="mb-6 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Nova reunião</p>
              <h2 className="text-3xl font-black tracking-tighter text-climbe-secondary italic">Criar reunião</h2>
              <p className="text-sm text-gray-400">Preencha os dados abaixo para enviar o cadastro para a API.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Empresa ID</label>
                  <Input type="number" min={1} {...register('enterpriseId')} placeholder="1" />
                  {errors.enterpriseId ? <p className="ml-1 text-xs text-red-500">{errors.enterpriseId.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Título</label>
                  <Input {...register('title')} placeholder="Alinhamento Estratégico" />
                  {errors.title ? <p className="ml-1 text-xs text-red-500">{errors.title.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Data</label>
                  <Input type="date" {...register('date')} />
                  {errors.date ? <p className="ml-1 text-xs text-red-500">{errors.date.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Status</label>
                  <Input {...register('status')} placeholder="AGENDADA" />
                  {errors.status ? <p className="ml-1 text-xs text-red-500">{errors.status.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Horário de início</label>
                  <Input type="time" step="1" {...register('time')} />
                  {errors.time ? <p className="ml-1 text-xs text-red-500">{errors.time.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Horário de término</label>
                  <Input type="time" step="1" {...register('endTime')} />
                  {errors.endTime ? <p className="ml-1 text-xs text-red-500">{errors.endTime.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Local ou link</label>
                  <Input {...register('location')} placeholder="Sala de Reuniões 1 ou Google Meet" />
                  {errors.location ? <p className="ml-1 text-xs text-red-500">{errors.location.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Participantes</label>
                  <Input {...register('participantIds')} placeholder="2, 5, 8" />
                  {errors.participantIds ? <p className="ml-1 text-xs text-red-500">{errors.participantIds.message as string}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-climbe-secondary">Pauta</label>
                <textarea
                  {...register('agenda')}
                  rows={5}
                  className="flex min-h-28 w-full rounded-xl border-transparent bg-gray-50 px-5 py-3 text-sm font-light transition-all placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climbe-primary/50"
                  placeholder="1. Apresentação dos resultados\n2. Definição de metas"
                />
                {errors.agenda ? <p className="ml-1 text-xs text-red-500">{errors.agenda.message}</p> : null}
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                <input type="checkbox" {...register('inPerson')} className="h-4 w-4 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary" />
                <div>
                  <p className="text-sm font-bold text-climbe-secondary">Reunião presencial</p>
                  <p className="text-xs text-gray-400">Desmarque para indicar uma reunião online.</p>
                </div>
              </div>

              {submitError ? <p className="text-sm font-semibold text-red-500">{submitError}</p> : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? 'Salvando...' : <><Plus size={16} /> Salvar reunião</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
