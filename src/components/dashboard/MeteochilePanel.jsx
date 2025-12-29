import React from 'react';
import { Card } from "@/components/ui/card";
import { CloudRain, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function MeteochilePanel() {
  const { isDarkMode } = useTheme();

  return (
    <Card className={cn(
      "p-6 border-2 shadow-xl",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <CloudRain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Meteochile</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Dirección Meteorológica de Chile</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className={cn(
          "rounded-lg overflow-hidden border",
          isDarkMode ? "border-zinc-700" : "border-slate-200"
        )} style={{ height: '400px', width: '100%' }}>
          <iframe 
            src="https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Meteochile Portal"
          />
        </div>
      </div>

      <div className={cn(
        "mt-4 pt-3 border-t",
        isDarkMode ? "border-zinc-800" : "border-slate-200"
      )}>
        <a 
          href="https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml"
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "text-xs font-medium flex items-center gap-1",
            isDarkMode 
              ? "text-sky-400 hover:text-sky-300" 
              : "text-sky-600 hover:text-sky-700"
          )}
        >
          Abrir en Meteochile.cl
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}