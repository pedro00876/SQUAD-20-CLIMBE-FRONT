import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Briefcase, Plus,
  Grid, CalendarRange, CalendarDays, List, Video, Users,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '@/config/routes';
import { meetingService } from '@/features/reunioes/services';
import type { Meeting } from '@/features/reunioes/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MeetingCreateModal } from '@/features/reunioes/components';

// ─── Helpers ────────────────────────────────────────────────────────────────

type CalendarView = 'month' | 'week' | 'day';

const toEventDate = (meeting: Meeting) => {
  const candidate = new Date(`${meeting.date}T${meeting.time}`);
  return Number.isNaN(candidate.getTime()) ? new Date(meeting.date) : candidate;
};

interface Event {
  id: string;
  summary: string;
  start: { dateTime: string; date: string };
  description?: string;
  enterpriseName?: string;
  enterpriseId?: number;
  time?: string;
  inPerson?: boolean;
}

const toCalendarEvent = (meeting: Meeting): Event => ({
  id: String(meeting.id),
  summary: meeting.title || 'Reunião sem título',
  start: {
    dateTime: toEventDate(meeting).toISOString(),
    date: meeting.date,
  },
  description: meeting.location || '',
  enterpriseName: meeting.enterpriseName || '',
  enterpriseId: meeting.enterpriseId,
  time: meeting.time || '00:00',
  inPerson: meeting.inPerson,
});

// ─── Meeting list card ───────────────────────────────────────────────────────

