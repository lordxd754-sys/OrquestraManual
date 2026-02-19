import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { startOfMonth, subMonths, parseISO } from 'date-fns';

export default function FinancialKPIs({ transacoes, isVisible }) {
  const now = new Date();
  const mesAtual = startOfMonth(now);
  const mesAnterior = startOfMonth(subMonths(now, 1));

  const transacoesMesAtual = transacoes.filter(t => parseISO(t.data) >= mesAtual);
  const transacoesMesAnterior = transacoes.filter(t => 
    parseISO(t.data) >= mesAnterior && parseISO(t.data) < mesAtual
  );

  const receitasMesAtual = transacoesMesAtual.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesasMesAtual = transacoesMesAtual.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const lucroLiquido = receitasMesAtual - despesasMesAtual;

  const receitasMesAnterior = transacoesMesAnterior.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesasMesAnterior = transacoesMesAnterior.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  
  const variacaoReceita = receitasMesAnterior > 0 
    ? ((receitasMesAtual - receitasMesAnterior) / receitasMesAnterior * 100) 
    : 0;
  const variacaoDespesa = despesasMesAnterior > 0 
    ? ((despesasMesAtual - despesasMesAnterior) / despesasMesAnterior * 100) 
    : 0;

  const mediaReceitas = transacoes.length > 0
    ? transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0) / 
      Math.max(1, Math.ceil((now - parseISO(transacoes[transacoes.length - 1]?.data || now)) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  const kpis = [
    {
      titulo: 'Lucro Líquido',
      valor: lucroLiquido,
      icon: DollarSign,
      color: lucroLiquido >= 0 ? 'green' : 'red',
      descricao: 'Este mês',
      variacao: null
    },
    {
      titulo: 'Receitas',
      valor: receitasMesAtual,
      icon: TrendingUp,
      color: 'green',
      descricao: 'vs. mês anterior',
      variacao: variacaoReceita
    },
    {
      titulo: 'Despesas',
      valor: despesasMesAtual,
      icon: TrendingDown,
      color: 'red',
      descricao: 'vs. mês anterior',
      variacao: variacaoDespesa
    },
    {
      titulo: 'Média Mensal',
      valor: mediaReceitas,
      icon: Activity,
      color: 'blue',
      descricao: 'Receitas médias',
      variacao: null
    }
  ];

  const colorClasses = {
    green: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-300',
      textColor: 'text-green-300'
    },
    red: {
      bg: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-300',
      textColor: 'text-red-300'
    },
    blue: {
      bg: 'from-blue-500/20 to-indigo-500/20',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-300',
      textColor: 'text-blue-300'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const colors = colorClasses[kpi.color];
        return (
          <motion.div
            key={kpi.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${colors.bg} backdrop-blur-md ${colors.border} shadow-lg hover:shadow-${kpi.color}-500/20 transition-all duration-300 h-full`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 ${colors.iconBg} rounded-xl`}>
                    <kpi.icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  {kpi.variacao !== null && (
                    <div className={`flex items-center gap-1 ${
                      kpi.variacao >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpi.variacao >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {Math.abs(kpi.variacao).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className={`${colors.textColor} font-medium text-sm mb-1`}>
                  {kpi.titulo}
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  {isVisible ? `R$ ${kpi.valor.toFixed(2)}` : 'R$ ••••••'}
                </p>
                <p className="text-xs text-gray-400">{kpi.descricao}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
