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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionDialog({ open, onOpenChange, transaction }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria: 'outros',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        categoria: 'outros',
        data: new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transacao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      valor: parseFloat(formData.valor)
    };

    if (transaction) {
      updateMutation.mutate({ id: transaction.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Tipo</Label>
            <Tabs
              value={formData.tipo}
              onValueChange={(value) => setFormData({...formData, tipo: value})}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="receita" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                  Receita
                </TabsTrigger>
                <TabsTrigger value="despesa" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
                  Despesa
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({...formData, categoria: value})}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="lazer">Lazer</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
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
              {transaction ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
