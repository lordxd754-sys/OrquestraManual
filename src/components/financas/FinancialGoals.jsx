import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

export default function FinancialGoals() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    titulo: '',
    tipo: 'economia',
    valor_alvo: '',
    prazo: ''
  });
  const queryClient = useQueryClient();

  const { data: metas = [] } = useQuery({
    queryKey: ['metas-financeiras'],
    queryFn: () => base44.entities.MetaFinanceira.list('-created_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MetaFinanceira.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-financeiras'] });
      setDialogOpen(false);
      setFormData({ titulo: '', tipo: 'economia', valor_alvo: '', prazo: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MetaFinanceira.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-financeiras'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      valor_alvo: parseFloat(formData.valor_alvo)
    });
  };

  const tipoLabels = {
    economia: 'Economia',
    receita: 'Receita',
    reducao_despesa: 'Redução de Despesa',
    saldo_alvo: 'Saldo Alvo'
  };

  return (
    <>
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Metas Financeiras
            </h2>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>

          {metas.length === 0 ? (
            <p className="text-purple-200 text-center py-8 text-sm">
              Defina metas financeiras para acompanhar seu progresso
            </p>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {metas.filter(m => m.ativa && !m.concluida).map((meta, index) => {
                  const progresso = (meta.valor_atual / meta.valor_alvo) * 100;
                  const diasRestantes = Math.ceil((new Date(meta.prazo) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <motion.div
                      key={meta.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-purple-800/30 border border-purple-500/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{meta.titulo}</h3>
                          <p className="text-sm text-purple-200 mt-1">
                            {tipoLabels[meta.tipo]} • Prazo: {format(new Date(meta.prazo), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(meta.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">
                            R$ {meta.valor_atual.toFixed(2)} de R$ {meta.valor_alvo.toFixed(2)}
                          </span>
                          <span className="text-purple-300 font-semibold">
                            {progresso.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progresso} className="h-2 bg-purple-900/50" />
                      </div>

                      {diasRestantes > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''} restante{diasRestantes !== 1 ? 's' : ''}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Meta Financeira</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Título</label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Economizar para viagem"
                className="bg-purple-900/30 border-purple-500/30 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tipo</label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-purple-500/30">
                  <SelectItem value="economia">Economia</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="reducao_despesa">Redução de Despesa</SelectItem>
                  <SelectItem value="saldo_alvo">Saldo Alvo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Valor Alvo (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_alvo}
                onChange={(e) => setFormData({ ...formData, valor_alvo: e.target.value })}
                placeholder="0.00"
                className="bg-purple-900/30 border-purple-500/30 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Prazo</label>
              <Input
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                className="bg-purple-900/30 border-purple-500/30 text-white"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-purple-500/30 text-purple-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Criar Meta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
