import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, gradient, showToggle, isVisible, onToggleVisibility }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-purple-200 text-sm font-medium mb-2">{title}</p>
              <p className="text-3xl font-bold text-white">
                {showToggle && !isVisible ? '••••••' : value}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {showToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleVisibility}
                  className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/30"
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
