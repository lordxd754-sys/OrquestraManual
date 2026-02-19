
import React from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const recorrenciaLabels = {
  nenhuma: 'Não repete',
  diaria: 'Diariamente',
  semanal: 'Semanalmente',
  mensal: 'Mensalmente',
  dias_especificos: 'Dias específicos'
};

const diasSemanaAbrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function EventList({ selectedDate, events, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Evento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const handleDelete = (event) => {
    if (event.isRecurring) {
      if (confirm('Este é um evento recorrente. Deseja excluir todas as ocorrências?')) {
        deleteMutation.mutate(event.originalId);
      }
    } else {
      deleteMutation.mutate(event.id);
    }
  };

  return (
    <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white">
          {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {events.length === 0 ? (
              <p className="text-purple-200 text-center py-8 text-sm">
                Nenhum evento neste dia
              </p>
            ) : (
              events.map((evento, index) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-purple-800/30 rounded-lg p-4 hover:bg-purple-800/40 transition-all duration-200"
                  style={{ borderLeft: `4px solid ${evento.cor || '#6366F1'}` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{evento.titulo}</h3>
                    {evento.recorrencia !== 'nenhuma' && (
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="bg-purple-700/50 text-purple-200 border-purple-500/30 text-xs">
                          <Repeat className="w-3 h-3 mr-1" />
                          {recorrenciaLabels[evento.recorrencia]}
                        </Badge>
                        {evento.recorrencia === 'dias_especificos' && evento.dias_semana && (
                          <div className="flex gap-1">
                            {evento.dias_semana.map(dia => (
                              <span key={dia} className="text-[10px] text-purple-200 bg-purple-700/30 px-1.5 py-0.5 rounded">
                                {diasSemanaAbrev[dia]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {evento.descricao && (
                    <p className="text-purple-200 text-sm mb-3">{evento.descricao}</p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-purple-200 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                      </span>
                    </div>

                    {evento.local && (
                      <div className="flex items-center gap-2 text-purple-200 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{evento.local}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(evento)}
                      className="flex-1 text-purple-200 hover:text-white hover:bg-purple-800/50 text-xs"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(evento)}
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    >
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
