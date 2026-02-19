
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import HabitDialog from "../components/habitos/HabitDialog";
import HabitCard from "../components/habitos/HabitCard";

export default function Habitos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

  const { data: habitos = [] } = useQuery({
    queryKey: ['habitos'],
    queryFn: () => base44.entities.Habito.list('-created_date'),
    initialData: [],
    enabled: !isLoadingUser,
  });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Hábitos</h1>
            <p className="text-purple-200">Construa rotinas saudáveis e acompanhe seu progresso</p>
          </div>
          <Button
            onClick={() => {
              setEditingHabit(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Hábito
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habitos.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30 p-12 text-center">
                <p className="text-purple-200 text-lg">
                  Nenhum hábito criado ainda. Comece agora!
                </p>
              </Card>
            </div>
          ) : (
            habitos.map((habito, index) => (
              <HabitCard
                key={habito.id}
                habito={habito}
                index={index}
                onEdit={() => {
                  setEditingHabit(habito);
                  setDialogOpen(true);
                }}
              />
            ))
          )}
        </div>

        <HabitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          habit={editingHabit}
        />
      </div>
    </div>
  );
}
