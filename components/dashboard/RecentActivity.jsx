import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const prioridadeColors = {
  baixa: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  media: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  alta: "bg-red-500/20 text-red-300 border-red-500/30"
};

const statusIcons = {
  pendente: Clock,
  em_progresso: AlertCircle,
  concluida: CheckSquare
};

export default function RecentActivity({ tarefas }) {
  const recentTasks = tarefas.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {recentTasks.length === 0 ? (
                <p className="text-purple-200 text-center py-8">
                  Nenhuma tarefa ainda. Comece conversando com a IA!
                </p>
              ) : (
                recentTasks.map((tarefa, index) => {
                  const StatusIcon = statusIcons[tarefa.status];
                  return (
                    <motion.div
                      key={tarefa.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-purple-800/30 rounded-lg p-4 hover:bg-purple-800/40 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <StatusIcon className="w-5 h-5 text-purple-200 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{tarefa.titulo}</p>
                          {tarefa.prazo && (
                            <p className="text-purple-200 text-sm mt-1">
                              {format(new Date(tarefa.prazo), "d 'de' MMM", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <Badge className={prioridadeColors[tarefa.prioridade]}>
                          {tarefa.prioridade}
                        </Badge>
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
