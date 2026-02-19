import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radar, TrendingUp, Loader2, Sparkles, Target, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function ContentRadar() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trends, setTrends] = useState([]);

  const analyzeTrends = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `
Você é um estrategista de conteúdo especializado em musculação, fitness e crescimento no Instagram.

Identifique 5 TEMAS EM ALTA agora (${new Date().toLocaleDateString('pt-BR')}) para criação de conteúdo em Instagram Reels, TikTok e Shorts.

FOCO: Hipertrofia, treino de força, glúteos, pernas, erros comuns, mitos fitness, execução de exercícios.

Para cada tema, retorne:
- tema: nome curto e impactante do tema
- probabilidade: número de 0 a 100 (probabilidade estimada de viralização)
- prioridade: "Alta" | "Média" | "Baixa" (baseado em urgência e potencial)
- angulo: qual é o principal ângulo/abordagem que está performando AGORA
- erro_comum: erro típico ao abordar esse tema (máx 1 linha)
- formato: "Reels 15-30s" | "Reels 30-60s" | "Carrossel" | "Story"
- sugestao_pratica: conteúdo acionável específico que pode ser gravado HOJE (máx 2 linhas)
- emoji: um emoji relacionado

Ordene por prioridade (Alta primeiro) e probabilidade de viralização.
Busque tendências REAIS e ATUAIS do mercado fitness brasileiro.
`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            tendencias: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tema: { type: "string" },
                  probabilidade: { type: "number" },
                  prioridade: { type: "string" },
                  angulo: { type: "string" },
                  erro_comum: { type: "string" },
                  formato: { type: "string" },
                  sugestao_pratica: { type: "string" },
                  emoji: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTrends(resultado.tendencias || []);
    } catch (error) {
      console.error("Erro ao analisar tendências:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return "from-green-500 to-emerald-600";
    if (prob >= 60) return "from-yellow-500 to-orange-500";
    if (prob >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-pink-600";
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 80) return "bg-green-500/10 border-green-500/30";
    if (prob >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    if (prob >= 40) return "bg-orange-500/10 border-orange-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      "Alta": {
        bg: "bg-red-500/20",
        border: "border-red-500/40",
        text: "text-red-300",
        icon: "🔥"
      },
      "Média": {
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/40",
        text: "text-yellow-300",
        icon: "⚡"
      },
      "Baixa": {
        bg: "bg-blue-500/20",
        border: "border-blue-500/40",
        text: "text-blue-300",
        icon: "💡"
      }
    };
    return configs[priority] || configs["Média"];
  };

  return (
    <Card className="bg-indigo-900/40 backdrop-blur-md border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 blur-lg opacity-50" />
            <Radar className="w-6 h-6 relative" />
          </div>
          Radar de Tendências
        </CardTitle>
        <p className="text-sm text-purple-200 mt-1">
          Identifique temas em alta no nicho fitness com potencial de viralização
        </p>
      </CardHeader>
      
      <CardContent>
        <Button
          onClick={analyzeTrends}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 mb-6"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando tendências...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Escanear Tendências Agora
            </>
          )}
        </Button>

        <AnimatePresence mode="popLayout">
          {trends.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Destaque do primeiro (mais prioritário) */}
              {trends.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/40 rounded-xl p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-transparent px-6 py-1 text-xs font-bold text-white">
                    🎯 GRAVE ISSO PRIMEIRO
                  </div>
                  
                  <div className="flex items-start gap-4 mt-4">
                    <div className="text-5xl">{trends[0].emoji}</div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-2">
                            {trends[0].tema}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-3 py-1 rounded-full ${getPriorityConfig(trends[0].prioridade).bg} ${getPriorityConfig(trends[0].prioridade).text} border ${getPriorityConfig(trends[0].prioridade).border} font-semibold`}>
                              {getPriorityConfig(trends[0].prioridade).icon} Prioridade {trends[0].prioridade}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                              📱 {trends[0].formato}
                            </span>
                          </div>
                        </div>

                        <div className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border ${getProbabilityBg(trends[0].probabilidade)}`}>
                          <div className="flex items-center gap-1">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-3xl font-bold text-white">
                              {trends[0].probabilidade}%
                            </span>
                          </div>
                          <span className="text-xs text-purple-200">viral</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Ângulo que Funciona:
                          </p>
                          <p className="text-sm text-white leading-relaxed">
                            {trends[0].angulo}
                          </p>
                        </div>

                        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-red-300 font-semibold mb-1 flex items-center gap-1">
                            ⚠️ Erro Comum:
                          </p>
                          <p className="text-sm text-white leading-relaxed">
                            {trends[0].erro_comum}
                          </p>
                        </div>
                      </div>

                      <div className="bg-indigo-500/20 border border-indigo-500/40 rounded-lg p-4">
                        <p className="text-xs text-indigo-300 font-semibold mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Conteúdo Acionável (Grave Hoje):
                        </p>
                        <p className="text-sm text-white leading-relaxed font-medium">
                          {trends[0].sugestao_pratica}
                        </p>
                      </div>

                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trends[0].probabilidade}%` }}
                          transition={{ duration: 1.5, delay: 0.3 }}
                          className={`h-full bg-gradient-to-r ${getProbabilityColor(trends[0].probabilidade)}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Demais tendências */}
              {trends.slice(1).map((trend, index) => {
                const actualIndex = index + 1;
                const priorityConfig = getPriorityConfig(trend.prioridade);
                
                return (
                  <motion.div
                    key={actualIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: actualIndex * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{trend.emoji}</div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">
                              {trend.tema}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${priorityConfig.bg} ${priorityConfig.text} border ${priorityConfig.border}`}>
                                {priorityConfig.icon} {trend.prioridade}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                                {trend.formato}
                              </span>
                            </div>
                          </div>

                          <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border ${getProbabilityBg(trend.probabilidade)}`}>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <span className="text-2xl font-bold text-white">
                                {trend.probabilidade}%
                              </span>
                            </div>
                            <span className="text-xs text-purple-200">viral</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-emerald-300 font-semibold mb-1">
                              ✓ Ângulo:
                            </p>
                            <p className="text-sm text-purple-100 leading-relaxed">
                              {trend.angulo}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-red-300 font-semibold mb-1">
                              ✗ Erro:
                            </p>
                            <p className="text-sm text-purple-100 leading-relaxed">
                              {trend.erro_comum}
                            </p>
                          </div>
                        </div>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                          <p className="text-xs text-indigo-300 font-semibold mb-1">
                            💡 Sugestão:
                          </p>
                          <p className="text-sm text-white leading-relaxed">
                            {trend.sugestao_pratica}
                          </p>
                        </div>

                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trend.probabilidade}%` }}
                            transition={{ duration: 1, delay: actualIndex * 0.1 + 0.3 }}
                            className={`h-full bg-gradient-to-r ${getProbabilityColor(trend.probabilidade)}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-200 text-sm font-semibold mb-1">
                    Nota Estratégica
                  </p>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    As probabilidades são estimativas baseadas em dados de tendências. 
                    O sucesso real depende da execução, qualidade e consistência do conteúdo.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!isAnalyzing && trends.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="relative mb-4 inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-rose-600/30 blur-2xl" />
                <Target className="w-16 h-16 text-purple-300 relative" />
              </div>
              <p className="text-purple-200">
                Clique no botão acima para escanear as tendências atuais
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
