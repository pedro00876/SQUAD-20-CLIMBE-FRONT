import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { meetingService, type MeetingDTO } from '@/features/reunioes/services';

interface Event {
  id: string;
  summary: string;
  start: { dateTime: string; date: string };
  description?: string;
}

const toEventDate = (meeting: MeetingDTO) => {
  const candidate = new Date(`${meeting.date}T${meeting.time}`);

  if (!Number.isNaN(candidate.getTime())) {
    return candidate;
  }

  return new Date(meeting.date);
};

const toCalendarEvent = (meeting: MeetingDTO): Event => ({
  id: String(meeting.id),
  summary: meeting.title || 'Reunião sem título',
  start: {
    dateTime: toEventDate(meeting).toISOString(),
    date: meeting.date,
  },
  description: meeting.location || meeting.enterpriseName || '',
});

export function GoogleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMeetings = async () => {
      setLoading(true);
      setError(null);

      try {
        const scheduledMeetings: Event[] = [];
        let currentPage = 0;
        let totalPages = 1;

        while (currentPage < totalPages) {
          const response = await meetingService.listMeetings({ page: currentPage, size: 100, sort: 'date,asc' });
          totalPages = response.totalPages || 1;

          if (!isActive) {
            return;
          }

          scheduledMeetings.push(
            ...(response.content || [])
              .filter((meeting) => meeting.status?.toUpperCase() === 'AGENDADA')
              .map(toCalendarEvent)
          );

          currentPage += 1;
        }

        setEvents(scheduledMeetings);
      } catch (requestError: any) {
        if (!isActive) {
          return;
        }

        setEvents([]);
        setError(requestError?.response?.data?.message || 'Não foi possível carregar as reuniões.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadMeetings();

    return () => {
      isActive = false;
    };
  }, []);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .sort((left, right) => new Date(left.start.dateTime || left.start.date).getTime() - new Date(right.start.dateTime || right.start.date).getTime())
        .slice(0, 3),
    [events]
  );

  const monthEvents = useMemo(
    () => events.filter((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    }),
    [currentMonth, events]
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Event[]>();

    monthEvents.forEach((event) => {
      const key = format(new Date(event.start.dateTime || event.start.date), 'yyyy-MM-dd');
      const current = grouped.get(key) || [];
      current.push(event);
      grouped.set(key, current);
    });

    return grouped;
  }, [monthEvents]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-climbe-primary/10 flex items-center justify-center text-climbe-primary">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-climbe-secondary italic leading-tight">Calendário</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Google Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-400" />
          </button>
          <span className="text-sm font-bold text-climbe-secondary min-w-[100px] text-center italic">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-7 gap-1 border-b border-gray-50">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="text-[10px] font-black text-gray-300 text-center py-2 uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>

      <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-climbe-primary/10 px-3 py-1 text-climbe-primary">
            {monthEvents.length} reuniões neste mês
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-climbe-primary" />
            Agenda
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-climbe-secondary" />
            Hoje
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-7 gap-1 flex-1">
        {days.map((day, idx) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const hasMeetings = dayEvents.length > 0;
          const displayCount = dayEvents.length > 9 ? '9+' : String(dayEvents.length);
          const eventPreview = dayEvents[0]?.summary || 'Reunião';
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`
                aspect-square rounded-xl flex flex-col items-start justify-between relative cursor-pointer transition-all px-2 py-2 text-left
                ${isToday(day) ? 'bg-climbe-primary text-white font-bold ring-2 ring-climbe-secondary/25 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'}
                ${hasMeetings && !isToday(day) ? 'border border-climbe-primary/20 bg-gradient-to-br from-climbe-primary/10 to-white shadow-sm' : ''}
              `}
            >
              <span className={`text-sm leading-none ${hasMeetings && !isToday(day) ? 'text-climbe-secondary font-bold' : ''}`}>{format(day, 'd')}</span>
              {hasMeetings && (
                <div className="w-full space-y-1">
                  <span className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tight ${isToday(day) ? 'bg-white/20 text-white' : 'bg-climbe-primary text-white'}`}>
                    {displayCount} reunião{dayEvents.length > 1 ? 'ões' : ''}
                  </span>
                  <p className={`text-[9px] leading-tight truncate ${isToday(day) ? 'text-white/80' : 'text-gray-400'}`}>
                    {eventPreview}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-6 bg-gray-50/50 mt-auto border-t border-gray-50">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Próximos Compromissos</h4>
        {error ? <p className="mb-4 text-xs font-semibold text-red-500">{error}</p> : null}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              </div>
            ) : upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-climbe-primary/10 flex items-center justify-center text-climbe-primary">
                  <Clock size={14} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-climbe-secondary truncate italic">{event.summary}</p>
                  <p className="text-[10px] text-gray-400">
                    {format(new Date(event.start.dateTime || event.start.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-xs text-gray-400">
                Nenhuma reunião agendada encontrada.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
