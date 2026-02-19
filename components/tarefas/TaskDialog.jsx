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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Tag, Flag, Target } from "lucide-react";

export default function TaskDialog({ open, onOpenChange, task }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prazo: '',
    prioridade: 'media',
    status: 'pendente',
    categoria: ''
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        prazo: '',
        prioridade: 'media',
        status: 'pendente',
        categoria: ''
      });
    }
  }, [task, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Tarefa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tarefa.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (task) {
      updateMutation.mutate({ id: task.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {task ? '✏️ Editar Tarefa' : '✨ Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-purple-200 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Título da Tarefa *
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500"
              placeholder="Ex: Preparar apresentação do projeto"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-purple-200">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
              placeholder="Adicione mais detalhes sobre a tarefa..."
              rows={4}
            />
          </div>

          {/* Grid de 2 colunas */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Prazo */}
            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-purple-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prazo
              </Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="prioridade" className="text-purple-200 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Prioridade
              </Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({...formData, prioridade: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="baixa" className="text-white hover:bg-white/10">
                    🔵 Baixa
                  </SelectItem>
                  <SelectItem value="media" className="text-white hover:bg-white/10">
                    🟡 Média
                  </SelectItem>
                  <SelectItem value="alta" className="text-white hover:bg-white/10">
                    🔴 Alta
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-purple-200 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoria
            </Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500"
              placeholder="Ex: Trabalho, Pessoal, Estudos..."
            />
          </div>

          {/* Status (apenas ao editar) */}
          {task && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-purple-200">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="pendente" className="text-white hover:bg-white/10">
                    ⭕ Pendente
                  </SelectItem>
                  <SelectItem value="em_progresso" className="text-white hover:bg-white/10">
                    🔄 Em Progresso
                  </SelectItem>
                  <SelectItem value="concluida" className="text-white hover:bg-white/10">
                    ✅ Concluída
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : task ? '💾 Salvar Alterações' : '✨ Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
