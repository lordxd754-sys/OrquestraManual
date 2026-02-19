import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Instagram, Plus, CheckCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const sugestoesStory = [
  "Mostre um aluno treinando",
  "Explique um erro comum no treino",
  "Mostre sua refeição ou pré-treino",
  "Abra uma caixinha de perguntas",
  "Mostre seu treino do dia",
  "Compartilhe uma transformação de aluno",
  "Dê uma dica rápida de nutrição",
  "Mostre os bastidores da sua rotina"
];

export default function StoryPlanner() {
  const [conteudo, setConteudo] = React.useState('');
  const [tipo, setTipo] = React.useState('educativo');
  const [cta, setCta] = React.useState('');
  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.ConteudoStory.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ConteudoStory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setConteudo('');
      setCta('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConteudoStory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ conteudo, tipo, cta });
  };

  const marcarComoPostado = async (story) => {
    updateMutation.mutate({
      id: story.id,
      data: { postado: true, data_postagem: new Date().toISOString() }
    });

    // Registrar no histórico para aprendizado
    try {
      await base44.entities.HistoricoPostagem.create({
        tipo_conteudo: 'stories',
        horario_postagem: new Date().toISOString(),
        dia_semana: new Date().getDay()
      });
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };

  const tipoLabels = {
    rotina: { label: 'Rotina', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    educativo: { label: 'Educativo', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    prova_social: { label: 'Prova Social', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    venda: { label: 'Venda', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    bastidores: { label: 'Bastidores', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Planejamento de Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-purple-200 text-sm mb-2 block">O que postar agora</label>
              <Textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Descreva o conteúdo do story..."
                className="bg-purple-800/30 border-purple-500/30 text-white"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-purple-200 text-sm mb-2 block">Tipo de Story</label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-purple-800/30 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rotina">Rotina</SelectItem>
                    <SelectItem value="educativo">Educativo</SelectItem>
                    <SelectItem value="prova_social">Prova Social</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="bastidores">Bastidores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-2 block">CTA Sugerido</label>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Ex: Responde nos comentários"
                  className="bg-purple-800/30 border-purple-500/30 text-white"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Story
            </Button>
          </form>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <p className="text-purple-200 text-sm font-medium">Sugestões de Stories</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sugestoesStory.map((sugestao, index) => (
                <Badge
                  key={index}
                  className="bg-purple-800/40 text-purple-200 border-purple-500/30 cursor-pointer hover:bg-purple-700/50"
                  onClick={() => setConteudo(sugestao)}
                >
                  {sugestao}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Stories Planejados</h4>
            <AnimatePresence>
              {stories.filter(s => !s.postado).length === 0 ? (
                <p className="text-purple-300 text-sm text-center py-4">
                  Nenhum story planejado ainda
                </p>
              ) : (
                stories.filter(s => !s.postado).map((story) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-purple-800/30 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={tipoLabels[story.tipo].color}>
                        {tipoLabels[story.tipo].label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => marcarComoPostado(story)}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Marcar como postado
                      </Button>
                    </div>
                    <p className="text-white mb-2">{story.conteudo}</p>
                    {story.cta && (
                      <p className="text-purple-300 text-sm">
                        <strong>CTA:</strong> {story.cta}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
