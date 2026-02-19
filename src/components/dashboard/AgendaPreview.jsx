import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isFuture, isToday, isSameDay, addDays, addWeeks, addMonths, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendaPreview({ eventos }) {
  const expandRecurringEvents = (eventos) => {
    const expandedEvents = [];
    const today = new Date();
    const endDate = addDays(today, 30); // Próximos 30 dias

    eventos.forEach(evento => {
      if (evento.recorrencia === 'nenhuma') {
        // Evento único
        const eventoDate = parseISO(evento.data_inicio);
        if (eventoDate >= startOfDay(today) && eventoDate <= endDate) {
          expandedEvents.push(evento);
        }
      } else {
        // Evento recorrente
        const startDate = parseISO(evento.data_inicio);
        const recurrenceEnd = evento.recorrencia_ate ? parseISO(evento.recorrencia_ate) : endDate;
        const duration = parseISO(evento.data_fim).getTime() - startDate.getTime();

        let currentDate = startDate;
        let count = 0;
        const maxOccurrences = 100;

        while (currentDate <= recurrenceEnd && currentDate <= endDate && count < maxOccurrences) {
          let shouldInclude = false;

          if (evento.recorrencia === 'dias_especificos') {
            const dayOfWeek = currentDate.getDay();
            shouldInclude = Array.isArray(evento.dias_semana) && evento.dias_semana.includes(dayOfWeek);
          } else {
            shouldInclude = true;
          }

          if (shouldInclude && currentDate >= startOfDay(today)) {
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
              currentDate = addDays(currentDate, 1);
              break;
            case 'mensal':
              currentDate = addMonths(currentDate, 1);
              break;
            default:
              currentDate = recurrenceEnd;
          }
          count++;
        }
      }
    });

    return expandedEvents;
  };

  // Expandir eventos recorrentes
  const allEvents = expandRecurringEvents(eventos);

  // Filtrar e ordenar eventos futuros ou de hoje
  const upcomingEvents = allEvents
    .filter(evento => {
      const eventoDate = parseISO(evento.data_inicio);
      return isToday(eventoDate) || isFuture(eventoDate);
    })
    .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {upcomingEvents.length === 0 ? (
                <p className="text-purple-200 text-center py-8">
                  Nenhum evento agendado
                </p>
              ) : (
                upcomingEvents.map((evento, index) => {
                  const eventoDate = parseISO(evento.data_inicio);
                  const eventoIsToday = isToday(eventoDate);
                  
                  return (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-purple-800/30 rounded-lg p-4 hover:bg-purple-800/40 transition-all duration-200"
                      style={{ borderLeft: `4px solid ${evento.cor || '#6366F1'}` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-semibold">{evento.titulo}</h4>
                        {eventoIsToday && (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            Hoje
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {format(eventoDate, "EEE, d 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {format(eventoDate, 'HH:mm')} - {format(parseISO(evento.data_fim), 'HH:mm')}
                          </span>
                        </div>

                        {evento.local && (
                          <div className="flex items-center gap-2 text-purple-200 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{evento.local}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
