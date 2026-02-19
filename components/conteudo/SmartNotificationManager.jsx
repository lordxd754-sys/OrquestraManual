import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Smartphone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function SmartNotificationManager() {
  const [permissaoStatus, setPermissaoStatus] = React.useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(() => {
    return localStorage.getItem('smartNotifications') === 'true';
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['configs-notificacao'],
    queryFn: () => base44.entities.ConfiguracaoNotificacao.list(),
    initialData: [],
  });

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermissaoStatus(Notification.permission);
    }
  }, []);

  React.useEffect(() => {
    if (notificationsEnabled && configs.length > 0) {
      scheduleSmartNotifications();
    } else {
      clearAllNotifications();
    }

    return () => clearAllNotifications();
  }, [notificationsEnabled, configs]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissaoStatus(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('smartNotifications', 'true');
        
        // Notificação de boas-vindas
        new Notification('🎉 Notificações Ativadas!', {
          body: 'Você receberá lembretes personalizados para seus horários de postagem.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'welcome'
        });
      }
    }
  };

  const scheduleSmartNotifications = () => {
    clearAllNotifications();
    
    configs.forEach(config => {
      if (!config.ativo || !config.horarios) return;

      config.horarios.forEach(horario => {
        const [horas, minutos] = horario.split(':').map(Number);
        const agora = new Date();
        const proximaNotificacao = new Date();
        proximaNotificacao.setHours(horas, minutos, 0, 0);

        if (proximaNotificacao <= agora) {
          proximaNotificacao.setDate(proximaNotificacao.getDate() + 1);
        }

        const diaSemana = proximaNotificacao.getDay();
        if (!config.dias_semana?.includes(diaSemana)) {
          return;
        }

        const delay = proximaNotificacao.getTime() - agora.getTime();
        
        const timeoutId = setTimeout(() => {
          if (Notification.permission === 'granted') {
            const tipoLabels = {
              stories: { emoji: '📸', nome: 'Stories' },
              reels: { emoji: '🎬', nome: 'Reels' },
              feed: { emoji: '📱', nome: 'Feed' },
              carrossel: { emoji: '🎨', nome: 'Carrossel' }
            };
            
            const tipo = tipoLabels[config.tipo_conteudo] || { emoji: '📱', nome: 'Conteúdo' };
            
            new Notification(`${tipo.emoji} Hora de postar ${tipo.nome}!`, {
              body: `É ${horario} - horário ideal para engajamento. Crie seu conteúdo agora!`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `notification-${config.id}-${horario}`,
              requireInteraction: true,
              actions: [
                { action: 'open', title: 'Abrir App' }
              ]
            });

            // Reagendar para o próximo dia
            scheduleSmartNotifications();
          }
        }, delay);

        // Armazenar o ID do timeout para limpeza posterior
        const timeouts = JSON.parse(localStorage.getItem('notificationTimeouts') || '[]');
        timeouts.push(timeoutId);
        localStorage.setItem('notificationTimeouts', JSON.stringify(timeouts));
      });
    });
  };

  const clearAllNotifications = () => {
    const timeouts = JSON.parse(localStorage.getItem('notificationTimeouts') || '[]');
    timeouts.forEach(id => clearTimeout(id));
    localStorage.setItem('notificationTimeouts', '[]');
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && permissaoStatus !== 'granted') {
      requestPermission();
    } else {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      localStorage.setItem('smartNotifications', newValue.toString());
    }
  };

  const registrarPostagem = async (tipo) => {
    try {
      await base44.entities.HistoricoPostagem.create({
        tipo_conteudo: tipo,
        horario_postagem: new Date().toISOString(),
        dia_semana: new Date().getDay()
      });
    } catch (error) {
      console.error('Erro ao registrar postagem:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-effect border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Sistema de Notificações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  {notificationsEnabled ? (
                    <>
                      <Bell className="w-5 h-5 text-green-400" />
                      Notificações Ativas
                    </>
                  ) : (
                    <>
                      <BellOff className="w-5 h-5 text-gray-400" />
                      Notificações Desativadas
                    </>
                  )}
                </h4>
                <p className="text-sm text-gray-300 mb-2">
                  {notificationsEnabled
                    ? 'Receba lembretes personalizados nos seus melhores horários de postagem.'
                    : 'Ative as notificações para receber lembretes inteligentes.'}
                </p>
                
                {configs.length > 0 && notificationsEnabled && (
                  <div className="mt-3 text-xs text-gray-400">
                    <p className="mb-1">📊 {configs.length} configurações ativas</p>
                    <p>🤖 Sistema aprende com seu comportamento para sugerir melhores horários</p>
                  </div>
                )}
              </div>
              
              <Button
                onClick={toggleNotifications}
                className={notificationsEnabled 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-purple-600 hover:bg-purple-700"}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Ativo
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
            </div>

            {permissaoStatus === 'denied' && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-300">
                  ⚠️ As notificações estão bloqueadas. Habilite nas configurações do navegador.
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h5 className="text-white font-medium text-sm">Notificações Web</h5>
              </div>
              <p className="text-xs text-gray-400">
                Receba alertas no navegador mesmo com o app fechado
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h5 className="text-white font-medium text-sm">Notificações Mobile</h5>
              </div>
              <p className="text-xs text-gray-400">
                Adicione à tela inicial para notificações no celular
              </p>
            </div>
          </div>

          {configs.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Configure seus horários personalizados abaixo para começar a receber notificações inteligentes
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
