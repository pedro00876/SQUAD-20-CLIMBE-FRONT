import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  summary: string;
  start: { dateTime: string; date: string };
  description?: string;
}

export function GoogleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock events for demonstration since we might not have a real Google token yet
  useEffect(() => {
    setEvents([
      {
        id: '1',
        summary: 'Reunião de Alinhamento - Climbe',
        start: { dateTime: new Date().toISOString(), date: '' },
        description: 'Discussão sobre o novo dashboard'
      },
      {
        id: '2',
        summary: 'Apresentação de Proposta',
        start: { dateTime: new Date(Date.now() + 86400000).toISOString(), date: '' },
      }
    ]);
  }, []);

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
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
          <div key={day} className="text-[10px] font-black text-gray-300 text-center py-2 uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>

      <div className="p-4 grid grid-cols-7 gap-1 flex-1">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.start.dateTime || e.start.date), day));
          return (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-colors
                ${isToday(day) ? 'bg-climbe-primary text-climbe-secondary font-bold' : 'hover:bg-gray-50 text-gray-600'}
                ${dayEvents.length > 0 && !isToday(day) ? 'bg-climbe-primary/5' : ''}
              `}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className={`w-1 h-1 rounded-full absolute bottom-2 ${isToday(day) ? 'bg-climbe-secondary' : 'bg-climbe-primary'}`} />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-6 bg-gray-50/50 mt-auto border-t border-gray-50">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Próximos Compromissos</h4>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {events.slice(0, 2).map(event => (
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
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
