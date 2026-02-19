import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { startOfMonth, parseISO } from 'date-fns';

export default function FinancialInsights({ transacoes }) {
  const [insights, setInsights] = React.useState([]);

  React.useEffect(() => {
    generateInsights();
  }, [transacoes]);

  const generateInsights = () => {
    const gerados = [];
    const mesAtual = startOfMonth(new Date());
    const transacoesMes = transacoes.filter(t => parseISO(t.data) >= mesAtual);
    
    const despesas = transacoesMes.filter(t => t.tipo === 'despesa');
    const receitas = transacoesMes.filter(t => t.tipo === 'receita');
    
    const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0);
    const totalReceitas = receitas.reduce((acc, t) => acc + t.valor, 0);

    // Análise de despesas por categoria
    const despesasPorCategoria = {};
    despesas.forEach(d => {
      despesasPorCategoria[d.categoria] = (despesasPorCategoria[d.categoria] || 0) + d.valor;
    });

    const categoriaMaiorGasto = Object.entries(despesasPorCategoria)
      .sort((a, b) => b[1] - a[1])[0];

    if (categoriaMaiorGasto && categoriaMaiorGasto[1] > totalDespesas * 0.3) {
      gerados.push({
        tipo: 'alerta',
        titulo: 'Concentração de gastos',
        descricao: `${categoriaMaiorGasto[1].toFixed(0)}% do seu orçamento está em ${categoriaMaiorGasto[0]}`,
        icon: AlertTriangle,
        color: 'orange'
      });
    }

    // Alerta de gastos acima da média
    const mediaDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0) / Math.max(1, transacoes.filter(t => t.tipo === 'despesa').length);
    
    const despesasAltas = despesas.filter(d => d.valor > mediaDespesas * 2);
    if (despesasAltas.length > 0) {
      gerados.push({
        tipo: 'info',
        titulo: 'Despesas fora do padrão',
        descricao: `${despesasAltas.length} transação(ões) acima da sua média habitual`,
        icon: AlertCircle,
        color: 'blue'
      });
    }

    // Análise de fluxo de caixa
    const saldo = totalReceitas - totalDespesas;
    if (saldo < 0) {
      gerados.push({
        tipo: 'alerta',
        titulo: 'Atenção ao fluxo de caixa',
        descricao: `Suas despesas superaram as receitas em R$ ${Math.abs(saldo).toFixed(2)} este mês`,
        icon: AlertTriangle,
        color: 'red'
      });
    } else if (saldo > totalReceitas * 0.3) {
      gerados.push({
        tipo: 'positivo',
        titulo: 'Excelente economia!',
        descricao: `Você economizou ${((saldo / totalReceitas) * 100).toFixed(0)}% das suas receitas`,
        icon: CheckCircle,
        color: 'green'
      });
    }

    // Oportunidade de economia
    const gastoRecorrente = Object.entries(despesasPorCategoria)
      .filter(([cat, valor]) => valor > totalDespesas * 0.15)
      .map(([cat]) => cat);

    if (gastoRecorrente.length > 0) {
      gerados.push({
        tipo: 'dica',
        titulo: 'Oportunidade de economia',
        descricao: `Revisar gastos com ${gastoRecorrente[0]} pode gerar economia significativa`,
        icon: Lightbulb,
        color: 'purple'
      });
    }

    // Tendência positiva
    if (totalReceitas > totalDespesas * 1.5) {
      gerados.push({
        tipo: 'positivo',
        titulo: 'Saúde financeira positiva',
        descricao: 'Suas receitas estão bem acima das despesas. Considere investir o excedente.',
        icon: TrendingUp,
        color: 'green'
      });
    }

    setInsights(gerados);
  };

  const colorConfig = {
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' }
  };

  return (
    <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
      <CardContent className="p-6">
        <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-400" />
          Insights Financeiros
        </h2>
        
        {insights.length === 0 ? (
          <p className="text-purple-200 text-center py-8 text-sm">
            Continue registrando transações para receber insights personalizados
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const colors = colorConfig[insight.color];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
                >
                  <div className="flex items-start gap-3">
                    <insight.icon className={`w-5 h-5 ${colors.text} mt-0.5`} />
                    <div>
                      <h3 className={`font-semibold ${colors.text} mb-1`}>
                        {insight.titulo}
                      </h3>
                      <p className="text-sm text-gray-300">{insight.descricao}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
