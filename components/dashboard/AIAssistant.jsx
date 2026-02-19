import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function AIAssistant({ tarefas, transacoes, habitos, historico, eventos }) {
  const [insights, setInsights] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    generateInsights();
  }, [tarefas, transacoes, habitos, historico]);

  const generateInsights = async () => {
    setIsLoading(true);
    const gerados = [];

    // Análise de Tarefas
    const tarefasAtrasadas = tarefas.filter(t => 
      t.prazo && new Date(t.prazo) < new Date() && t.status !== 'concluida'
    );
    if (tarefasAtrasadas.length > 0) {
      gerados.push({
        tipo: 'alerta',
        titulo: `${tarefasAtrasadas.length} tarefa${tarefasAtrasadas.length > 1 ? 's' : ''} atrasada${tarefasAtrasadas.length > 1 ? 's' : ''}`,
        descricao: 'Recomendo priorizar estas tarefas ou ajustar os prazos.',
        acao: 'Ver Tarefas',
        link: '/pages/Tarefas',
        icon: AlertCircle,
        color: 'text-red-400'
      });
    }

    // Análise Financeira
    const ultimoMes = transacoes.filter(t => {
      const data = new Date(t.data);
      const agora = new Date();
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    });
    const despesasMes = ultimoMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const receitasMes = ultimoMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    
    if (despesasMes > receitasMes * 0.8) {
      gerados.push({
        tipo: 'alerta',
        titulo: 'Despesas elevadas este mês',
        descricao: `Suas despesas representam ${((despesasMes/receitasMes)*100).toFixed(0)}% das receitas. Considere revisar gastos.`,
        acao: 'Ver Finanças',
        link: '/pages/Financas',
        icon: TrendingUp,
        color: 'text-orange-400'
      });
    }

    // Análise de Hábitos
    const habitosComBaixoProgresso = habitos.filter(h => 
      (h.progresso_atual / h.objetivo_diario) < 0.3
    );
    if (habitosComBaixoProgresso.length > 0) {
      gerados.push({
        tipo: 'dica',
        titulo: 'Hábitos precisando de atenção',
        descricao: `${habitosComBaixoProgresso.length} hábito${habitosComBaixoProgresso.length > 1 ? 's' : ''} com progresso abaixo de 30% hoje.`,
        acao: 'Ver Hábitos',
        link: '/pages/Habitos',
        icon: Lightbulb,
        color: 'text-yellow-400'
      });
    }

    // Análise de Performance de Conteúdo
    if (historico && historico.length > 5) {
      const storiesPorDia = {};
      historico.filter(h => h.tipo_conteudo === 'stories').forEach(h => {
        const dia = h.dia_semana;
        storiesPorDia[dia] = (storiesPorDia[dia] || 0) + 1;
      });
      
      const melhorDia = Object.entries(storiesPorDia).sort((a, b) => b[1] - a[1])[0];
      const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      if (melhorDia) {
        gerados.push({
          tipo: 'insight',
          titulo: 'Padrão de postagem identificado',
          descricao: `Você posta mais Stories às ${dias[melhorDia[0]]}s. Considere manter essa consistência.`,
          acao: 'Ver Conteúdo',
          link: '/pages/CentralConteudo',
          icon: Sparkles,
          color: 'text-purple-400'
        });
      }
    }

    // Insights positivos
    const tarefasCompletasHoje = tarefas.filter(t => {
      const hoje = new Date().toDateString();
      return t.status === 'concluida' && new Date(t.updated_date).toDateString() === hoje;
    });
    
    if (tarefasCompletasHoje.length >= 3) {
      gerados.push({
        tipo: 'positivo',
        titulo: '🎉 Dia produtivo!',
        descricao: `Você já completou ${tarefasCompletasHoje.length} tarefas hoje. Continue assim!`,
        acao: null,
        icon: Sparkles,
        color: 'text-green-400'
      });
    }

    // IA Generativa para insights mais avançados
    if (gerados.length < 2) {
      try {
        const prompt = `Analise estes dados do usuário e forneça 1 insight curto e acionável:
        - ${tarefas.length} tarefas (${tarefas.filter(t => t.status === 'concluida').length} concluídas)
        - Saldo: R$ ${receitasMes - despesasMes}
        - ${habitos.length} hábitos ativos
        - ${eventos.length} eventos agendados
        
        Retorne apenas o insight em 1 frase curta e motivadora.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: false
        });

        gerados.push({
          tipo: 'ia',
          titulo: '🤖 Sugestão da IA',
          descricao: response,
          acao: 'Conversar com IA',
          link: '/pages/Chat',
          icon: Sparkles,
          color: 'text-indigo-400'
        });
      } catch (error) {
        console.error('Erro ao gerar insight IA:', error);
      }
    }

    setInsights(gerados);
    setIsLoading(false);
  };

  const insightsVisiveis = showAll ? insights : insights.slice(0, 3);

  return (
    <Card className="glass-effect border-white/5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Assistente IA
          </h3>
          {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {insightsVisiveis.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${insight.color}`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm mb-1">{insight.titulo}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{insight.descricao}</p>
                    {insight.acao && (
                      <a href={insight.link} className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2 group-hover:gap-2 transition-all">
                        {insight.acao}
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {insights.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Analisando seus dados...</p>
            </div>
          )}

          {insights.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              {showAll ? 'Ver menos' : `Ver mais ${insights.length - 3} insights`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
