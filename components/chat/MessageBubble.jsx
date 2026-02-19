import React from 'react';
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MessageBubble({ conversa, index }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-3 justify-end"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className="text-white">{conversa.mensagem_usuario}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.2 }}
        className="flex gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="bg-purple-800/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <p className="text-white mb-3">{conversa.resposta_ia}</p>
          
          {conversa.acoes_executadas && conversa.acoes_executadas.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-purple-500/30">
              {conversa.acoes_executadas.map((acao, idx) => (
                <Badge 
                  key={idx}
                  variant="secondary"
                  className="bg-purple-700/50 text-white border-purple-500/30"
                >
                  {acao}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
