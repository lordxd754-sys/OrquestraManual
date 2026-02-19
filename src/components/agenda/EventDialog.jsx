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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const coresDisponiveis = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
  '#10B981', '#3B82F6', '#EF4444', '#06B6D4'
];

const diasSemana = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 }
];

export default function EventDialog({ open, onOpenChange, event, selectedDate }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    cor: '#6366F1',
    recorrencia: 'nenhuma',
    dias_semana: [],
    recorrencia_ate: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        data_inicio: event.data_inicio ? format(new Date(event.data_inicio), "yyyy-MM-dd'T'HH:mm") : '',
        data_fim: event.data_fim ? format(new Date(event.data_fim), "yyyy-MM-dd'T'HH:mm") : '',
        recorrencia_ate: event.recorrencia_ate || '',
        dias_semana: event.dias_semana || []
      });
    } else {
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(selectedDate);
      defaultEnd.setHours(10, 0, 0, 0);

      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        data_fim: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        local: '',
        cor: '#6366F1',
        recorrencia: 'nenhuma',
        dias_semana: [],
        recorrencia_ate: ''
      });
    }
  }, [event, selectedDate, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Evento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      onOpenChange(false);
    },
  });

  const handleDiaSemanaToggle = (dia) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia].sort()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: new Date(formData.data_fim).toISOString(),
      recorrencia_ate: formData.recorrencia_ate || null,
      dias_semana: formData.recorrencia === 'dias_especificos' ? formData.dias_semana : null
    };

    if (event) {
      updateMutation.mutate({ id: event.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Ex: Reunião com equipe"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
              rows={3}
              placeholder="Adicione detalhes sobre o evento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data e Hora Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="data_fim">Data e Hora Fim *</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData({...formData, local: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Ex: Sala de Reuniões 3"
            />
          </div>

          <div>
            <Label htmlFor="recorrencia">Repetir</Label>
            <Select
              value={formData.recorrencia}
              onValueChange={(value) => setFormData({...formData, recorrencia: value, dias_semana: []})}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Não repetir</SelectItem>
                <SelectItem value="diaria">Diariamente</SelectItem>
                <SelectItem value="semanal">Semanalmente</SelectItem>
                <SelectItem value="dias_especificos">Dias específicos da semana</SelectItem>
                <SelectItem value="mensal">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recorrencia === 'dias_especificos' && (
            <div>
              <Label className="mb-3 block">Selecione os dias da semana</Label>
              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => (
                  <div key={dia.value} className="flex flex-col items-center">
                    <Checkbox
                      id={`dia-${dia.value}`}
                      checked={formData.dias_semana.includes(dia.value)}
                      onCheckedChange={() => handleDiaSemanaToggle(dia.value)}
                      className="mb-2 border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label 
                      htmlFor={`dia-${dia.value}`}
                      className="text-xs text-purple-200 cursor-pointer"
                    >
                      {dia.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.dias_semana.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  Selecione pelo menos um dia da semana
                </p>
              )}
            </div>
          )}

          {formData.recorrencia !== 'nenhuma' && (
            <div>
              <Label htmlFor="recorrencia_ate">Repetir até</Label>
              <Input
                id="recorrencia_ate"
                type="date"
                value={formData.recorrencia_ate}
                onChange={(e) => setFormData({...formData, recorrencia_ate: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
              />
              <p className="text-xs text-purple-300 mt-1">
                Deixe em branco para repetir indefinidamente
              </p>
            </div>
          )}

          <div>
            <Label className="mb-3 block">Cor do Evento</Label>
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
              disabled={formData.recorrencia === 'dias_especificos' && formData.dias_semana.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {event ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
