import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const coresDisponiveis = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
  '#10B981', '#3B82F6', '#EF4444', '#06B6D4'
];

export default function HabitDialog({ open, onOpenChange, habit }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome: '',
    objetivo_diario: '',
    unidade: 'minutos',
    progresso_atual: 0,
    dias_seguidos: 0,
    cor: '#6366F1'
  });

  useEffect(() => {
    if (habit) {
      setFormData(habit);
    } else {
      setFormData({
        nome: '',
        objetivo_diario: '',
        unidade: 'minutos',
        progresso_atual: 0,
        dias_seguidos: 0,
        cor: '#6366F1'
      });
    }
  }, [habit, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Habito.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitos'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Habito.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitos'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      objetivo_diario: parseFloat(formData.objetivo_diario)
    };

    if (habit) {
      updateMutation.mutate({ id: habit.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {habit ? 'Editar Hábito' : 'Novo Hábito'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Hábito *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Ex: Meditar, Exercitar, Ler..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objetivo_diario">Meta Diária *</Label>
              <Input
                id="objetivo_diario"
                type="number"
                step="0.01"
                value={formData.objetivo_diario}
                onChange={(e) => setFormData({...formData, objetivo_diario: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Input
                id="unidade"
                value={formData.unidade}
                onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                placeholder="minutos, páginas, km..."
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Cor do Hábito</Label>
            <div className="flex gap-3 flex-wrap">
              {coresDisponiveis.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData({...formData, cor})}
                  className={`w-10 h-10 rounded-full transition-all ${
                    formData.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {habit ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
