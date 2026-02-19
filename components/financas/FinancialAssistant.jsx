import React from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { startOfMonth, parseISO } from 'date-fns';

export default function FinancialAssistant({ transacoes }) {
  const [analysis, setAnalysis] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const analyzeFinances = async () => {
    setIsLoading(true);
    
    const mesAtual = startOfMonth(new Date());
    const transacoesMes = transacoes.filter(t => parseISO(t.data) >= mesAtual);
    
    const receitas = transacoesMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoesMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const saldo = receitas - despesas;

    const despesasPorCategoria = {};
    transacoesMes.filter(t => t.tipo === 'despesa').forEach(t => {
      despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
    });

    const prompt = `Você é um assistente financeiro especializado. Analise esta situação financeira e forneça insights claros e acionáveis:

Mês atual:
- Receitas: R$ ${receitas.toFixed(2)}
- Despesas: R$ ${despesas.toFixed(2)}
- Saldo: R$ ${saldo.toFixed(2)}

Despesas por categoria:
${Object.entries(despesasPorCategoria).map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`).join('\n')}

Forneça uma análise em 3-4 parágrafos curtos:
1. Avaliação geral da saúde financeira
2. Principal ponto de atenção ou oportunidade
3. Recomendação prática e específica

Seja direto, motivador e use linguagem acessível.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      setAnalysis(response);
    } catch (error) {
      setAnalysis('Não foi possível gerar análise no momento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Assistente Financeiro IA
          </h2>
          <Button
            onClick={analyzeFinances}
            disabled={isLoading || transacoes.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              'Analisar Finanças'
            )}
          </Button>
        </div>

        {analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert max-w-none"
          >
            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
              {analysis}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-purple-200 text-sm">
              {transacoes.length === 0 
                ? 'Adicione transações para receber análise personalizada'
                : 'Clique em "Analisar Finanças" para receber insights da IA'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
