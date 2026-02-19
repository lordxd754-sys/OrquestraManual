import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";
import { startOfMonth, addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CashFlowForecast({ transacoes, isVisible }) {
  const generateForecast = () => {
    if (transacoes.length === 0) return [];

    const now = new Date();
    const mesesPassados = 3;
    const mesesFuturos = 3;

    // Calcular média mensal de receitas e despesas
    const startDate = startOfMonth(addMonths(now, -mesesPassados));
    const transacoesRecentes = transacoes.filter(t => parseISO(t.data) >= startDate);

    const mediaReceitas = transacoesRecentes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + t.valor, 0) / mesesPassados;

    const mediaDespesas = transacoesRecentes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0) / mesesPassados;

    // Calcular saldo atual
    const saldoAtual = transacoes.reduce((acc, t) => {
      return acc + (t.tipo === 'receita' ? t.valor : -t.valor);
    }, 0);

    // Gerar dados históricos + previsão
    const data = [];
    let saldoCumulativo = saldoAtual - (mediaReceitas - mediaDespesas) * mesesFuturos;

    for (let i = -mesesPassados; i <= mesesFuturos; i++) {
      const mes = addMonths(now, i);
      const mesKey = format(mes, 'MMM/yy', { locale: ptBR });
      const isFuturo = i > 0;

      if (isFuturo) {
        saldoCumulativo += (mediaReceitas - mediaDespesas);
        data.push({
          mes: mesKey,
          saldo: null,
          previsao: saldoCumulativo
        });
      } else {
        const transacoesMes = transacoes.filter(t => {
          const dataTrans = parseISO(t.data);
          return dataTrans >= startOfMonth(mes) && dataTrans < startOfMonth(addMonths(mes, 1));
        });
        
        saldoCumulativo += transacoesMes.reduce((acc, t) => 
          acc + (t.tipo === 'receita' ? t.valor : -t.valor), 0
        );

        data.push({
          mes: mesKey,
          saldo: saldoCumulativo,
          previsao: null
        });
      }
    }

    return data;
  };

  const data = generateForecast();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isForecast = payload[0].dataKey === 'previsao';
      return (
        <div className="bg-purple-900/95 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{payload[0].payload.mes}</p>
          <p className="text-sm text-purple-200">
            {isForecast ? 'Previsão: ' : 'Saldo: '}
            {isVisible ? `R$ ${value.toFixed(2)}` : 'R$ ••••••'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Previsão de Fluxo de Caixa
        </CardTitle>
        <p className="text-sm text-purple-200">
          Projeção baseada em média dos últimos 3 meses
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12 text-purple-200">
            Sem dados suficientes para gerar previsão
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
              <XAxis dataKey="mes" stroke="#c4b5fd" fontSize={12} />
              <YAxis stroke="#c4b5fd" fontSize={12} tickFormatter={(value) => isVisible ? `R$ ${value}` : '••••'} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', r: 4 }}
                fill="url(#colorSaldo)"
              />
              <Line 
                type="monotone" 
                dataKey="previsao" 
                stroke="#a78bfa" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ fill: '#a78bfa', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
