import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, DollarSign, Target, Bell, TrendingUp, ArrowUp, ArrowDown, Calendar, Sparkles, MessageSquare, Settings, GripVertical } from "lucide-react";
import { format, startOfDay, isToday, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AIAssistant from "../components/dashboard/AIAssistant";
import ContentPerformanceWidget from "../components/dashboard/ContentPerformanceWidget";
import WidgetSelector from "../components/dashboard/WidgetSelector";

export default function Dashboard() {
  const [user, setUser] = React.useState(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isSaldoVisible, setIsSaldoVisible] = React.useState(() => {
    const saved = localStorage.getItem('saldoVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [greeting, setGreeting] = React.useState('');
  const [widgetSelectorOpen, setWidgetSelectorOpen] = React.useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      const saved = localStorage.getItem('saldoVisible');
      if (saved !== null) {
        setIsSaldoVisible(JSON.parse(saved));
      }
    };

    window.addEventListener('saldoVisibilityChange', handleVisibilityChange);
    return () => window.removeEventListener('saldoVisibilityChange', handleVisibilityChange);
  }, []);

  const { data: tarefas = [] } = useQuery({
    queryKey: ['tarefas'],
    queryFn: () => base44.entities.Tarefa.list('-created_date'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: transacoes = [] } = useQuery({
    queryKey: ['transacoes'],
    queryFn: () => base44.entities.Transacao.list('-data'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: habitos = [] } = useQuery({
    queryKey: ['habitos'],
    queryFn: () => base44.entities.Habito.list('-created_date'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list('-data_inicio'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: historico = [] } = useQuery({
    queryKey: ['historico-postagem'],
    queryFn: () => base44.entities.HistoricoPostagem.list(),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['conteudo-story'],
    queryFn: () => base44.entities.ConteudoStory.list(),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: roteiros = [] } = useQuery({
    queryKey: ['roteiro-video'],
    queryFn: () => base44.entities.RoteiroVideo.list(),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const { data: dashboardConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['config-dashboard'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoDashboard.list();
      return configs[0] || null;
    },
    enabled: !isLoadingUser,
  });

  const widgetsAtivos = dashboardConfig?.widgets || [
    { id: '1', type: 'assistente-ia', position: 0, visible: true },
    { id: '2', type: 'tarefas-recentes', position: 1, visible: true },
    { id: '3', type: 'resumo-financeiro', position: 2, visible: true },
    { id: '4', type: 'performance-conteudo', position: 3, visible: true },
    { id: '5', type: 'habitos-hoje', position: 4, visible: true },
    { id: '6', type: 'proximos-eventos', position: 5, visible: true }
  ];

  const updateConfigMutation = useMutation({
    mutationFn: async (widgets) => {
      if (dashboardConfig) {
        return base44.entities.ConfiguracaoDashboard.update(dashboardConfig.id, { widgets });
      } else {
        return base44.entities.ConfiguracaoDashboard.create({ widgets });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-dashboard'] });
    },
  });

  const tarefasPendentes = tarefas.filter(t => t.status !== 'concluida').length;
  const tarefasEmProgresso = tarefas.filter(t => t.status === 'em_progresso').length;
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length;
  
  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoTotal = totalReceitas - totalDespesas;

  const habitosAtivos = habitos.length;
  const habitosCompletosHoje = habitos.filter(h => h.progresso_atual >= h.objetivo_diario).length;
  const progressoMedioHabitos = habitos.length > 0 
    ? habitos.reduce((acc, h) => acc + (h.progresso_atual / h.objetivo_diario * 100), 0) / habitos.length 
    : 0;
  
  const eventosHoje = eventos.filter(e => {
    const eventoDate = parseISO(e.data_inicio);
    return isToday(eventoDate);
  }).length;

  const eventosFuturos = eventos.filter(e => isFuture(parseISO(e.data_inicio))).length;

  const proximoEvento = eventos
    .filter(e => isFuture(parseISO(e.data_inicio)))
    .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))[0];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgetsAtivos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updated = items.map((item, index) => ({
      ...item,
      position: index
    }));

    updateConfigMutation.mutate(updated);
  };

  const handleToggleWidget = (widgetType) => {
    const existing = widgetsAtivos.find(w => w.type === widgetType);
    
    let updated;
    if (existing) {
      updated = widgetsAtivos.map(w => 
        w.type === widgetType ? { ...w, visible: !w.visible } : w
      );
    } else {
      updated = [
        ...widgetsAtivos,
        {
          id: Date.now().toString(),
          type: widgetType,
          position: widgetsAtivos.length,
          visible: true
        }
      ];
    }

    updateConfigMutation.mutate(updated);
  };

  const renderWidget = (widget, index) => {
    if (!widget.visible) return null;

    const widgetComponents = {
      'assistente-ia': (
        <AIAssistant 
          tarefas={tarefas} 
          transacoes={transacoes} 
          habitos={habitos}
          historico={historico}
          eventos={eventos}
        />
      ),
      'tarefas-recentes': (
        <Card className="glass-effect border-white/5 h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Tarefas Recentes
              </h2>
              <Link to={createPageUrl("Tarefas")}>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  Ver todas →
                </button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {tarefas.slice(0, 5).map((tarefa, idx) => (
                <motion.div
                  key={tarefa.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    tarefa.status === 'concluida' ? 'bg-green-500' :
                    tarefa.status === 'em_progresso' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{tarefa.titulo}</p>
                    <p className="text-xs text-gray-400">
                      {tarefa.prazo ? format(new Date(tarefa.prazo), "d 'de' MMM", { locale: ptBR }) : 'Sem prazo'}
                    </p>
                  </div>
                  <Badge className={
                    tarefa.prioridade === 'alta' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    tarefa.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }>
                    {tarefa.prioridade}
                  </Badge>
                </motion.div>
              ))}
              {tarefas.length === 0 && (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhuma tarefa ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      'resumo-financeiro': (
        <Card className="glass-effect border-white/5 h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Resumo Financeiro
              </h2>
              <Link to={createPageUrl("Financas")}>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  Ver detalhes →
                </button>
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Receitas
                </p>
                <p className="text-2xl font-bold text-white">
                  {isSaldoVisible ? `R$ ${totalReceitas.toFixed(2)}` : 'R$ ••••••'}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-red-400 text-sm mb-2 flex items-center gap-2">
                  <ArrowDown className="w-4 h-4" />
                  Despesas
                </p>
                <p className="text-2xl font-bold text-white">
                  {isSaldoVisible ? `R$ ${totalDespesas.toFixed(2)}` : 'R$ ••••••'}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-xl border ${
                  saldoTotal >= 0 
                    ? 'bg-blue-500/10 border-blue-500/20' 
                    : 'bg-orange-500/10 border-orange-500/20'
                }`}
              >
                <p className={`text-sm mb-2 ${
                  saldoTotal >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  Saldo
                </p>
                <p className="text-2xl font-bold text-white">
                  {isSaldoVisible ? `R$ ${saldoTotal.toFixed(2)}` : 'R$ ••••••'}
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      ),
      'performance-conteudo': (
        <ContentPerformanceWidget 
          historico={historico}
          stories={stories}
          roteiros={roteiros}
        />
      ),
      'habitos-hoje': (
        <Card className="glass-effect border-white/5 h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Hábitos de Hoje
              </h2>
              <Link to={createPageUrl("Habitos")}>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  Ver todos →
                </button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {habitos.slice(0, 4).map((habito) => {
                const progresso = (habito.progresso_atual / habito.objetivo_diario) * 100;
                return (
                  <motion.div 
                    key={habito.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-white/5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white text-sm font-medium">{habito.nome}</p>
                      <span className="text-xs text-gray-400">
                        {habito.progresso_atual}/{habito.objetivo_diario} {habito.unidade}
                      </span>
                    </div>
                    <Progress value={progresso} className="h-2 bg-gray-800" />
                  </motion.div>
                );
              })}
              {habitos.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">
                  Nenhum hábito criado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      'proximos-eventos': (
        <Card className="glass-effect border-white/5 h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Próximos Eventos
              </h2>
              <Link to={createPageUrl("Agenda")}>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  Ver agenda →
                </button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {eventos
                .filter(e => isFuture(parseISO(e.data_inicio)) || isToday(parseISO(e.data_inicio)))
                .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
                .slice(0, 4)
                .map((evento) => (
                  <motion.div 
                    key={evento.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl bg-white/5 border-l-2" 
                    style={{ borderLeftColor: evento.cor || '#6366F1' }}
                  >
                    <p className="text-white text-sm font-medium mb-1">{evento.titulo}</p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(evento.data_inicio), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </motion.div>
                ))}
              {eventos.filter(e => isFuture(parseISO(e.data_inicio))).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">
                  Nenhum evento próximo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )
    };

    return widgetComponents[widget.type] || null;
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-lg flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {greeting}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-gray-400 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Button
            onClick={() => setWidgetSelectorOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Personalizar Dashboard
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to={createPageUrl("Tarefas")}>
              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <CheckSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {tarefasEmProgresso} em andamento
                    </Badge>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Tarefas Pendentes</h3>
                  <p className="text-3xl font-bold text-white mb-1">{tarefasPendentes}</p>
                  <p className="text-xs text-gray-500">{tarefasConcluidas} concluídas</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to={createPageUrl("Financas")}>
              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 cursor-pointer group border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {saldoTotal >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={saldoTotal >= 0 ? "text-green-400" : "text-red-400"}>
                        {Math.abs(((saldoTotal / (totalReceitas || 1)) * 100)).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Saldo Total</h3>
                  <p className="text-3xl font-bold text-white mb-1">
                    {isSaldoVisible ? `R$ ${saldoTotal.toFixed(2)}` : 'R$ ••••••'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSaldoVisible ? `Receitas: R$ ${totalReceitas.toFixed(2)}` : '•••••••'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to={createPageUrl("Habitos")}>
              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 cursor-pointer group border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {habitosCompletosHoje}/{habitosAtivos}
                    </Badge>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Hábitos</h3>
                  <p className="text-3xl font-bold text-white mb-2">{habitosAtivos}</p>
                  <Progress value={progressoMedioHabitos} className="h-1.5 bg-purple-900/30" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to={createPageUrl("Agenda")}>
              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 cursor-pointer group border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                      <Calendar className="w-6 h-6 text-orange-400" />
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {eventosHoje} hoje
                    </Badge>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Eventos</h3>
                  <p className="text-3xl font-bold text-white mb-1">{eventosFuturos}</p>
                  {proximoEvento && (
                    <p className="text-xs text-gray-500 truncate">
                      Próximo: {format(parseISO(proximoEvento.data_inicio), "d MMM HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Draggable Widgets Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid lg:grid-cols-2 gap-6"
              >
                <AnimatePresence>
                  {widgetsAtivos
                    .sort((a, b) => a.position - b.position)
                    .map((widget, index) => (
                      widget.visible && (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: index * 0.05 }}
                              className={`${
                                snapshot.isDragging ? 'z-50 rotate-2 scale-105' : ''
                              } transition-transform`}
                            >
                              <div className="relative group">
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                >
                                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                                {renderWidget(widget, index)}
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      )
                    ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Quick Actions - sempre visível */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">

          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass-effect border-white/5">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Ações Rápidas
                  </h2>
                  
                  <div className="space-y-3">
                    <Link to={createPageUrl("Chat")}>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-purple-500/20 text-white transition-all duration-200">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Conversar com IA</span>
                      </button>
                    </Link>
                    
                    <Link to={createPageUrl("Tarefas")}>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200">
                        <CheckSquare className="w-5 h-5" />
                        <span className="font-medium">Nova Tarefa</span>
                      </button>
                    </Link>
                    
                    <Link to={createPageUrl("CentralConteudo")}>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">Criar Conteúdo</span>
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        <WidgetSelector
          open={widgetSelectorOpen}
          onOpenChange={setWidgetSelectorOpen}
          widgetsAtivos={widgetsAtivos}
          onToggleWidget={handleToggleWidget}
        />
      </div>
    </div>
  );
}
