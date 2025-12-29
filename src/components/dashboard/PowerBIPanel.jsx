import React from 'react';
import { Card } from "@/components/ui/card";
import { BarChart3, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function PowerBIPanel() {
  const { isDarkMode } = useTheme();
  const powerBIUrl = "https://app.powerbi.com/view?r=eyJrIjoiZDZjZTExZTctM2MwMC00Mzk5LTkzYzAtODNlOTk0NDAzMWY5IiwidCI6IjZlMTA2YmFkLTk5NTAtNDcxNC1iY2JhLWZlYTUwMDNlNTY4OCIsImMiOjR9";

  return (
    <Card className={cn(
      "p-6 border-2 shadow-xl",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Dashboard Power BI</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Análisis y métricas</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '500px', width: '100%' }}>
        <iframe 
          src={powerBIUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Power BI Dashboard"
          allowFullScreen
        />
      </div>

      <div className={cn(
        "mt-4 pt-3 border-t",
        isDarkMode ? "border-zinc-800" : "border-slate-200"
      )}>
        <a 
          href={powerBIUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "text-xs font-medium flex items-center gap-1",
            isDarkMode 
              ? "text-blue-400 hover:text-blue-300" 
              : "text-blue-600 hover:text-blue-700"
          )}
        >
          Abrir en pantalla completa
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}