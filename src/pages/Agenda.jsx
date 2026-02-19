
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, addDays, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventDialog from "../components/agenda/EventDialog";
import EventList from "../components/agenda/EventList";

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        await base44.auth.me();
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list('-data_inicio'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const expandRecurringEvents = (eventos) => {
    const expandedEvents = [];
    const endOfCurrentMonth = endOfMonth(currentMonth);

    eventos.forEach(evento => {
      if (evento.recorrencia === 'nenhuma') {
        expandedEvents.push(evento);
      } else {
        const startDate = parseISO(evento.data_inicio);
        const endDate = evento.recorrencia_ate ? parseISO(evento.recorrencia_ate) : endOfCurrentMonth;
        const duration = parseISO(evento.data_fim).getTime() - startDate.getTime();

        let currentDate = startDate;
        let count = 0;
        const maxOccurrences = 365; // Limite de segurança

        while (currentDate <= endDate && count < maxOccurrences) {
          let shouldInclude = false;

          if (evento.recorrencia === 'dias_especificos') {
            // Para dias específicos, verificar se o dia da semana está na lista
            const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
            // Assuming evento.dias_semana stores numbers 0-6
            shouldInclude = Array.isArray(evento.dias_semana) && evento.dias_semana.includes(dayOfWeek);
          } else {
            // Para outras recorrências, sempre incluir
            shouldInclude = true;
          }

          if (shouldInclude && currentDate >= startOfMonth(subMonths(currentMonth, 1)) && currentDate <= endOfMonth(addMonths(currentMonth, 1))) {
            expandedEvents.push({
              ...evento,
              id: `${evento.id}_${currentDate.getTime()}`,
              data_inicio: currentDate.toISOString(),
              data_fim: new Date(currentDate.getTime() + duration).toISOString(),
              isRecurring: true,
              originalId: evento.id
            });
          }

          switch (evento.recorrencia) {
            case 'diaria':
              currentDate = addDays(currentDate, 1);
              break;
            case 'semanal':
              currentDate = addWeeks(currentDate, 1);
              break;
            case 'dias_especificos':
              currentDate = addDays(currentDate, 1); // For specific days, we still advance day by day to check
              break;
            case 'mensal':
              currentDate = addMonths(currentDate, 1);
              break;
            default:
              currentDate = endDate;
          }
          count++;
        }
      }
    });

    return expandedEvents;
  };

  const allEvents = expandRecurringEvents(eventos);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const previousMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => null);

  const getEventsForDay = (day) => {
    return allEvents.filter(evento => {
      const eventoDate = parseISO(evento.data_inicio);
      return isSameDay(eventoDate, day);
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Agenda</h1>
            <p className="text-purple-200">Organize seus compromissos e eventos</p>
          </div>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Evento
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="bg-purple-800/30 border-purple-500/30 text-white hover:bg-purple-800/50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(new Date());
                    }}
                    className="bg-purple-800/30 border-purple-500/30 text-white hover:bg-purple-800/50"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="bg-purple-800/30 border-purple-500/30 text-white hover:bg-purple-800/50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-purple-200 font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {previousMonthDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                
                {daysInMonth.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-2 rounded-lg transition-all duration-200 relative
                        ${isSelected ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-purple-800/20 text-white hover:bg-purple-800/40'}
                        ${isToday && !isSelected ? 'ring-2 ring-purple-400' : ''}
                      `}
                    >
                      <div className="text-sm font-semibold">{format(day, 'd')}</div>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((evento, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: evento.cor || '#6366F1' }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div>
            <EventList
              selectedDate={selectedDate}
              events={selectedDayEvents}
              onEdit={(event) => {
                if (event.isRecurring) {
                  // When editing a recurring instance, we want to edit the original event
                  const originalEvent = eventos.find(e => e.id === event.originalId);
                  setEditingEvent(originalEvent);
                } else {
                  setEditingEvent(event);
                }
                setDialogOpen(true);
              }}
            />
          </div>
        </div>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          event={editingEvent}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
