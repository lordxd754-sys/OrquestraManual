import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationManager() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(() => {
    return localStorage.getItem('storyNotifications') === 'true';
  });

  React.useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission();
      scheduleNotifications();
    } else {
      clearNotificationSchedule();
    }
  }, [notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const scheduleNotifications = () => {
    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('Hora de postar Stories 🚀', {
          body: 'Mostre sua rotina, valor e autoridade.',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
    }, 3 * 60 * 60 * 1000); // 3 horas

    localStorage.setItem('notificationInterval', interval);
  };

  const clearNotificationSchedule = () => {
    const interval = localStorage.getItem('notificationInterval');
    if (interval) {
      clearInterval(parseInt(interval));
      localStorage.removeItem('notificationInterval');
    }
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('storyNotifications', newValue.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Sistema de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium mb-1">
                Lembrete a cada 3 horas
              </p>
              <p className="text-orange-200 text-sm">
                "Hora de postar Stories 🚀 Mostre sua rotina, valor e autoridade."
              </p>
            </div>
            <Button
              onClick={toggleNotifications}
              variant={notificationsEnabled ? "default" : "outline"}
              className={notificationsEnabled 
                ? "bg-orange-500 hover:bg-orange-600" 
                : "text-orange-300 border-orange-500/50 hover:bg-orange-500/20"}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Ativado
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Desativado
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
