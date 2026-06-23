import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/features/usuarios/services';
import type { User } from '@/features/usuarios/types';
import { enterpriseService } from '@/features/empresas/services';
import type { Enterprise } from '@/features/empresas/types';
import { meetingService } from '@/features/reunioes/services';
import type { CreateMeetingRequest, Meeting } from '@/features/reunioes/types';

const meetingSchema = z.object({
  enterpriseId: z.coerce
    .number()
    .int()
    .positive('Informe a empresa da reunião'),
  title: z.string().min(3, 'Informe um título para a reunião'),
  date: z.string().min(1, 'Informe a data da reunião'),
  time: z.string().min(1, 'Informe o horário de início'),
  endTime: z.string().min(1, 'Informe o horário de término'),
  inPerson: z.coerce.boolean(),
  location: z
    .string()
    .max(500, 'Máximo de 500 caracteres')
    .optional()
    .or(z.literal('')),
  agenda: z
    .string()
    .max(2000, 'Máximo de 2000 caracteres')
    .optional()
    .or(z.literal('')),
  status: z.string().max(50, 'Máximo de 50 caracteres').default('AGENDADA'),
  participantIds: z.array(z.number()).default([]),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const meetingRooms = [
  'Sala de Reuniões 1',
  'Sala de Reuniões 2',
  'Sala de Reuniões 3',
];

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

const rangesOverlap = (
  newStart: string,
  newEnd: string,
  meeting: Meeting,
) => {
  const existingStart = meeting.time?.slice(0, 5);
  const existingEnd = (meeting.endTime || meeting.time)?.slice(0, 5);
  const candidateStart = newStart.slice(0, 5);
  const candidateEnd = newEnd.slice(0, 5);

  if (!candidateStart || !candidateEnd || !existingStart || !existingEnd) {
    return false;
  }

  return candidateStart < existingEnd && candidateEnd > existingStart;
};

export interface MeetingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (meeting: Meeting) => void;
  initialDate?: string;
}

export function MeetingCreateModal({
  isOpen,
  onClose,
  onCreated,
  initialDate,
}: MeetingCreateModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableEnterprises, setAvailableEnterprises] = useState<Enterprise[]>([]);
  const [meetingsForAvailability, setMeetingsForAvailability] = useState<Meeting[]>([]);
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
      enterpriseId: 0,
      title: '',
      date: initialDate ?? new Date().toISOString().slice(0, 10),
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
  const watchedParticipantIds = watch('participantIds');
  const selectedParticipantIds = useMemo(
    () => watchedParticipantIds ?? [],
    [watchedParticipantIds],
  );

  useEffect(() => {
    if (!isOpen) return;

    reset({
      enterpriseId: 0,
      title: '',
      date: initialDate ?? new Date().toISOString().slice(0, 10),
      time: '14:00:00',
      endTime: '15:00:00',
      inPerson: true,
      location: '',
      agenda: '',
      status: 'AGENDADA',
      participantIds: [],
    });
    setSubmitError(null);
  }, [isOpen, initialDate, reset]);

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    const loadAvailabilityData = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError(false);
      try {
        const [usersPage, enterprisesPage] = await Promise.all([
          userService.listUsers(0, 100),
          enterpriseService.listEnterprises(0, 100),
        ]);
        const allMeetings: Meeting[] = [];
        let currentPage = 0;
        let totalPages = 1;

        while (currentPage < totalPages) {
          const response = await meetingService.listMeetings(currentPage, 100);
          allMeetings.push(...(response.content || []));
          totalPages = response.totalPages || 1;
          currentPage += 1;
        }

        if (!isActive) return;
        setAvailableUsers(usersPage.content || []);
        setAvailableEnterprises(enterprisesPage.content || []);
        setMeetingsForAvailability(allMeetings);
      } catch (error: unknown) {
        if (!isActive) return;
        setAvailabilityError(true);
        setSubmitError(
          getApiErrorMessage(error, 'Não foi possível consultar a disponibilidade.'),
        );
      } finally {
        if (isActive) setIsLoadingAvailability(false);
      }
    };

    void loadAvailabilityData();

    return () => {
      isActive = false;
    };
  }, [isOpen]);

  const overlappingMeetings = useMemo(
    () =>
      meetingsForAvailability.filter(
        (meeting) =>
          meeting.date === selectedDate &&
          rangesOverlap(selectedStartTime, selectedEndTime, meeting),
      ),
    [meetingsForAvailability, selectedDate, selectedStartTime, selectedEndTime],
  );

  const participantConflicts = useMemo(
    () =>
      overlappingMeetings.filter((meeting) =>
        meeting.participantIds?.some((participantId: number) =>
          selectedParticipantIds.includes(participantId),
        ),
      ),
    [overlappingMeetings, selectedParticipantIds],
  );

  const conflictingParticipantIds = useMemo(
    () =>
      new Set(
        overlappingMeetings.flatMap((meeting) => meeting.participantIds || []),
      ),
    [overlappingMeetings],
  );

  const occupiedRooms = useMemo(
    () =>
      new Set(
        overlappingMeetings
          .filter((meeting) => meeting.inPerson && meeting.location)
          .map((meeting) => meeting.location!.trim().toLowerCase()),
      ),
    [overlappingMeetings],
  );

  const roomConflict = useMemo(
    () =>
      Boolean(
        isInPerson &&
        selectedLocation &&
        occupiedRooms.has(selectedLocation.trim().toLowerCase()),
      ),
    [isInPerson, selectedLocation, occupiedRooms],
  );

  const hasAvailabilityConflict =
    participantConflicts.length > 0 || roomConflict;

  const toggleParticipant = (participantId: number) => {
    const nextParticipantIds = selectedParticipantIds.includes(participantId)
      ? selectedParticipantIds.filter((id) => id !== participantId)
      : [...selectedParticipantIds, participantId];
    setValue('participantIds', nextParticipantIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const closeModal = () => {
    onClose();
    setSubmitError(null);
  };

  const onSubmit = async (data: MeetingFormData) => {
    if (data.inPerson && !data.location) {
      setSubmitError('Selecione uma sala para a reunião presencial.');
      return;
    }

    if (hasAvailabilityConflict) {
      setSubmitError(
        'Escolha outro horário, participante ou sala antes de salvar a reunião.',
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateMeetingRequest = {
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

      if (data.participantIds && data.participantIds.length > 0) {
        for (const id of data.participantIds) {
          try {
            const participant = await userService.getUserDetails(id);
            if (participant.email) {
              await notificationService.sendEmail(
                participant.email,
                `Reunião agendada — ${data.title}`,
                `Você está convidado para uma reunião em ${data.date} às ${data.time} em ${data.location || (data.inPerson ? 'Presencial' : 'Online')}.`,
              );
            }
          } catch (err) {
            console.error(`Erro ao enviar e-mail para participante ${id}:`, err);
          }
        }
      }

      onCreated?.(createdMeeting);
      closeModal();
    } catch (error: unknown) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível criar a reunião.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-8">
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-climbe-primary">
            Nova reunião
          </p>
          <h2 className="text-3xl font-black tracking-tighter text-white italic">
            Criar reunião
          </h2>
          <p className="text-sm text-slate-300">
            Preencha os dados abaixo para agendar a reunião.
          </p>
        </div>

        <form className="field-on-light space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Empresa
              </label>
              <select
                {...register('enterpriseId')}
                className="w-full rounded-xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/40"
              >
                <option value="">Selecione uma empresa...</option>
                {availableEnterprises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.tradeName || e.legalName}
                  </option>
                ))}
              </select>
              {errors.enterpriseId ? (
                <p className="ml-1 text-xs text-red-300">{errors.enterpriseId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Título
              </label>
              <Input
                {...register('title')}
                placeholder="Alinhamento Estratégico"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
              {errors.title ? (
                <p className="ml-1 text-xs text-red-300">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Data
              </label>
              <Input
                type="date"
                {...register('date')}
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
              {errors.date ? (
                <p className="ml-1 text-xs text-red-300">{errors.date.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Status
              </label>
              <Input
                {...register('status')}
                placeholder="AGENDADA"
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
              {errors.status ? (
                <p className="ml-1 text-xs text-red-300">{errors.status.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Horário de início
              </label>
              <Input
                type="time"
                step="1"
                {...register('time')}
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
              {errors.time ? (
                <p className="ml-1 text-xs text-red-300">{errors.time.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Horário de término
              </label>
              <Input
                type="time"
                step="1"
                {...register('endTime')}
                className="bg-white text-slate-900 placeholder:text-slate-400"
              />
              {errors.endTime ? (
                <p className="ml-1 text-xs text-red-300">{errors.endTime.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                {isInPerson ? 'Sala' : 'Link da reunião'}
              </label>
              {isInPerson ? (
                <select
                  value={selectedLocation || ''}
                  onChange={(event) =>
                    setValue('location', event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="w-full rounded-xl border border-transparent bg-white px-5 py-3 text-sm text-slate-900 outline-none transition-all focus:border-climbe-primary/40 focus:ring-2 focus:ring-climbe-primary/40"
                >
                  <option value="">Selecione uma sala...</option>
                  {meetingRooms.map((room) => {
                    const occupied = occupiedRooms.has(room.toLowerCase());
                    return (
                      <option key={room} value={room} disabled={occupied}>
                        {room}
                        {occupied ? ' (ocupada)' : ''}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <Input
                  {...register('location')}
                  placeholder="Link do Google Meet (opcional)"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              )}
              {errors.location ? (
                <p className="ml-1 text-xs text-red-300">{errors.location.message}</p>
              ) : null}
              {roomConflict ? (
                <p className="ml-1 text-xs text-red-300">Sala ocupada no horário selecionado.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Disponibilidade
              </label>
              <div
                className={`flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-semibold ${
                  hasAvailabilityConflict
                    ? 'bg-red-500/15 text-red-200'
                    : 'bg-white/5 text-climbe-primary'
                }`}
              >
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
            <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
              Participantes
            </label>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl bg-white p-3 text-slate-900">
              {isLoadingAvailability ? (
                <p className="px-2 py-3 text-sm text-slate-500">Carregando participantes...</p>
              ) : availableUsers.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500">
                  Nenhum usuário disponível para seleção.
                </p>
              ) : (
                availableUsers.map((participant) => {
                  const participantId = Number(participant.id);
                  const participantHasConflict = conflictingParticipantIds.has(participantId);

                  return (
                    <label
                      key={participant.id}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedParticipantIds.includes(participantId)}
                          onChange={() => toggleParticipant(participantId)}
                          disabled={
                            participantHasConflict &&
                            !selectedParticipantIds.includes(participantId)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
                        />
                        <span>
                          <span className="block text-sm font-bold">{participant.fullName}</span>
                          <span className="block text-xs text-slate-500">{participant.email}</span>
                        </span>
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                          participantHasConflict ? 'text-red-500' : 'text-climbe-primary'
                        }`}
                      >
                        {participantHasConflict ? 'Ocupado' : 'Livre'}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {participantConflicts.length > 0 ? (
              <p className="ml-1 text-xs text-red-300">
                Um ou mais participantes possuem reunião nesse horário.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
              Pauta
            </label>
            <textarea
              {...register('agenda')}
              rows={5}
              className="flex min-h-28 w-full rounded-xl border-transparent bg-white px-5 py-3 text-sm font-light text-slate-900 transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climbe-primary/50"
              placeholder="1. Apresentação dos resultados&#10;2. Definição de metas"
            />
            {errors.agenda ? (
              <p className="ml-1 text-xs text-red-300">{errors.agenda.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-4">
            <input
              type="checkbox"
              checked={isInPerson}
              onChange={(event) => {
                setValue('inPerson', event.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue('location', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className="h-4 w-4 rounded border-gray-300 text-climbe-primary focus:ring-climbe-primary"
            />
            <div>
              <p className="text-sm font-bold text-white">Reunião presencial</p>
              <p className="text-xs text-slate-300">
                Desmarque para indicar uma reunião online.
              </p>
            </div>
          </div>

          {submitError ? (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              className="font-bold text-climbe-primary hover:bg-white/10 hover:text-climbe-primary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingAvailability ||
                availabilityError ||
                hasAvailabilityConflict
              }
              className="gap-2 bg-climbe-primary font-black italic text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <Plus size={16} /> Salvar reunião
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
