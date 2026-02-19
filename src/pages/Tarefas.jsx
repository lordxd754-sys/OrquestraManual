import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Clock, Edit2, Trash2, Calendar, Tag, ArrowRight, Filter, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import TaskDialog from "../components/tarefas/TaskDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const prioridadeConfig = {
  baixa: {
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    border: "border-blue-500/30",
    label: "Baixa",
    icon: "🔵"
  },
  media: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-300",
    border: "border-yellow-500/30",
    label: "Média",
    icon: "🟡"
  },
  alta: {
    bg: "bg-red-500/10",
    text: "text-red-300",
    border: "border-red-500/30",
    label: "Alta",
    icon: "🔴"
  }
};

const statusConfig = {
  pendente: {
    icon: Circle,
    label: "Pendente",
    color: "text-gray-400"
  },
  em_progresso: {
    icon: Clock,
    label: "Em Progresso",
    color: "text-blue-400"
  },
  concluida: {
    icon: CheckCircle2,
    label: "Concluída",
    color: "text-green-400"
  }
};

export default function Tarefas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const queryClient = useQueryClient();

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

  const { data: tarefas = [] } = useQuery({
    queryKey: ['tarefas'],
    queryFn: () => base44.entities.Tarefa.list('-created_date'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tarefa.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Tarefa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });

  const toggleStatus = (tarefa) => {
    const nextStatus = {
      pendente: 'em_progresso',
      em_progresso: 'concluida',
      concluida: 'pendente'
    };
    
    updateTaskMutation.mutate({
      id: tarefa.id,
      data: { ...tarefa, status: nextStatus[tarefa.status] }
    });
  };

  const getDeadlineStatus = (prazo) => {
    if (!prazo) return null;
    const date = parseISO(prazo);
    
    if (isPast(date) && !isToday(date)) {
      return { label: "Atrasada", color: "bg-red-500/20 text-red-300 border-red-500/40" };
    }
    if (isToday(date)) {
      return { label: "Hoje", color: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
    }
    if (isTomorrow(date)) {
      return { label: "Amanhã", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
    }
    return null;
  };

  const filteredTasks = tarefas.filter(t => {
    if (filter === 'todas') return true;
    return t.status === filter;
  });

  const stats = {
    total: tarefas.length,
    pendente: tarefas.filter(t => t.status === 'pendente').length,
    em_progresso: tarefas.filter(t => t.status === 'em_progresso').length,
    concluida: tarefas.filter(t => t.status === 'concluida').length,
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Tarefas</h1>
              <p className="text-purple-200">Organize, priorize e execute suas atividades com eficiência</p>
            </div>
            <Button
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Tarefa
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-indigo-900/40 backdrop-blur-md border border-indigo-500/30 rounded-xl p-4"
            >
              <div className="text-indigo-300 text-sm font-medium mb-1">Total</div>
              <div className="text-white text-3xl font-bold">{stats.total}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-gray-900/40 backdrop-blur-md border border-gray-500/30 rounded-xl p-4"
            >
              <div className="text-gray-300 text-sm font-medium mb-1">Pendentes</div>
              <div className="text-white text-3xl font-bold">{stats.pendente}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-900/40 backdrop-blur-md border border-blue-500/30 rounded-xl p-4"
            >
              <div className="text-blue-300 text-sm font-medium mb-1">Em Progresso</div>
              <div className="text-white text-3xl font-bold">{stats.em_progresso}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-green-900/40 backdrop-blur-md border border-green-500/30 rounded-xl p-4"
            >
              <div className="text-green-300 text-sm font-medium mb-1">Concluídas</div>
              <div className="text-white text-3xl font-bold">{stats.concluida}</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-6 flex-wrap"
        >
          <div className="flex items-center gap-2 text-purple-200">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          {[
            { key: 'todas', label: 'Todas', count: stats.total },
            { key: 'pendente', label: 'Pendentes', count: stats.pendente },
            { key: 'em_progresso', label: 'Em Progresso', count: stats.em_progresso },
            { key: 'concluida', label: 'Concluídas', count: stats.concluida }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              variant={filter === filterOption.key ? 'default' : 'outline'}
              size="sm"
              className={filter === filterOption.key 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg' 
                : 'bg-white/5 text-purple-200 border-white/10 hover:bg-white/10'
              }
            >
              {filterOption.label}
              <Badge className="ml-2 bg-white/20 text-white border-0">
                {filterOption.count}
              </Badge>
            </Button>
          ))}
        </motion.div>

        {/* Tasks List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/20">
                  <CardContent className="py-16 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-purple-200 text-lg font-medium">
                      {filter === 'todas' ? 'Nenhuma tarefa criada ainda' : `Nenhuma tarefa ${filter === 'concluida' ? 'concluída' : filter.replace('_', ' ')}`}
                    </p>
                    <p className="text-purple-300 text-sm mt-2">
                      Clique em "Nova Tarefa" para começar
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredTasks.map((tarefa, index) => {
                const StatusIcon = statusConfig[tarefa.status].icon;
                const deadlineStatus = getDeadlineStatus(tarefa.prazo);
                const prioridadeInfo = prioridadeConfig[tarefa.prioridade];
                
                return (
                  <motion.div
                    key={tarefa.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    layout
                  >
                    <Card className={`
                      backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                      ${tarefa.status === 'concluida' 
                        ? 'bg-green-900/10 border-green-500/20 hover:border-green-500/40' 
                        : 'bg-indigo-900/20 border-indigo-500/20 hover:border-indigo-500/40'
                      }
                    `}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <button
                            onClick={() => toggleStatus(tarefa)}
                            className={`
                              mt-1 transition-all duration-200 hover:scale-110
                              ${statusConfig[tarefa.status].color}
                            `}
                          >
                            <StatusIcon className="w-7 h-7" />
                          </button>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className={`
                                text-white text-lg font-semibold
                                ${tarefa.status === 'concluida' ? 'line-through opacity-60' : ''}
                              `}>
                                {tarefa.titulo}
                              </h3>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-200 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-white/20">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingTask(tarefa);
                                      setDialogOpen(true);
                                    }}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteTaskMutation.mutate(tarefa.id)}
                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {tarefa.descricao && (
                              <p className={`
                                text-purple-200 mb-3 text-sm leading-relaxed
                                ${tarefa.status === 'concluida' ? 'opacity-60' : ''}
                              `}>
                                {tarefa.descricao}
                              </p>
                            )}
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              {/* Priority Badge */}
                              <Badge className={`
                                ${prioridadeInfo.bg} ${prioridadeInfo.text} border ${prioridadeInfo.border}
                                font-medium
                              `}>
                                <span className="mr-1">{prioridadeInfo.icon}</span>
                                {prioridadeInfo.label}
                              </Badge>

                              {/* Status Badge */}
                              <Badge className={`
                                ${tarefa.status === 'pendente' ? 'bg-gray-500/10 text-gray-300 border-gray-500/30' : ''}
                                ${tarefa.status === 'em_progresso' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : ''}
                                ${tarefa.status === 'concluida' ? 'bg-green-500/10 text-green-300 border-green-500/30' : ''}
                                border font-medium
                              `}>
                                {statusConfig[tarefa.status].label}
                              </Badge>
                              
                              {/* Deadline Badge */}
                              {tarefa.prazo && (
                                <Badge className={`
                                  border font-medium flex items-center gap-1
                                  ${deadlineStatus ? deadlineStatus.color : 'bg-purple-500/10 text-purple-300 border-purple-500/30'}
                                `}>
                                  <Calendar className="w-3 h-3" />
                                  {deadlineStatus ? deadlineStatus.label : format(parseISO(tarefa.prazo), "d MMM", { locale: ptBR })}
                                </Badge>
                              )}
                              
                              {/* Category Badge */}
                              {tarefa.categoria && (
                                <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {tarefa.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
        />
      </div>
    </div>
  );
}
