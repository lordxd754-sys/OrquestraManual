import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Video, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function VideoScriptCreator() {
  const [tema, setTema] = React.useState('');
  const [objetivo, setObjetivo] = React.useState('alcance');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: roteiros = [] } = useQuery({
    queryKey: ['roteiros'],
    queryFn: () => base44.entities.RoteiroVideo.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoteiroVideo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roteiros'] });
      setTema('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoteiroVideo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roteiros'] });
    },
  });

  const gerarRoteiro = async () => {
    if (!tema) return;
    
    setIsGenerating(true);
    
    const prompt = `Você é um especialista em criação de conteúdo para Instagram Reels focado em MUSCULAÇÃO e HIPERTROFIA.

ANÁLISE DE PADRÕES DE COMUNICAÇÃO:
Use estrutura de perfis educacionais de musculação:
- Tom direto, sem enrolação
- Linguagem técnica mas acessível
- Autoridade baseada em evidências
- Foco em execução correta e resultados
- Ganchos que identificam erros comuns ou promessas claras

TEMA: "${tema}"
OBJETIVO: ${objetivo}

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:

1. GANCHO (até 3 segundos)
Padrões eficazes:
- Pergunta direta sobre erro comum
- Afirmação polêmica com estatística
- Identificação de problema específico
- Promessa de resultado rápido

2. DESENVOLVIMENTO (15-20 segundos)
- Identifica o erro/problema técnico
- Explica a consequência biomecânica
- Mostra a execução correta
- Dá 1-2 ajustes práticos e específicos

3. CTA FINAL (3-5 segundos)
- "Salva pra aplicar no treino"
- "Comenta o exercício que treinou hoje"
- "Marca quem precisa corrigir isso"
- "Segue pra mais conteúdo de hipertrofia"

REGRAS:
- Seja EXTREMAMENTE específico em exercícios e músculos
- Use termos técnicos corretos (escápula, amplitude, tensão mecânica)
- Foque em hipertrofia e execução correta
- Linguagem direta, sem floreios
- Tom de autoridade confiante

Retorne JSON com:
{
  "hook": "texto do hook",
  "desenvolvimento": "texto do desenvolvimento",
  "cta_final": "texto do CTA",
  "hashtags": "lista de 15-20 hashtags separadas por espaço, focadas em musculação, hipertrofia e fitness"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          hook: { type: "string" },
          desenvolvimento: { type: "string" },
          cta_final: { type: "string" },
          hashtags: { type: "string" }
        }
      }
    });

    await createMutation.mutateAsync({
      tema,
      objetivo,
      ...response
    });

    setIsGenerating(false);
  };

  const objetivoLabels = {
    alcance: { label: 'Alcance', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    autoridade: { label: 'Autoridade', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    venda: { label: 'Venda', color: 'bg-green-500/20 text-green-300 border-green-500/30' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="w-5 h-5" />
            Criador de Roteiros para Vídeos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-purple-200 text-sm mb-2 block">Tema do Vídeo</label>
                <Input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Como ganhar massa muscular"
                  className="bg-purple-800/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-2 block">Objetivo</label>
                <Select value={objetivo} onValueChange={setObjetivo}>
                  <SelectTrigger className="bg-purple-800/30 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alcance">Alcance</SelectItem>
                    <SelectItem value="autoridade">Autoridade</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={gerarRoteiro} 
              disabled={!tema || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando roteiro...' : 'Gerar Roteiro com IA'}
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Roteiros Criados</h4>
            <AnimatePresence>
              {roteiros.length === 0 ? (
                <p className="text-purple-300 text-sm text-center py-4">
                  Nenhum roteiro criado ainda
                </p>
              ) : (
                roteiros.map((roteiro) => (
                  <motion.div
                    key={roteiro.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-purple-800/30 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-white font-semibold mb-1">{roteiro.tema}</h5>
                        <Badge className={objetivoLabels[roteiro.objetivo].color}>
                          {objetivoLabels[roteiro.objetivo].label}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(roteiro.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <p className="text-green-400 text-sm font-semibold mb-1">🎯 HOOK (3 primeiros segundos)</p>
                      <p className="text-white text-sm">{roteiro.hook}</p>
                    </div>

                    <div>
                      <p className="text-blue-400 text-sm font-semibold mb-1">📝 DESENVOLVIMENTO</p>
                      <p className="text-white text-sm">{roteiro.desenvolvimento}</p>
                    </div>

                    <div>
                      <p className="text-orange-400 text-sm font-semibold mb-1">🚀 CTA FINAL</p>
                      <p className="text-white text-sm">{roteiro.cta_final}</p>
                    </div>

                    {roteiro.hashtags && (
                      <div>
                        <p className="text-pink-400 text-sm font-semibold mb-1">#️⃣ HASHTAGS</p>
                        <p className="text-purple-200 text-xs">{roteiro.hashtags}</p>
                      </div>
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
