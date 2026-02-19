import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

const estrategias = [
  {
    icon: TrendingUp,
    titulo: "Frequência Ideal",
    descricao: "Poste pelo menos 1 Reels por dia e mantenha Stories ativos a cada 3-4 horas. Consistência é mais importante que perfeição.",
    cor: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    titulo: "Stories Diários",
    descricao: "Use Stories para criar conexão diária. Mostre sua rotina, valor e autoridade. Quanto mais você aparece, mais as pessoas confiam.",
    cor: "from-purple-500 to-pink-500"
  },
  {
    icon: Target,
    titulo: "Regra 80/20",
    descricao: "80% do conteúdo deve entregar valor (educação, inspiração, entretenimento). 20% pode ser venda direta. Construa relacionamento antes de vender.",
    cor: "from-green-500 to-emerald-500"
  },
  {
    icon: Heart,
    titulo: "Constância é a Chave",
    descricao: "Resultados vêm com o tempo. Não desista após 1 semana. Comprometa-se com pelo menos 90 dias de conteúdo consistente.",
    cor: "from-orange-500 to-red-500"
  }
];

export default function ContentStrategy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Estratégia de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {estrategias.map((estrategia, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-purple-800/30 rounded-lg p-4"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${estrategia.cor} mb-3`}>
                  <estrategia.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">{estrategia.titulo}</h4>
                <p className="text-purple-200 text-sm">{estrategia.descricao}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-300 font-bold mb-2 flex items-center gap-2">
              🔥 Lembrete Motivacional
            </h4>
            <p className="text-white text-sm">
              Cada story é uma oportunidade de aparecer na mente do seu público. Cada vídeo é uma chance de viralizar. 
              <strong> Não existe fracasso, apenas aprendizado.</strong> Continue criando, continue postando, continue evoluindo!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
