import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function FinanceSummary({ transacoes }) {
  const [isSaldoVisible, setIsSaldoVisible] = React.useState(() => {
    const saved = localStorage.getItem('saldoVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleVisibility = () => {
    const newValue = !isSaldoVisible;
    setIsSaldoVisible(newValue);
    localStorage.setItem('saldoVisible', JSON.stringify(newValue));
    window.dispatchEvent(new Event('saldoVisibilityChange'));
  };

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleVisibility}
              className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/30"
            >
              {isSaldoVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-green-400 text-sm font-medium">Receitas</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {isSaldoVisible ? `R$ ${totalReceitas.toFixed(2)}` : 'R$ ••••••'}
              </p>
            </div>

            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm font-medium">Despesas</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {isSaldoVisible ? `R$ ${totalDespesas.toFixed(2)}` : 'R$ ••••••'}
              </p>
            </div>

            <div className={`rounded-lg p-4 border ${
              saldo >= 0 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${
                  saldo >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`} />
                <p className={`text-sm font-medium ${
                  saldo >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>Saldo</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {isSaldoVisible ? `R$ ${saldo.toFixed(2)}` : 'R$ ••••••'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
