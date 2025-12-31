import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function PowerBIPanel() {
  const { isDarkMode } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const powerBIUrl = "https://app.powerbi.com/view?r=eyJrIjoiZDZjZTExZTctM2MwMC00Mzk5LTkzYzAtODNlOTk0NDAzMWY5IiwidCI6IjZlMTA2YmFkLTk5NTAtNDcxNC1iY2JhLWZlYTUwMDNlNTY4OCIsImMiOjR9";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

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
            )}>Incendios Forestales</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Análisis y métricas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
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
        </>
      )}
    </Card>
  );
}