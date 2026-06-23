import { useEffect, useState } from 'react';
import { Calendar, CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { meetingService } from '@/features/reunioes/services';
import { MeetingCreateModal } from '@/features/reunioes/components';
import type { Meeting } from '@/features/reunioes/types';
import type { PaginatedResponse } from '@/types/pagination';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

const formatToday = () =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

const formatMeetingTime = (meeting: Partial<Meeting>) => {
  const startTime = meeting.time?.slice(0, 5);
  const endTime = meeting.endTime?.slice(0, 5);

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return 'Horário indisponível';
};

const formatMeetingSummary = (meeting: Meeting) =>
  meeting.title || 'Reunião sem título';

export function ReunioesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>();
  const [meetingsResponse, setMeetingsResponse] =
    useState<PaginatedResponse<Meeting> | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  useEffect(() => {
    const requestedDate = searchParams.get('date');

    if (searchParams.get('create') !== '1') {
      return;
    }

    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      setCreateInitialDate(requestedDate);
    }

    setIsCreateOpen(true);
    const remainingParams = new URLSearchParams(searchParams);
    remainingParams.delete('date');
    remainingParams.delete('create');
    setSearchParams(remainingParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let isActive = true;

    const loadMeetings = async () => {
      setIsLoadingMeetings(true);
      setMeetingsError(null);

      try {
        const response = await meetingService.listMeetings(page, pageSize);

        if (!isActive) {
          return;
        }

        setMeetingsResponse(response);
        setMeetings(response.content || []);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setMeetings([]);
        setMeetingsError(
          getApiErrorMessage(error, 'Não foi possível carregar as reuniões.'),
        );
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

  const handleMeetingCreated = (createdMeeting: Meeting) => {
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
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-climbe-primary">
            <Calendar size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Agenda
            </span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">
            Reuniões
          </h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Acompanhe seus próximos compromissos, veja a data de hoje e agende
            novas reuniões com parceiros.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[28px] border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-climbe-secondary">
            <CalendarDays size={18} className="text-climbe-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Hoje
            </span>
          </div>
          <p className="text-lg font-black italic text-climbe-secondary capitalize">
            {formatToday()}
          </p>
          <Button
            type="button"
            onClick={() => {
              setCreateInitialDate(undefined);
              setIsCreateOpen(true);
            }}
            className="w-fit gap-2 self-start"
          >
            <Plus size={16} />
            Criar reunião
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-climbe-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-climbe-primary">
              {meetingsResponse?.totalElements ?? meetings.length} reuniões
              cadastradas
            </span>
          </div>

          {meetingsError ? (
            <p className="text-sm font-semibold text-red-500">
              {meetingsError}
            </p>
          ) : null}

          {isLoadingMeetings ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 rounded-3xl border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {meeting.status}
                      </span>
                      <h4 className="text-lg font-black italic text-climbe-secondary">
                        {formatMeetingSummary(meeting)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {meeting.enterpriseName ||
                          (meeting.enterpriseId
                            ? `Empresa #${meeting.enterpriseId}`
                            : 'Empresa não informada')}
                      </p>
                      <p className="text-sm font-semibold text-climbe-secondary">
                        {meeting.date
                          ? new Date(`${meeting.date}T12:00:00`).toLocaleDateString(
                              'pt-BR',
                            )
                          : 'Data indisponível'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatMeetingTime(meeting)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-400">
              Página {(meetingsResponse?.number ?? page) + 1} de{' '}
              {meetingsResponse?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 0 || isLoadingMeetings}
                onClick={() =>
                  setPage((currentPage) => Math.max(currentPage - 1, 0))
                }
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  isLoadingMeetings ||
                  !meetingsResponse ||
                  page >= meetingsResponse.totalPages - 1
                }
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MeetingCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleMeetingCreated}
        initialDate={createInitialDate}
      />
    </div>
  );
}
