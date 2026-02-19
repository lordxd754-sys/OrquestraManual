import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotesInsights() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState('');
  const [conteudo, setConteudo] = React.useState('');
  const [tipo, setTipo] = React.useState('ideia_espontanea');
  const queryClient = useQueryClient();

  const { data: anotacoes = [] } = useQuery({
    queryKey: ['anotacoes'],
    queryFn: () => base44.entities.AnotacaoConteudo.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AnotacaoConteudo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anotacoes'] });
      setDialogOpen(false);
      setTitulo('');
      setConteudo('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AnotacaoConteudo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anotacoes'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ titulo, conteudo, tipo });
  };

  const tipoLabels = {
    ideia_espontanea: { label: 'Ideia', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '💡' },
    feedback: { label: 'Feedback', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '💬' },
    comentario: { label: 'Comentário', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '📝' },
    insight: { label: 'Insight', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '✨' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Anotações e Insights
            </CardTitle>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Anotação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {anotacoes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-purple-300 text-sm mb-4">
                    Nenhuma anotação ainda
                  </p>
                  <p className="text-purple-400 text-xs">
                    Use este espaço para guardar ideias espontâneas, feedbacks do público,
                    comentários importantes ou insights que surgirem ao longo do dia.
                  </p>
                </div>
              ) : (
                anotacoes.map((nota) => (
                  <motion.div
                    key={nota.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-purple-800/30 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tipoLabels[nota.tipo].icon}</span>
                        <Badge className={tipoLabels[nota.tipo].color}>
                          {tipoLabels[nota.tipo].label}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(nota.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <h5 className="text-white font-semibold mb-2">{nota.titulo}</h5>
                    <p className="text-purple-200 text-sm whitespace-pre-wrap">{nota.conteudo}</p>
                    
                    <p className="text-purple-400 text-xs mt-3">
                      {format(new Date(nota.created_date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
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
            <DialogTitle className="text-white">Nova Anotação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm mb-2 block">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-purple-800/30 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ideia_espontanea">💡 Ideia Espontânea</SelectItem>
                  <SelectItem value="feedback">💬 Feedback do Público</SelectItem>
                  <SelectItem value="comentario">📝 Comentário Importante</SelectItem>
                  <SelectItem value="insight">✨ Insight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-purple-200 text-sm mb-2 block">Título</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Ideia para novo vídeo"
                className="bg-purple-800/30 border-purple-500/30 text-white"
                required
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm mb-2 block">Conteúdo</label>
              <Textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Descreva sua anotação, ideia, feedback ou insight..."
                className="bg-purple-800/30 border-purple-500/30 text-white"
                rows={4}
                required
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
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
