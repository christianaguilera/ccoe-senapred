import React from 'react';
import { Card } from "@/components/ui/card";
import { CloudSun, ExternalLink } from 'lucide-react';
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
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isDarkMode ? "bg-cyan-600" : "bg-cyan-500"
          )}>
            <CloudSun className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={cn(
              "font-bold tracking-wide",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>METEOCHILE</h3>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Dirección Meteorológica de Chile</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '500px', width: '100%' }}>
        <iframe 
          src="https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Meteochile Portal"
        />
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
              ? "text-cyan-400 hover:text-cyan-300" 
              : "text-cyan-600 hover:text-cyan-700"
          )}
        >
          Abrir en Meteochile
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}