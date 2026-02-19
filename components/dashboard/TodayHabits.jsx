import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function TodayHabits({ habitos }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hábitos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {habitos.length === 0 ? (
                <p className="text-purple-200 text-center py-8">
                  Nenhum hábito criado ainda
                </p>
              ) : (
                habitos.map((habito, index) => {
                  const progresso = (habito.progresso_atual / habito.objetivo_diario) * 100;
                  return (
                    <motion.div
                      key={habito.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-purple-800/30 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-medium">{habito.nome}</p>
                          <p className="text-purple-200 text-sm">
                            {habito.progresso_atual} / {habito.objetivo_diario} {habito.unidade}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            {Math.round(progresso)}%
                          </p>
                          {habito.dias_seguidos > 0 && (
                            <p className="text-purple-200 text-xs">
                              🔥 {habito.dias_seguidos} dias
                            </p>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={progresso} 
                        className="h-2"
                        style={{
                          '--progress-background': habito.cor || '#6366F1'
                        }}
                      />
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
