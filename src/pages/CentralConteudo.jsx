import React from "react";
import { motion } from "framer-motion";
import SmartNotificationManager from "../components/conteudo/SmartNotificationManager";
import NotificationSettings from "../components/conteudo/NotificationSettings";
import StoryPlanner from "../components/conteudo/StoryPlanner";
import VideoScriptCreator from "../components/conteudo/VideoScriptCreator";
import ContentIdeasBank from "../components/conteudo/ContentIdeasBank";
import ContentStrategy from "../components/conteudo/ContentStrategy";
import NotesInsights from "../components/conteudo/NotesInsights";
import ContentRadar from "../components/conteudo/ContentRadar";

export default function CentralConteudo() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Central de Criação de Conteúdo 🎬
          </h1>
          <p className="text-purple-200 text-lg">
            Crie conteúdo com consistência, autoridade e estratégia para Instagram
          </p>
        </motion.div>

        <div className="space-y-6">
          <ContentRadar />
          
          <SmartNotificationManager />
          
          <NotificationSettings />

          <div className="grid lg:grid-cols-2 gap-6">
            <StoryPlanner />
            <VideoScriptCreator />
          </div>

          <ContentIdeasBank />

          <div className="grid lg:grid-cols-2 gap-6">
            <ContentStrategy />
            <NotesInsights />
          </div>
        </div>
      </div>
    </div>
  );
}
