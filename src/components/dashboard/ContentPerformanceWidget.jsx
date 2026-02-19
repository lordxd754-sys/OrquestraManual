import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function ContentPerformanceWidget({ historico, stories, roteiros }) {
  const ultimaSemana = historico.filter(h => {
    const data = new Date(h.horario_postagem);
    const agora = new Date();
    const diffDias = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
    return diffDias <= 7;
  });

  const statsPorTipo = {
    stories: ultimaSemana.filter(h => h.tipo_conteudo === 'stories').length,
    reels: ultimaSemana.filter(h => h.tipo_conteudo === 'reels').length,
    feed: ultimaSemana.filter(h => h.tipo_conteudo === 'feed').length,
    carrossel: ultimaSemana.filter(h => h.tipo_conteudo === 'carrossel').length,
  };

  const totalPostagens = Object.values(statsPorTipo).reduce((a, b) => a + b, 0);
  const storiesPendentes = stories?.filter(s => !s.postado).length || 0;
  const roteirosPendentes = roteiros?.filter(r => !r.gravado).length || 0;

  const tiposConteudo = [
    { tipo: 'Stories', count: statsPorTipo.stories, icon: '📸', color: 'bg-pink-500' },
    { tipo: 'Reels', count: statsPorTipo.reels, icon: '🎬', color: 'bg-purple-500' },
    { tipo: 'Feed', count: statsPorTipo.feed, icon: '📱', color: 'bg-blue-500' },
    { tipo: 'Carrossel', count: statsPorTipo.carrossel, icon: '🎨', color: 'bg-green-500' }
  ];

  return (
    <Card className="glass-effect border-white/5 h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Performance de Conteúdo
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalPostagens}</p>
            <p className="text-xs text-gray-400">última semana</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {tiposConteudo.map((item, index) => (
            <motion.div
              key={item.tipo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white text-sm font-medium">{item.tipo}</span>
                </div>
                <span className="text-gray-400 text-sm">{item.count}</span>
              </div>
              <Progress 
                value={totalPostagens > 0 ? (item.count / totalPostagens) * 100 : 0} 
                className={`h-2 bg-gray-800`}
              />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Pendentes</span>
            </div>
            <p className="text-xl font-bold text-white">{storiesPendentes + roteirosPendentes}</p>
          </div>

          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Criados</span>
            </div>
            <p className="text-xl font-bold text-white">{(stories?.length || 0) + (roteiros?.length || 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
