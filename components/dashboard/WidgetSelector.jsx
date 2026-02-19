import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckSquare, DollarSign, Target, TrendingUp, Calendar, Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

const widgetsDisponiveis = [
  { id: 'tarefas-recentes', nome: 'Tarefas Recentes', icon: CheckSquare, descricao: 'Últimas tarefas e progresso' },
  { id: 'resumo-financeiro', nome: 'Resumo Financeiro', icon: DollarSign, descricao: 'Receitas, despesas e saldo' },
  { id: 'habitos-hoje', nome: 'Hábitos de Hoje', icon: Target, descricao: 'Progresso dos seus hábitos' },
  { id: 'performance-conteudo', nome: 'Performance de Conteúdo', icon: TrendingUp, descricao: 'Estatísticas de postagens' },
  { id: 'proximos-eventos', nome: 'Próximos Eventos', icon: Calendar, descricao: 'Agenda e compromissos' },
  { id: 'assistente-ia', nome: 'Assistente IA', icon: Sparkles, descricao: 'Insights inteligentes' }
];

export default function WidgetSelector({ open, onOpenChange, widgetsAtivos, onToggleWidget }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Personalizar Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {widgetsDisponiveis.map((widget, index) => {
            const isAtivo = widgetsAtivos.some(w => w.type === widget.id && w.visible);
            return (
              <motion.button
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onToggleWidget(widget.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isAtivo
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isAtivo ? 'bg-purple-500/30' : 'bg-white/10'}`}>
                    <widget.icon className={`w-5 h-5 ${isAtivo ? 'text-purple-300' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm mb-1">{widget.nome}</h4>
                    <p className="text-xs text-gray-400">{widget.descricao}</p>
                  </div>
                  {isAtivo && (
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
