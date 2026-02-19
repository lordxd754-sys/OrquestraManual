import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Lightbulb, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ContentIdeasBank() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tema, setTema] = React.useState('');
  const [categoria, setCategoria] = React.useState('educativa');
  const [formato, setFormato] = React.useState('');
  const [duracao, setDuracao] = React.useState('');
  const [exemplo, setExemplo] = React.useState('');
  const [filterCategoria, setFilterCategoria] = React.useState('all');
  const queryClient = useQueryClient();

  const { data: ideias = [] } = useQuery({
    queryKey: ['ideias'],
    queryFn: () => base44.entities.IdeiaConteudo.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.IdeiaConteudo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.IdeiaConteudo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
    },
  });

  const resetForm = () => {
    setTema('');
    setFormato('');
    setDuracao('');
    setExemplo('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ tema, categoria, formato, duracao, exemplo });
  };

  const marcarComoUsada = (ideia) => {
    updateMutation.mutate({
      id: ideia.id,
      data: { usada: true }
    });
  };

  const categoriaLabels = {
    educativa: { label: 'Educativa', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '📚' },
    viral: { label: 'Viral', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '🔥' },
    autoridade: { label: 'Autoridade', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '👑' },
    venda: { label: 'Venda', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '💰' }
  };

  const ideasFiltradas = filterCategoria === 'all' 
    ? ideias 
    : ideias.filter(i => i.categoria === filterCategoria);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Banco de Ideias de Conteúdo
            </CardTitle>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Ideia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={filterCategoria === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategoria('all')}
              className={filterCategoria === 'all' ? 'bg-purple-600' : 'border-purple-500/50 text-purple-200'}
            >
              Todas
            </Button>
            {Object.entries(categoriaLabels).map(([key, { label, icon }]) => (
              <Button
                key={key}
                variant={filterCategoria === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategoria(key)}
                className={filterCategoria === key ? 'bg-purple-600' : 'border-purple-500/50 text-purple-200'}
              >
                {icon} {label}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {ideasFiltradas.length === 0 ? (
                <p className="text-purple-300 text-sm text-center py-8">
                  Nenhuma ideia cadastrada ainda
                </p>
              ) : (
                ideasFiltradas.map((ideia) => (
                  <motion.div
                    key={ideia.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-purple-800/30 rounded-lg p-4 ${ideia.usada ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoriaLabels[ideia.categoria].icon}</span>
                        <Badge className={categoriaLabels[ideia.categoria].color}>
                          {categoriaLabels[ideia.categoria].label}
                        </Badge>
                        {ideia.usada && (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Usada
                          </Badge>
                        )}
                      </div>
                      {!ideia.usada && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => marcarComoUsada(ideia)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marcar como usada
                        </Button>
                      )}
                    </div>

                    <h5 className="text-white font-semibold mb-2">{ideia.tema}</h5>
                    
                    <div className="grid md:grid-cols-2 gap-2 mb-2">
                      <p className="text-purple-200 text-sm">
                        <strong>Formato:</strong> {ideia.formato}
                      </p>
                      <p className="text-purple-200 text-sm">
                        <strong>Duração:</strong> {ideia.duracao}
                      </p>
                    </div>
                    
                    {ideia.exemplo && (
                      <p className="text-purple-300 text-sm mt-2">
                        <strong>Exemplo:</strong> {ideia.exemplo}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-purple-950 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Ideia de Conteúdo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm mb-2 block">Tema</label>
              <Input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: 5 erros que te impedem de emagrecer"
                className="bg-purple-800/30 border-purple-500/30 text-white"
                required
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm mb-2 block">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="bg-purple-800/30 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educativa">Educativa</SelectItem>
                  <SelectItem value="viral">Viral</SelectItem>
                  <SelectItem value="autoridade">Autoridade</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-purple-200 text-sm mb-2 block">Formato</label>
                <Input
                  value={formato}
                  onChange={(e) => setFormato(e.target.value)}
                  placeholder="Ex: Reels, Story, Carrossel"
                  className="bg-purple-800/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-2 block">Duração</label>
                <Input
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="Ex: 30-60 segundos"
                  className="bg-purple-800/30 border-purple-500/30 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-purple-200 text-sm mb-2 block">Exemplo Prático</label>
              <Textarea
                value={exemplo}
                onChange={(e) => setExemplo(e.target.value)}
                placeholder="Descreva um exemplo de como executar essa ideia..."
                className="bg-purple-800/30 border-purple-500/30 text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-purple-500/50 text-purple-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                Salvar Ideia
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
