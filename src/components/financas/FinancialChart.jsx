import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinancialChart({ transacoes, isVisible }) {
  const [period, setPeriod] = React.useState('month'); // 'month', '3months', '6months', 'year'
  const [chartType, setChartType] = React.useState('area'); // 'area', 'line', 'bar'

  const processData = () => {
    if (transacoes.length === 0) return [];

    const now = new Date();
    let startDate;

    switch (period) {
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(now, 2));
        break;
      case '6months':
        startDate = startOfMonth(subMonths(now, 5));
        break;
      case 'year':
        startDate = startOfMonth(subMonths(now, 11));
        break;
      default:
        startDate = startOfMonth(now);
    }

    const dataMap = new Map();
    let cumulativeSaldo = 0;

    // Para períodos maiores, agrupar por mês
    if (period !== 'month') {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      
      months.forEach(month => {
        const monthKey = format(month, 'MMM/yy', { locale: ptBR });
        dataMap.set(monthKey, { receitas: 0, despesas: 0, saldo: 0 });
      });

      transacoes
        .filter(t => parseISO(t.data) >= startDate)
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .forEach(t => {
          const monthKey = format(parseISO(t.data), 'MMM/yy', { locale: ptBR });
          if (dataMap.has(monthKey)) {
            const data = dataMap.get(monthKey);
            if (t.tipo === 'receita') {
              data.receitas += t.valor;
              cumulativeSaldo += t.valor;
            } else {
              data.despesas += t.valor;
              cumulativeSaldo -= t.valor;
            }
            data.saldo = cumulativeSaldo;
          }
        });
    } else {
      // Para o mês atual, mostrar dia a dia
      const days = eachDayOfInterval({ start: startDate, end: now });
      
      days.forEach(day => {
        const dayKey = format(day, 'd MMM', { locale: ptBR });
        dataMap.set(dayKey, { receitas: 0, despesas: 0, saldo: 0 });
      });

      transacoes
        .filter(t => parseISO(t.data) >= startDate)
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .forEach(t => {
          const dayKey = format(parseISO(t.data), 'd MMM', { locale: ptBR });
          if (dataMap.has(dayKey)) {
            const data = dataMap.get(dayKey);
            if (t.tipo === 'receita') {
              data.receitas += t.valor;
              cumulativeSaldo += t.valor;
            } else {
              data.despesas += t.valor;
              cumulativeSaldo -= t.valor;
            }
            data.saldo = cumulativeSaldo;
          }
        });
    }

    return Array.from(dataMap.entries()).map(([date, values]) => ({
      date,
      ...values
    }));
  };

  const data = processData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-900/95 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {isVisible ? `R$ ${entry.value.toFixed(2)}` : 'R$ ••••••'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
            <XAxis dataKey="date" stroke="#c4b5fd" fontSize={12} />
            <YAxis stroke="#c4b5fd" fontSize={12} tickFormatter={(value) => isVisible ? `R$ ${value}` : '••••'} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#c4b5fd' }} />
            <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
            <XAxis dataKey="date" stroke="#c4b5fd" fontSize={12} />
            <YAxis stroke="#c4b5fd" fontSize={12} tickFormatter={(value) => isVisible ? `R$ ${value}` : '••••'} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#c4b5fd' }} />
            <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
            <XAxis dataKey="date" stroke="#c4b5fd" fontSize={12} />
            <YAxis stroke="#c4b5fd" fontSize={12} tickFormatter={(value) => isVisible ? `R$ ${value}` : '••••'} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#c4b5fd' }} />
            <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
            <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
            <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSaldo)" />
          </AreaChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evolução Financeira
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1 bg-purple-800/30 rounded-lg p-1">
                <Button
                  variant={chartType === 'area' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className={chartType === 'area' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  <Activity className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className={chartType === 'line' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  <LineChartIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className={chartType === 'bar' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-1 bg-purple-800/30 rounded-lg p-1">
                <Button
                  variant={period === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod('month')}
                  className={period === 'month' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  Mês
                </Button>
                <Button
                  variant={period === '3months' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod('3months')}
                  className={period === '3months' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  3M
                </Button>
                <Button
                  variant={period === '6months' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod('6months')}
                  className={period === '6months' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  6M
                </Button>
                <Button
                  variant={period === 'year' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod('year')}
                  className={period === 'year' ? 'bg-purple-600' : 'text-purple-200 hover:text-white hover:bg-purple-700/50'}
                >
                  Ano
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-12 text-purple-200">
              Sem dados suficientes para exibir o gráfico
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              {renderChart()}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
