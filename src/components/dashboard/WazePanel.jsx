import React from 'react';
import { Card } from "@/components/ui/card";
import { Navigation } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function WazePanel() {
  const { isDarkMode } = useTheme();

  return (
    <div>
      <div className={cn(
        "flex items-center gap-2 pb-3 border-b mb-4",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <div className="w-1 h-6 bg-blue-500"></div>
        <h2 className={cn(
          "text-lg font-bold tracking-wider",
          isDarkMode ? "text-white" : "text-slate-900"
        )}>MONITOREO DE TRÁNSITO VEHICULAR</h2>
      </div>
      
      <Card className={cn(
        "overflow-hidden",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="relative w-full" style={{ height: '600px' }}>
          <iframe
            src="https://www.waze.com/es/live-map"
            className="w-full h-full border-0"
            title="Waze Live Map - Monitoreo de Tránsito"
            allow="geolocation"
          />
        </div>
        <div className={cn(
          "p-3 border-t flex items-center justify-between",
          isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span className={cn(
              "text-xs font-medium",
              isDarkMode ? "text-slate-300" : "text-slate-600"
            )}>
              Waze Live Map - Tránsito en Tiempo Real
            </span>
          </div>
          <a
            href="https://www.waze.com/es/live-map"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-xs font-medium hover:underline",
              isDarkMode ? "text-blue-400" : "text-blue-600"
            )}
          >
            Abrir en nueva pestaña →
          </a>
        </div>
      </Card>
    </div>
  );
}