function MeetingCard({ meeting, onClickEnterprise }: { meeting: Meeting; onClickEnterprise: (id: number) => void }) {
  const date = toEventDate(meeting);
  const todayFlag = isToday(date);
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-md ${todayFlag ? 'border-climbe-primary/40 bg-climbe-primary/5' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold italic text-climbe-secondary text-sm truncate">{meeting.title}</h4>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
            {format(date, "dd 'de' MMMM", { locale: ptBR })} · {meeting.time}
          </p>
          {meeting.enterpriseName && (
            <button
              onClick={() => meeting.enterpriseId && onClickEnterprise(meeting.enterpriseId)}
              className="mt-2 flex items-center gap-1 text-[10px] font-bold text-climbe-primary hover:underline"
            >
              <Briefcase size={10} />
              {meeting.enterpriseName}
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {todayFlag && (
            <span className="bg-climbe-primary text-climbe-secondary text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Hoje
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${meeting.inPerson ? 'text-teal-600' : 'text-indigo-500'}`}>
            {meeting.inPerson ? <Users size={10} /> : <Video size={10} />}
            {meeting.inPerson ? 'Presencial' : 'Online'}
          </span>
        </div>
      </div>
      {meeting.location && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
          <MapPin size={10} className="text-climbe-primary" />
          <span className="truncate">{meeting.location}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function AgendaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('view');
  const tab: 'calendario' | 'lista' = tabParam === 'lista' ? 'lista' : 'calendario';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calView, setCalView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>();

  const setTab = (t: 'calendario' | 'lista') => setSearchParams({ view: t }, { replace: true });

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

  // Fetch meetings
  const { data: meetingsPage } = useQuery({
    queryKey: ['meetings-agenda'],
    queryFn: () => meetingService.listMeetings(0, 200),
  });

  const allMeetings: Meeting[] = useMemo(() => meetingsPage?.content ?? [], [meetingsPage]);

  useEffect(() => {
    setLoading(!meetingsPage);
    if (meetingsPage) {
      setEvents(
        (meetingsPage.content ?? [])
          .filter(m => m.status?.toUpperCase() !== 'CANCELADA')
          .map(toCalendarEvent)
      );
    }
  }, [meetingsPage]);

  const monthEvents = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.start.dateTime || e.start.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }),
    [currentDate, events],
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Event[]>();
    events.forEach(e => {
      const key = format(new Date(e.start.dateTime || e.start.date), 'yyyy-MM-dd');
      grouped.set(key, [...(grouped.get(key) ?? []), e]);
    });
    return grouped;
  }, [events]);

  const upcomingEvents = useMemo(() =>
    [...events]
      .filter(e => new Date(e.start.dateTime).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 5),
    [events],
  );

  // Sort meetings for list view
  const sortedMeetings = useMemo(() =>
    [...allMeetings].sort((a, b) => {
      const da = toEventDate(a).getTime();
      const db = toEventDate(b).getTime();
      return da - db;
    }),
    [allMeetings],
  );

  const handlePrev = () => {
    if (calView === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (calView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (calView === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (calView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate)),
    });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
  }, [currentDate]);

  const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-climbe-primary">
            <CalendarIcon size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Planejamento</span>
          </div>
          <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Agenda & Reuniões</h1>
          <p className="text-gray-400 font-light max-w-2xl mt-1">
            Calendário e lista de reuniões unificados. Cada evento está vinculado à empresa correspondente.
          </p>
        </div>

        <Button
          onClick={() => {
            setCreateInitialDate(format(new Date(), 'yyyy-MM-dd'));
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-climbe-primary px-6 py-6 font-black text-climbe-secondary shadow-lg shadow-climbe-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={16} /> Nova Reunião
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white/90 dark:bg-zinc-900/90 p-1 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-1 self-start w-fit">
        <button
          onClick={() => setTab('calendario')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${tab === 'calendario' ? 'bg-climbe-primary text-climbe-secondary font-black' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <CalendarIcon size={14} /> Calendário
        </button>
        <button
          onClick={() => setTab('lista')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${tab === 'lista' ? 'bg-climbe-primary text-climbe-secondary font-black' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <List size={14} /> Lista
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'calendario' && (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Calendar view toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors" aria-label="Anterior">
                  <ChevronLeft size={18} className="text-slate-600 dark:text-zinc-400" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors">
                  Hoje
                </button>
                <button onClick={handleNext} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors" aria-label="Próximo">
                  <ChevronRight size={18} className="text-slate-600 dark:text-zinc-400" />
                </button>
                <span className="text-lg font-black text-slate-900 dark:text-white ml-2">
                  {calView === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  {calView === 'week' && `Semana de ${format(weekDays[0], 'dd/MM')} a ${format(weekDays[6], 'dd/MM/yyyy')}`}
                  {calView === 'day' && format(currentDate, "eeee, dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-zinc-400 font-bold bg-slate-50 dark:bg-zinc-900/90 px-4 py-2 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-climbe-primary animate-pulse" />
                  {monthEvents.length} em {format(currentDate, 'MMM', { locale: ptBR })}
                </span>
                <div className="bg-white/90 dark:bg-zinc-900/90 p-1 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-1">
                  {([['month', <Grid key="g" size={14} />, 'Mês'], ['week', <CalendarRange key="cr" size={14} />, 'Semana'], ['day', <CalendarDays key="cd" size={14} />, 'Dia']] as const).map(([v, icon, label]) => (
                    <button
                      key={v}
                      onClick={() => setCalView(v as CalendarView)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${calView === v ? 'bg-climbe-primary text-climbe-secondary' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Upcoming sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">Próximos Compromissos</h3>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">Reuniões agendadas</p>
                    </div>
                    <Clock size={16} className="text-gray-300" />
                  </div>
                  {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
                  <div className="space-y-3">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
                      ))
                    ) : upcomingEvents.length > 0 ? (
                      upcomingEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => event.enterpriseId && navigate(`${routes.empresas}/${event.enterpriseId}`)}
                          className="p-4 bg-gray-50/50 hover:bg-climbe-primary/5 border border-gray-100 hover:border-climbe-primary/30 rounded-2xl transition-all cursor-pointer group flex items-start gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-climbe-primary/10 group-hover:bg-climbe-primary/20 flex items-center justify-center text-climbe-primary shrink-0">
                            <Clock size={15} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-xs font-bold text-climbe-secondary truncate italic group-hover:text-climbe-primary">
                              {event.summary}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {format(new Date(event.start.dateTime), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                            </p>
                            {event.enterpriseName && (
                              <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-2">
                                <Briefcase size={10} />
                                <span className="truncate">{event.enterpriseName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400">
                        Nenhuma reunião agendada em breve.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Calendar main area */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {calView === 'month' && (
                    <motion.div key="month" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-7 gap-2 border-b border-gray-50 pb-4 mb-4 text-center">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                          <div key={i} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2 min-h-[500px]">
                        {monthDays.map((day, idx) => {
                          const dayKey = format(day, 'yyyy-MM-dd');
                          const dayEvents = eventsByDay.get(dayKey) ?? [];
                          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                          return (
                            <div key={idx} className={`min-h-[90px] border border-gray-50/50 rounded-2xl p-2.5 flex flex-col justify-between group cursor-pointer transition-all hover:bg-gray-50/50 hover:border-climbe-primary/20 ${isToday(day) ? 'bg-climbe-primary/5 border-climbe-primary/40' : 'bg-white'} ${!isCurrentMonth ? 'opacity-40 hover:opacity-75' : ''}`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold leading-none ${isToday(day) ? 'bg-climbe-primary text-climbe-secondary h-6 w-6 rounded-full flex items-center justify-center font-black shadow-sm' : 'text-slate-600'}`}>
                                  {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                  <span className="text-[9px] font-black bg-climbe-secondary text-white px-2 py-0.5 rounded-full shrink-0">{dayEvents.length}</span>
                                )}
                              </div>
                              <div className="space-y-1 mt-2 overflow-hidden flex-1 flex flex-col justify-end">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div key={event.id}
                                    onClick={e => { e.stopPropagation(); event.enterpriseId && navigate(`${routes.empresas}/${event.enterpriseId}`); }}
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

                  {calView === 'week' && (
                    <motion.div key="week" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-8 gap-2 border-b border-gray-50 pb-4 mb-4">
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center self-end">Hr</div>
                        {weekDays.map((day, idx) => (
                          <div key={idx} className={`text-center p-2 rounded-2xl ${isToday(day) ? 'bg-climbe-primary/10 text-climbe-primary border border-climbe-primary/30' : ''}`}>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{format(day, 'E', { locale: ptBR })}</p>
                            <p className={`text-base font-black italic tracking-tighter ${isToday(day) ? 'text-climbe-secondary' : 'text-slate-800'}`}>{format(day, 'd')}</p>
                          </div>
                        ))}
                      </div>
                      <div className="divide-y divide-gray-50 h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {hoursOfDay.map(hour => (
                          <div key={hour} className="grid grid-cols-8 gap-2 py-4 items-center">
                            <div className="text-[10px] font-black text-gray-400 text-center">{String(hour).padStart(2, '0')}:00</div>
                            {weekDays.map((day, dIdx) => {
                              const dayKey = format(day, 'yyyy-MM-dd');
                              const hourEvents = (eventsByDay.get(dayKey) ?? []).filter(e =>
                                e.time?.startsWith(String(hour).padStart(2, '0')) || e.time?.startsWith(String(hour)),
                              );
                              return (
                                <div key={dIdx} className="relative min-h-[50px] border border-dashed border-transparent hover:border-gray-200 rounded-xl transition-all p-1">
                                  {hourEvents.map(event => (
                                    <div key={event.id}
                                      onClick={() => event.enterpriseId && navigate(`${routes.empresas}/${event.enterpriseId}`)}
                                      className="absolute inset-x-1 py-1 px-2 rounded-lg bg-climbe-primary border border-climbe-primary/30 text-climbe-secondary text-[9px] font-black uppercase tracking-tight shadow-sm truncate hover:bg-climbe-primary/95 hover:scale-[1.02] transition-all cursor-pointer"
                                      title={event.summary}
                                    >
                                      {event.summary}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {calView === 'day' && (
                    <motion.div key="day" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                      <div className="divide-y divide-gray-50 max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
                        {hoursOfDay.map(hour => {
                          const timeString = `${String(hour).padStart(2, '0')}:00`;
                          const dayKey = format(currentDate, 'yyyy-MM-dd');
                          const hourEvents = (eventsByDay.get(dayKey) ?? []).filter(e =>
                            e.time?.startsWith(String(hour).padStart(2, '0')) || e.time?.startsWith(String(hour)),
                          );
                          return (
                            <div key={hour} className="grid grid-cols-12 gap-4 py-6 items-start hover:bg-gray-50/30 transition-colors px-2 rounded-2xl">
                              <div className="col-span-2 text-xs font-black text-gray-400 self-center">{timeString}</div>
                              <div className="col-span-10 min-h-[40px] flex flex-col gap-2">
                                {hourEvents.length > 0 ? hourEvents.map(event => (
                                  <div key={event.id}
                                    onClick={() => event.enterpriseId && navigate(`${routes.empresas}/${event.enterpriseId}`)}
                                    className="p-4 rounded-2xl bg-climbe-primary/10 border border-climbe-primary/30 text-climbe-secondary hover:bg-climbe-primary/15 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div>
                                      <h4 className="text-xs font-black uppercase tracking-wider italic">{event.summary}</h4>
                                      <p className="text-[10px] text-gray-500 font-light mt-1 flex items-center gap-1">
                                        <Clock size={11} /> {event.time}
                                        {event.enterpriseName && <><span className="mx-1">·</span><Briefcase size={11} /> {event.enterpriseName}</>}
                                      </p>
                                    </div>
                                    {event.description && (
                                      <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/60 px-3 py-1 rounded-xl self-start sm:self-auto">
                                        <MapPin size={11} className="text-climbe-primary" />
                                        <span>{event.description}</span>
                                      </div>
                                    )}
                                  </div>
                                )) : (
                                  <div className="h-10 border border-dashed border-gray-100 hover:border-gray-200 rounded-xl transition-all flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                    Sem reuniões às {timeString}
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
          </motion.div>
        )}

        {tab === 'lista' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {sortedMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <CalendarDays size={48} className="mb-4 text-gray-200" />
                <h3 className="text-lg font-bold text-gray-400">Nenhuma reunião cadastrada</h3>
                <p className="mt-1 text-sm text-gray-300">Use o botão "Nova Reunião" para criar a primeira reunião.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedMeetings.map(meeting => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClickEnterprise={(id) => navigate(`${routes.empresas}/${id}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MeetingCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ['meetings-agenda'] });
        }}
        initialDate={createInitialDate}
      />
    </div>
  );
}
