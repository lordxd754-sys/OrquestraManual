import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Bell, Plus, Trash2, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tiposConteudo = [
  { value: 'stories', label: 'Stories', icon: '📸', color: 'bg-pink-500/20 text-pink-300' },
  { value: 'reels', label: 'Reels', icon: '🎬', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'feed', label: 'Feed', icon: '📱', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'carrossel', label: 'Carrossel', icon: '🎨', color: 'bg-green-500/20 text-green-300' }
];

const diasSemana = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

export default function NotificationSettings() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingConfig, setEditingConfig] = React.useState(null);
  const [tipoConteudo, setTipoConteudo] = React.useState('stories');
  const [novoHorario, setNovoHorario] = React.useState('');
  const [horarios, setHorarios] = React.useState([]);
  const [diasSelecionados, setDiasSelecionados] = React.useState([1, 2, 3, 4, 5]);
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ['configs-notificacao'],
    queryFn: () => base44.entities.ConfiguracaoNotificacao.list(),
    initialData: [],
  });

  const { data: historico = [] } = useQuery({
    queryKey: ['historico-postagem'],
    queryFn: () => base44.entities.HistoricoPostagem.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ConfiguracaoNotificacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs-notificacao'] });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConfiguracaoNotificacao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs-notificacao'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ConfiguracaoNotificacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs-notificacao'] });
    },
  });

  const calcularHorariosSugeridos = (tipo) => {
    const postagens = historico.filter(h => h.tipo_conteudo === tipo);
    if (postagens.length === 0) return [];

    const horariosCounts = {};
    postagens.forEach(p => {
      const hora = new Date(p.horario_postagem).getHours();
      const minuto = new Date(p.horario_postagem).getMinutes();
      const horarioStr = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
      horariosCounts[horarioStr] = (horariosCounts[horarioStr] || 0) + 1;
    });

    return Object.entries(horariosCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([horario]) => horario);
  };

  const resetForm = () => {
    setTipoConteudo('stories');
    setHorarios([]);
    setDiasSelecionados([1, 2, 3, 4, 5]);
    setNovoHorario('');
    setEditingConfig(null);
  };

  const adicionarHorario = () => {
    if (novoHorario && !horarios.includes(novoHorario)) {
      setHorarios([...horarios, novoHorario].sort());
      setNovoHorario('');
    }
  };

  const removerHorario = (horario) => {
    setHorarios(horarios.filter(h => h !== horario));
  };

  const toggleDia = (dia) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== dia));
    } else {
      setDiasSelecionados([...diasSelecionados, dia].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sugeridos = calcularHorariosSugeridos(tipoConteudo);
    
    if (editingConfig) {
      updateMutation.mutate({
        id: editingConfig.id,
        data: {
          tipo_conteudo: tipoConteudo,
          horarios,
          dias_semana: diasSelecionados,
          horarios_sugeridos: sugeridos,
          ativo: true
        }
      });
    } else {
      createMutation.mutate({
        tipo_conteudo: tipoConteudo,
        horarios,
        dias_semana: diasSelecionados,
        horarios_sugeridos: sugeridos,
        ativo: true
      });
    }
  };

  const toggleAtivo = (config) => {
    updateMutation.mutate({
      id: config.id,
      data: { ativo: !config.ativo }
    });
  };

  const editarConfig = (config) => {
    setEditingConfig(config);
    setTipoConteudo(config.tipo_conteudo);
    setHorarios(config.horarios || []);
    setDiasSelecionados(config.dias_semana || [1, 2, 3, 4, 5]);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="glass-effect border-white/5">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Configurações de Notificações
            </CardTitle>
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Configuração
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {configs.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">Nenhuma notificação configurada</p>
                  <p className="text-sm text-gray-500">
                    Configure horários personalizados para cada tipo de conteúdo
                  </p>
                </div>
              ) : (
                configs.map((config) => {
                  const tipo = tiposConteudo.find(t => t.value === config.tipo_conteudo);
                  return (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-xl bg-white/5 border border-white/10 ${!config.ativo ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tipo?.icon}</span>
                          <div>
                            <h4 className="text-white font-semibold">{tipo?.label}</h4>
                            <p className="text-xs text-gray-400">
                              {diasSemana.filter(d => config.dias_semana?.includes(d.value)).map(d => d.label).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.ativo}
                            onCheckedChange={() => toggleAtivo(config)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editarConfig(config)}
                            className="text-gray-400 hover:text-white"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(config.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Horários Configurados:</p>
                          <div className="flex flex-wrap gap-2">
                            {config.horarios?.map((horario) => (
                              <Badge key={horario} className={tipo?.color}>
                                <Clock className="w-3 h-3 mr-1" />
                                {horario}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {config.horarios_sugeridos && config.horarios_sugeridos.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Horários Sugeridos (baseado no seu histórico):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {config.horarios_sugeridos.map((horario) => (
                                <Badge key={horario} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                  {horario}
                                </Badge>
                              ))}
                            </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingConfig ? 'Editar Configuração' : 'Nova Configuração de Notificação'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Tipo de Conteúdo</label>
              <Select value={tipoConteudo} onValueChange={setTipoConteudo}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposConteudo.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.icon} {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Dias da Semana</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      diasSelecionados.includes(dia.value)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Horários de Notificação</label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="time"
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  type="button"
                  onClick={adicionarHorario}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {horarios.map((horario) => (
                  <Badge
                    key={horario}
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer"
                    onClick={() => removerHorario(horario)}
                  >
                    {horario}
                    <Trash2 className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-white/10 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={horarios.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                {editingConfig ? 'Atualizar' : 'Criar'} Configuração
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
