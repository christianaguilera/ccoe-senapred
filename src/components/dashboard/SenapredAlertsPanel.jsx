import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function SenapredAlertsPanel() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showIframe, setShowIframe] = useState(true);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={cn(
      "p-6",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isDarkMode ? "bg-orange-500" : "bg-orange-100"
          )}>
            <AlertTriangle className={cn(
              "w-4 h-4",
              isDarkMode ? "text-white" : "text-orange-600"
            )} />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Alertas SENAPRED</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Sistema Nacional de Emergencia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className={cn(
              "h-8 w-8",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-8 w-8",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            )}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="relative">
            {showIframe ? (
              <>
                <div className={cn(
                  "rounded-lg overflow-hidden border",
                  isDarkMode ? "border-slate-700" : "border-slate-200"
                )} style={{ height: '400px', width: '100%' }}>
                  <iframe 
                    key={refreshKey}
                    src="https://senapred.cl/alertas/"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Alertas SENAPRED"
                    allowFullScreen
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowIframe(false)}
                  className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div 
                className={cn(
                  "rounded-lg border flex items-center justify-center cursor-pointer",
                  isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-slate-100 border-slate-300"
                )}
                style={{ height: '400px', width: '100%' }}
                onClick={() => setShowIframe(true)}
              >
                <div className="text-center">
                  <AlertTriangle className={cn("w-12 h-12 mx-auto mb-2", isDarkMode ? "text-orange-400" : "text-orange-500")} />
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  )}>Click para mostrar Alertas SENAPRED</p>
                </div>
              </div>
            )}
          </div>

          <div className={cn(
            "mt-4 pt-3 border-t",
            isDarkMode ? "border-slate-800" : "border-slate-200"
          )}>
            <a
              href="https://senapred.cl/alertas/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                isDarkMode 
                  ? "text-orange-400 hover:text-orange-300" 
                  : "text-orange-600 hover:text-orange-700"
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