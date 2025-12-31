import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function HoraOficialPanel() {
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CL', {
      timeZone: 'America/Santiago',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn(
      "p-6 border-2 shadow-xl",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isDarkMode ? "bg-blue-500" : "bg-blue-100"
          )}>
            <Clock className={cn(
              "w-4 h-4",
              isDarkMode ? "text-white" : "text-blue-600"
            )} />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Hora Oficial de Chile</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Sincronizada con el sistema</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className={cn(
            "rounded-lg p-8 text-center border-2",
            isDarkMode 
              ? "bg-gradient-to-br from-blue-950 to-slate-900 border-blue-800" 
              : "bg-gradient-to-br from-blue-50 to-white border-blue-200"
          )}>
            <div className={cn(
              "text-6xl font-bold font-mono tracking-wider mb-4",
              isDarkMode ? "text-blue-400" : "text-blue-600"
            )}>
              {formatTime(currentTime)}
            </div>
            
            <div className={cn(
              "text-sm font-medium capitalize mb-3",
              isDarkMode ? "text-slate-300" : "text-slate-700"
            )}>
              {formatDate(currentTime)}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Globe className={cn(
                "w-4 h-4",
                isDarkMode ? "text-slate-500" : "text-slate-400"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isDarkMode ? "text-slate-500" : "text-slate-500"
              )}>
                Zona Horaria: América/Santiago (UTC{currentTime.toLocaleTimeString('es-CL', { 
                  timeZone: 'America/Santiago', 
                  timeZoneName: 'shortOffset' 
                }).split(' ').pop()})
              </span>
            </div>
          </div>

          <div className={cn(
            "mt-4 pt-3 border-t",
            isDarkMode ? "border-zinc-800" : "border-slate-200"
          )}>
            <div className={cn(
              "text-xs flex items-center gap-2",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Actualización en tiempo real cada segundo
            </div>
          </div>
        </>
      )}
    </Card>
  );
}