
import React from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoriaLabels = {
  trabalho: 'Trabalho',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  lazer: 'Lazer',
  educacao: 'Educação',
  casa: 'Casa',
  outros: 'Outros'
};

export default function TransactionList({ transacoes, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    },
  });

  return (
    <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
      <CardContent className="p-6">
        <h2 className="text-white text-xl font-semibold mb-4">Transações Recentes</h2>
        
        <div className="space-y-3">
          <AnimatePresence>
            {transacoes.length === 0 ? (
              <p className="text-purple-200 text-center py-8">
                Nenhuma transação registrada
              </p>
            ) : (
              transacoes.map((transacao, index) => (
                <motion.div
                  key={transacao.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-purple-800/30 rounded-lg p-4 hover:bg-purple-800/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      transacao.tipo === 'receita'
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {transacao.tipo === 'receita' ? (
                        <TrendingUp className="w-5 h-5 text-green-300" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {transacao.descricao}
                      </p>
                      <p className="text-purple-200 text-sm">
                        {format(new Date(transacao.data), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transacao.tipo === 'receita'
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="bg-purple-800/30 text-purple-200 border-purple-500/30 mt-1">
                        {categoriaLabels[transacao.categoria]}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transacao)}
                        className="text-purple-200 hover:text-white hover:bg-purple-800/50"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(transacao.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
