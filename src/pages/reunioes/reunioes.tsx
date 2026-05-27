import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, CalendarDays, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import type { User } from '@/features/usuarios/types';
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
  participantIds: z.array(z.number()).default([]),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const meetingRooms = ['Sala de Reuniões 1', 'Sala de Reuniões 2', 'Sala de Reuniões 3'];

const rangesOverlap = (newStart: string, newEnd: string, meeting: MeetingDTO) => {
  const existingStart = meeting.time?.slice(0, 5);
  const existingEnd = (meeting.endTime || meeting.time)?.slice(0, 5);
  const candidateStart = newStart.slice(0, 5);
  const candidateEnd = newEnd.slice(0, 5);

  if (!candidateStart || !candidateEnd || !existingStart || !existingEnd) return false;

  return candidateStart < existingEnd && candidateEnd > existingStart;
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [meetingsResponse, setMeetingsResponse] = useState<PaginatedResponse<MeetingDTO> | null>(null);
  const [meetings, setMeetings] = useState<MeetingDTO[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [meetingsForAvailability, setMeetingsForAvailability] = useState<MeetingDTO[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      participantIds: [],
    },
  });

  const selectedDate = watch('date');
  const selectedStartTime = watch('time');
  const selectedEndTime = watch('endTime');
  const isInPerson = watch('inPerson');
  const selectedLocation = watch('location');
  const selectedParticipantIds = watch('participantIds') || [];

  useEffect(() => {
    const requestedDate = searchParams.get('date');

    if (searchParams.get('create') !== '1' || !requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return;
    }

    setValue('date', requestedDate, { shouldDirty: true, shouldValidate: true });
    setIsCreateOpen(true);
    const remainingParams = new URLSearchParams(searchParams);
    remainingParams.delete('date');
    remainingParams.delete('create');
    setSearchParams(remainingParams, { replace: true });
  }, [searchParams, setSearchParams, setValue]);

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

  useEffect(() => {
    if (!isCreateOpen) return;

    let isActive = true;

    const loadAvailabilityData = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError(false);
      try {
        const usersPage = await userService.listUsers(0, 100);
        const allMeetings: MeetingDTO[] = [];
        let currentPage = 0;
        let totalPages = 1;

        while (currentPage < totalPages) {
          const response = await meetingService.listMeetings({ page: currentPage, size: 100, sort: 'date,asc' });
          allMeetings.push(...(response.content || []));
          totalPages = response.totalPages || 1;
          currentPage += 1;
        }

        if (!isActive) return;
        setAvailableUsers(usersPage.content || []);
        setMeetingsForAvailability(allMeetings);
      } catch (error: any) {
        if (!isActive) return;
        setAvailabilityError(true);
        setSubmitError(error?.response?.data?.message || 'Não foi possível consultar a disponibilidade.');
      } finally {
        if (isActive) setIsLoadingAvailability(false);
      }
    };

    void loadAvailabilityData();

    return () => {
      isActive = false;
    };
  }, [isCreateOpen]);

  const overlappingMeetings = useMemo(
    () =>
      meetingsForAvailability.filter(
        (meeting) =>
          meeting.date === selectedDate &&
          rangesOverlap(selectedStartTime, selectedEndTime, meeting)
      ),
    [meetingsForAvailability, selectedDate, selectedStartTime, selectedEndTime]
  );

  const participantConflicts = useMemo(
    () =>
      overlappingMeetings.filter((meeting) =>
        meeting.participantIds?.some((participantId) => selectedParticipantIds.includes(participantId))
      ),
    [overlappingMeetings, selectedParticipantIds]
  );

  const conflictingParticipantIds = useMemo(
    () => new Set(overlappingMeetings.flatMap((meeting) => meeting.participantIds || [])),
    [overlappingMeetings]
  );

  const occupiedRooms = useMemo(
    () => new Set(
      overlappingMeetings
        .filter((meeting) => meeting.inPerson && meeting.location)
        .map((meeting) => meeting.location!.trim().toLowerCase())
    ),
    [overlappingMeetings]
  );

  const roomConflict = useMemo(
    () =>
      Boolean(
        isInPerson &&
        selectedLocation &&
        occupiedRooms.has(selectedLocation.trim().toLowerCase())
      ),
    [isInPerson, selectedLocation, occupiedRooms]
  );

  const hasAvailabilityConflict = participantConflicts.length > 0 || roomConflict;

  const toggleParticipant = (participantId: number) => {
    const nextParticipantIds = selectedParticipantIds.includes(participantId)
      ? selectedParticipantIds.filter((id) => id !== participantId)
      : [...selectedParticipantIds, participantId];
    setValue('participantIds', nextParticipantIds, { shouldDirty: true, shouldValidate: true });
  };

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
      participantIds: [],
    });
  };

  const onSubmit = async (data: MeetingFormData) => {
    if (data.inPerson && !data.location) {
      setSubmitError('Selecione uma sala para a reunião presencial.');
      return;
    }

    if (hasAvailabilityConflict) {
      setSubmitError('Escolha outro horário, participante ou sala antes de salvar a reunião.');
      return;
    }

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
      
      // Enviar e-mails para participantes
      if (data.participantIds && data.participantIds.length > 0) {
        for (const id of data.participantIds) {
          try {
            const participant = await userService.getUserDetails(id.toString());
            if (participant.email) {
              await notificationService.sendEmail(
                participant.email,
                `Reunião agendada — ${data.title}`,
                `Você está convidado para uma reunião em ${data.date} às ${data.time} em ${data.location || (data.inPerson ? 'Presencial' : 'Online')}.`
              );
            }
          } catch (err) {
            console.error(`Erro ao enviar e-mail para participante ${id}:`, err);
          }
        }
      }

      setMeetings((currentMeetings) => [createdMeeting, ...currentMeetings]);
      setMeetingsForAvailability((currentMeetings) => [createdMeeting, ...currentMeetings]);
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
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-climbe-secondary p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="mb-6 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">Nova reunião</p>
              <h2 className="text-3xl font-black tracking-tighter text-white italic">Criar reunião</h2>
              <p className="text-sm text-slate-300">Preencha os dados abaixo para enviar o cadastro para a API.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Empresa ID</label>
                  <Input type="number" min={1} {...register('enterpriseId')} placeholder="1" className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.enterpriseId ? <p className="ml-1 text-xs text-red-300">{errors.enterpriseId.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Título</label>
                  <Input {...register('title')} placeholder="Alinhamento Estratégico" className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.title ? <p className="ml-1 text-xs text-red-300">{errors.title.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Data</label>
                  <Input type="date" {...register('date')} className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.date ? <p className="ml-1 text-xs text-red-300">{errors.date.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Status</label>
                  <Input {...register('status')} placeholder="AGENDADA" className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.status ? <p className="ml-1 text-xs text-red-300">{errors.status.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Horário de início</label>
                  <Input type="time" step="1" {...register('time')} className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.time ? <p className="ml-1 text-xs text-red-300">{errors.time.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Horário de término</label>
                  <Input type="time" step="1" {...register('endTime')} className="bg-white text-slate-900 placeholder:text-slate-400" />
                  {errors.endTime ? <p className="ml-1 text-xs text-red-300">{errors.endTime.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">{isInPerson ? 'Sala' : 'Link da reunião'}</label>
                  {isInPerson ? (
                    <select
                      value={selectedLocation || ''}
                      onChange={(event) => setValue('location', event.target.value, { shouldDirty: true, shouldValidate: true })}
                      className="w-full rounded-xl border border-transparent bg-white px-5 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/40"
                    >
                      <option value="">Selecione uma sala...</option>
                      {meetingRooms.map((room) => {
                        const occupied = occupiedRooms.has(room.toLowerCase());
                        return (
                          <option key={room} value={room} disabled={occupied}>
                            {room}{occupied ? ' (ocupada)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <Input {...register('location')} placeholder="Link do Google Meet (opcional)" className="bg-white text-slate-900 placeholder:text-slate-400" />
                  )}
                  {errors.location ? <p className="ml-1 text-xs text-red-300">{errors.location.message}</p> : null}
                  {roomConflict ? <p className="ml-1 text-xs text-red-300">Sala ocupada no horário selecionado.</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Disponibilidade</label>
                  <div className={`flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-semibold ${
                    hasAvailabilityConflict ? 'bg-red-500/15 text-red-200' : 'bg-white/5 text-climbe-primary'
                  }`}>
                    {isLoadingAvailability
                      ? 'Consultando agenda...'
                      : availabilityError
                        ? 'Consulta indisponível'
                      : hasAvailabilityConflict
                        ? 'Conflito encontrado'
                        : 'Horário disponível'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Participantes</label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl bg-white p-3 text-slate-900">
                  {isLoadingAvailability ? (
                    <p className="px-2 py-3 text-sm text-slate-500">Carregando participantes...</p>
                  ) : availableUsers.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-slate-500">Nenhum usuário disponível para seleção.</p>
                  ) : availableUsers.map((participant) => {
                    const participantId = Number(participant.id);
                    const participantHasConflict = conflictingParticipantIds.has(participantId);

                    return (
                      <label key={participant.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-2 py-2 transition hover:bg-slate-50">
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedParticipantIds.includes(participantId)}
                            onChange={() => toggleParticipant(participantId)}
                            disabled={participantHasConflict && !selectedParticipantIds.includes(participantId)}
                            className="h-4 w-4 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
                          />
                          <span>
                            <span className="block text-sm font-bold">{participant.fullName}</span>
                            <span className="block text-xs text-slate-500">{participant.email}</span>
                          </span>
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                          participantHasConflict ? 'text-red-500' : 'text-climbe-primary'
                        }`}>
                          {participantHasConflict ? 'Ocupado' : 'Livre'}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {participantConflicts.length > 0 ? (
                  <p className="ml-1 text-xs text-red-300">Um ou mais participantes possuem reunião nesse horário.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Pauta</label>
                <textarea
                  {...register('agenda')}
                  rows={5}
                  className="flex min-h-28 w-full rounded-xl border-transparent bg-white px-5 py-3 text-sm font-light text-slate-900 transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climbe-primary/50"
                  placeholder="1. Apresentação dos resultados\n2. Definição de metas"
                />
                {errors.agenda ? <p className="ml-1 text-xs text-red-300">{errors.agenda.message}</p> : null}
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-4">
                <input
                  type="checkbox"
                  checked={isInPerson}
                  onChange={(event) => {
                    setValue('inPerson', event.target.checked, { shouldDirty: true, shouldValidate: true });
                    setValue('location', '', { shouldDirty: true, shouldValidate: true });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
                />
                <div>
                  <p className="text-sm font-bold text-white">Reunião presencial</p>
                  <p className="text-xs text-slate-300">Desmarque para indicar uma reunião online.</p>
                </div>
              </div>

              {submitError ? <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">{submitError}</p> : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={closeModal} className="font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoadingAvailability || availabilityError || hasAvailabilityConflict} className="gap-2 bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none">
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
