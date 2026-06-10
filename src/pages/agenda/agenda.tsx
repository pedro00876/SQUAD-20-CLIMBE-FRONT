import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Briefcase, Plus, Grid, CalendarRange, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { meetingService, type MeetingDTO } from '@/features/reunioes/services';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Event {
  id: string;
  summary: string;
  start: { dateTime: string; date: string };
  description?: string;
  enterpriseName?: string;
  time?: string;
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
  description: meeting.location || '',
  enterpriseName: meeting.enterpriseName || '',
  time: meeting.time || '00:00',
});

type CalendarView = 'month' | 'week' | 'day';

export function AgendaPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch meetings from backend
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

          if (!isActive) return;

          scheduledMeetings.push(
            ...(response.content || [])
              .filter((meeting) => meeting.status?.toUpperCase() === 'AGENDADA')
              .map(toCalendarEvent)
          );
          currentPage += 1;
        }
        setEvents(scheduledMeetings);
      } catch (requestError: any) {
        if (!isActive) return;
        setEvents([]);
        setError(requestError?.response?.data?.message || 'Não foi possível carregar as reuniões.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadMeetings();
    return () => {
      isActive = false;
    };
  }, []);

  // Filter events of the current month (for helper metrics)
  const monthEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
    });
  }, [currentDate, events]);

  // Group events by YYYY-MM-DD
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Event[]>();
    events.forEach((event) => {
      const key = format(new Date(event.start.dateTime || event.start.date), 'yyyy-MM-dd');
      const current = grouped.get(key) || [];
      current.push(event);
      grouped.set(key, current);
    });
    return grouped;
  }, [events]);

  // List of upcoming events
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.start.dateTime).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 5);
  }, [events]);

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const navigateToCreateMeeting = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    navigate(`${routes.reunioes}?create=1&date=${formattedDate}`);
  };

  // Month View day list calculations
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Week View day list calculations
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Hours array for week/day views (8 AM to 7 PM)
  const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8); // [8, 9, 10, ..., 19]

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-climbe-primary">
            <CalendarIcon size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Planejamento</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Agenda</h1>
          <p className="text-gray-400 font-light max-w-2xl mt-1">
            Gerencie e organize suas reuniões, compromissos e integrações integradas com a sua conta Climbe.
          </p>
        </div>

        {/* View toggles & Create Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/80 p-1 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'month' ? 'bg-climbe-primary text-climbe-secondary font-black' : 'text-gray-500 hover:text-climbe-secondary'}`}
            >
              <Grid size={14} /> Mês
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'week' ? 'bg-climbe-primary text-climbe-secondary font-black' : 'text-gray-500 hover:text-climbe-secondary'}`}
            >
              <CalendarRange size={14} /> Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'day' ? 'bg-climbe-primary text-climbe-secondary font-black' : 'text-gray-500 hover:text-climbe-secondary'}`}
            >
              <CalendarDays size={14} /> Dia
            </button>
          </div>

          <Button
            onClick={() => navigateToCreateMeeting(new Date())}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Nova Reunião
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 hover:bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-700 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>

          <span className="text-lg font-black text-climbe-secondary italic ml-2">
            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            {view === 'week' && `Semana de ${format(weekDays[0], 'dd/MM')} a ${format(weekDays[6], 'dd/MM/yyyy')}`}
            {view === 'day' && format(currentDate, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="text-xs text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-climbe-primary animate-pulse" />
          {monthEvents.length} Reuniões em {format(currentDate, 'MMMM', { locale: ptBR })}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (Upcoming events) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming commitments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-climbe-secondary italic text-sm">Próximos Compromissos</h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">Sincronizado da API</p>
              </div>
              <Clock size={16} className="text-gray-300" />
            </div>

            {error && <p className="text-xs text-red-500 font-semibold mb-4">{error}</p>}

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`${routes.reunioes}?id=${event.id}`)}
                    className="p-4 bg-gray-50/50 hover:bg-climbe-primary/5 border border-gray-100 hover:border-climbe-primary/30 rounded-2xl transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-climbe-primary/10 group-hover:bg-climbe-primary/20 flex items-center justify-center text-climbe-primary shrink-0 transition-colors">
                      <Clock size={15} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-climbe-secondary truncate italic group-hover:text-climbe-primary transition-colors">
                        {event.summary}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-light mt-0.5">
                        {format(new Date(event.start.dateTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {event.enterpriseName && (
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-2 font-medium">
                          <Briefcase size={10} />
                          <span className="truncate">{event.enterpriseName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-400 font-light">
                  Nenhuma reunião agendada em breve.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Main Area (Dynamic Views Month/Week/Day) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* MONTH VIEW */}
            {view === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden"
              >
                {/* Header Grid */}
                <div className="grid grid-cols-7 gap-2 border-b border-gray-50 pb-4 mb-4 text-center">
                  {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, i) => (
                    <div key={i} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span className="hidden sm:inline">{dayName}</span>
                      <span className="sm:hidden">{dayName.charAt(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 min-h-[500px]">
                  {monthDays.map((day, idx) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDay.get(dayKey) || [];
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={idx}
                        onClick={() => navigateToCreateMeeting(day)}
                        className={`
                          min-h-[90px] border border-gray-50/50 rounded-2xl p-2.5 flex flex-col justify-between group cursor-pointer transition-all hover:bg-gray-50/50 hover:border-climbe-primary/20
                          ${isToday(day) ? 'bg-climbe-primary/5 border-climbe-primary/40 text-climbe-primary' : 'bg-white'}
                          ${!isCurrentMonth ? 'opacity-40 hover:opacity-75' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold leading-none ${isToday(day) ? 'bg-climbe-primary text-climbe-secondary h-6 w-6 rounded-full flex items-center justify-center font-black shadow-sm' : 'text-slate-600'}`}>
                            {format(day, 'd')}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-[9px] font-black bg-climbe-secondary text-white px-2 py-0.5 rounded-full shrink-0">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Events list preview */}
                        <div className="space-y-1 mt-2 overflow-hidden flex-1 flex flex-col justify-end">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`${routes.reunioes}?id=${event.id}`);
                              }}
                              className="text-[9px] font-black uppercase tracking-tight bg-climbe-primary/10 border border-climbe-primary/20 text-climbe-secondary rounded-lg px-2 py-1 truncate hover:bg-climbe-primary/25 transition-colors"
                              title={event.summary}
                            >
                              {event.time} {event.summary}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center py-0.5 bg-gray-50 rounded-lg">
                              + {dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* WEEK VIEW */}
            {view === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden"
              >
                {/* Horizontal hours grid view */}
                <div className="grid grid-cols-8 gap-2 border-b border-gray-50 pb-4 mb-4">
                  {/* Empty top-left cell */}
                  <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center self-end">Hora</div>
                  {weekDays.map((day, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigateToCreateMeeting(day)}
                      className={`text-center p-2 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors ${isToday(day) ? 'bg-climbe-primary/10 text-climbe-primary border border-climbe-primary/30' : ''}`}
                    >
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{format(day, 'E', { locale: ptBR })}</p>
                      <p className={`text-base font-black italic tracking-tighter ${isToday(day) ? 'text-climbe-secondary font-black' : 'text-slate-800'}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Grid Rows for hours */}
                <div className="divide-y divide-gray-50 h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {hoursOfDay.map((hour) => {
                    const timeString = `${String(hour).padStart(2, '0')}:00`;
                    return (
                      <div key={hour} className="grid grid-cols-8 gap-2 py-4 items-center group">
                        {/* Hour Label */}
                        <div className="text-[10px] font-black text-gray-400 text-center">{timeString}</div>

                        {/* Week days for this hour */}
                        {weekDays.map((day, dIdx) => {
                          const dayKey = format(day, 'yyyy-MM-dd');
                          const dayEvents = eventsByDay.get(dayKey) || [];
                          // Find events matching this hour
                          const hourEvents = dayEvents.filter(e => e.time?.startsWith(String(hour).padStart(2, '0')) || e.time?.startsWith(String(hour)));

                          return (
                            <div
                              key={dIdx}
                              onClick={() => navigateToCreateMeeting(day)}
                              className="relative min-h-[50px] border border-dashed border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer p-1"
                            >
                              {hourEvents.map((event) => (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`${routes.reunioes}?id=${event.id}`);
                                  }}
                                  className="absolute inset-x-1 py-1 px-2 rounded-lg bg-climbe-primary border border-climbe-primary/30 text-climbe-secondary text-[9px] font-black uppercase tracking-tight shadow-sm truncate hover:bg-climbe-primary/95 hover:scale-[1.02] transition-all"
                                  title={`${event.summary} (${event.time})`}
                                >
                                  {event.summary}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DAY VIEW */}
            {view === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-climbe-primary/10 rounded-2xl flex items-center justify-center text-climbe-primary">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-climbe-secondary italic leading-tight">Timeline do Dia</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Grade de Horas</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateToCreateMeeting(currentDate)}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Novo Horário
                  </Button>
                </div>

                <div className="divide-y divide-gray-50 max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
                  {hoursOfDay.map((hour) => {
                    const timeString = `${String(hour).padStart(2, '0')}:00`;
                    const dayKey = format(currentDate, 'yyyy-MM-dd');
                    const dayEvents = eventsByDay.get(dayKey) || [];
                    const hourEvents = dayEvents.filter(e => e.time?.startsWith(String(hour).padStart(2, '0')) || e.time?.startsWith(String(hour)));

                    return (
                      <div key={hour} className="grid grid-cols-12 gap-4 py-6 items-start hover:bg-gray-50/30 transition-colors px-2 rounded-2xl">
                        {/* Hour marker */}
                        <div className="col-span-2 text-xs font-black text-gray-400 self-center">{timeString}</div>

                        {/* Events content */}
                        <div className="col-span-10 min-h-[40px] flex flex-col gap-2">
                          {hourEvents.length > 0 ? (
                            hourEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${routes.reunioes}?id=${event.id}`);
                                }}
                                className="p-4 rounded-2xl bg-climbe-primary/10 border border-climbe-primary/30 text-climbe-secondary hover:bg-climbe-primary/15 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                              >
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider italic text-climbe-secondary group-hover:text-climbe-secondary/80 transition-colors">
                                    {event.summary}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-light mt-1 flex items-center gap-1">
                                    <Clock size={11} /> {event.time}
                                    {event.enterpriseName && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <Briefcase size={11} /> {event.enterpriseName}
                                      </>
                                    )}
                                  </p>
                                </div>

                                {event.description && (
                                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-white/60 px-3 py-1 rounded-xl self-start sm:self-auto">
                                    <MapPin size={11} className="text-climbe-primary" />
                                    <span>{event.description}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div
                              onClick={() => navigateToCreateMeeting(currentDate)}
                              className="h-10 border border-dashed border-gray-100 hover:border-gray-200 rounded-xl transition-all cursor-pointer flex items-center justify-center text-[10px] text-gray-300 hover:text-gray-400 font-bold uppercase tracking-widest"
                            >
                              Clique para agendar às {timeString}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
