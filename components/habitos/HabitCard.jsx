
import React from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function HabitCard({ habito, index, onEdit }) {
  const queryClient = useQueryClient();
  const [localProgress, setLocalProgress] = React.useState(habito.progresso_atual);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Habito.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Habito.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitos'] });
    },
  });

  const handleProgressChange = (newProgress) => {
    const validProgress = Math.max(0, Math.min(habito.objetivo_diario, newProgress));
    setLocalProgress(validProgress);
    
    const novosDias = validProgress >= habito.objetivo_diario 
      ? habito.dias_seguidos + 1 
      : habito.dias_seguidos;

    updateMutation.mutate({
      id: habito.id,
      data: {
        ...habito,
        progresso_atual: validProgress,
        dias_seguidos: novosDias
      }
    });
  };

  const progresso = (localProgress / habito.objetivo_diario) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30 overflow-hidden">
        <div 
          className="h-2"
          style={{
            background: `linear-gradient(to right, ${habito.cor || '#6366F1'} ${progresso}%, transparent ${progresso}%)`
          }}
        />
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-1">{habito.nome}</h3>
              <p className="text-purple-200 text-sm">
                Meta: {habito.objetivo_diario} {habito.unidade}
              </p>
            </div>
            
            {habito.dias_seguidos > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-bold text-sm">
                  {habito.dias_seguidos}
                </span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-200 text-sm">Progresso Hoje</span>
              <span className="text-white font-bold">{Math.round(progresso)}%</span>
            </div>
            <Progress 
              value={progresso}
              className="h-3"
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleProgressChange(localProgress - 1)}
              className="bg-purple-800/30 border-purple-500/30 text-white hover:bg-purple-800/50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <Input
              type="number"
              value={localProgress}
              onChange={(e) => handleProgressChange(parseFloat(e.target.value) || 0)}
              className="text-center bg-purple-800/30 border-purple-500/30 text-white font-bold"
            />
            
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleProgressChange(localProgress + 1)}
              className="bg-purple-800/30 border-purple-500/30 text-white hover:bg-purple-800/50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="flex-1 text-purple-200 hover:text-white hover:bg-purple-800/50"
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate(habito.id)}
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
