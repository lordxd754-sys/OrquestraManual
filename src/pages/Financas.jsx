import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import TransactionDialog from "../components/financas/TransactionDialog";
import TransactionList from "../components/financas/TransactionList";
import FinancialChart from "../components/financas/FinancialChart";
import FinancialKPIs from "../components/financas/FinancialKPIs";
import FinancialInsights from "../components/financas/FinancialInsights";
import FinancialGoals from "../components/financas/FinancialGoals";
import CashFlowForecast from "../components/financas/CashFlowForecast";
import FinancialAssistant from "../components/financas/FinancialAssistant";

export default function Financas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaldoVisible, setIsSaldoVisible] = useState(() => {
    const saved = localStorage.getItem('saldoVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        await base44.auth.me();
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      const saved = localStorage.getItem('saldoVisible');
      if (saved !== null) {
        setIsSaldoVisible(JSON.parse(saved));
      }
    };

    window.addEventListener('saldoVisibilityChange', handleVisibilityChange);
    return () => window.removeEventListener('saldoVisibilityChange', handleVisibilityChange);
  }, []);

  const handleToggleSaldo = () => {
    const newValue = !isSaldoVisible;
    setIsSaldoVisible(newValue);
    localStorage.setItem('saldoVisible', JSON.stringify(newValue));
    window.dispatchEvent(new Event('saldoVisibilityChange'));
  };

  const { data: transacoes = [] } = useQuery({
    queryKey: ['transacoes'],
    queryFn: () => base44.entities.Transacao.list('-data'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Finanças</h1>
            <p className="text-purple-200">Análise completa das suas receitas e despesas</p>
          </div>
          <Button
            onClick={() => {
              setEditingTransaction(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </Button>
        </motion.div>

        <FinancialKPIs transacoes={transacoes} isVisible={isSaldoVisible} />

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <FinancialChart transacoes={transacoes} isVisible={isSaldoVisible} />
          <CashFlowForecast transacoes={transacoes} isVisible={isSaldoVisible} />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FinancialAssistant transacoes={transacoes} />
          </div>
          <FinancialGoals />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionList
              transacoes={transacoes}
              onEdit={(transaction) => {
                setEditingTransaction(transaction);
                setDialogOpen(true);
              }}
            />
          </div>
          <FinancialInsights transacoes={transacoes} />
        </div>

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transaction={editingTransaction}
        />
      </div>
    </div>
  );
}
