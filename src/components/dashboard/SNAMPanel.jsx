import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ExternalLink, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function SNAMPanel() {
  const { isDarkMode } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [height, setHeight] = useState(500);
  const [pressTimer, setPressTimer] = useState(null);
  const [isPressing, setIsPressing] = useState(false);
  const [showIframe, setShowIframe] = useState(true);
  const snamUrl = "https://www.snamchile.cl/";

  const handlePressStart = () => {
    setIsPressing(true);
    const timer = setTimeout(() => {
      setHeight(prev => Math.min(prev + 200, 1200));
      setIsPressing(false);
    }, 3000);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsPressing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={cn(
      "p-6 border-2 shadow-xl",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>SNAM Chile</h2>
            <p className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Sistema de Alertas de Tsunami</p>
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
          <div className="relative">
            {showIframe ? (
              <>
                <div 
                  className="rounded-lg overflow-hidden border border-slate-200" 
                  style={{ height: `${height}px`, width: '100%' }}
                >
                  <iframe 
                    key={refreshKey}
                    src={snamUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="SNAM Chile"
                    allowFullScreen
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowIframe(false)}
                  className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white"
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
                style={{ height: `${height}px`, width: '100%' }}
                onClick={() => setShowIframe(true)}
              >
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  )}>Click para mostrar SNAM</p>
                </div>
              </div>
            )}
            <div 
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className={cn(
                "absolute bottom-0 right-0 w-12 h-12 cursor-pointer rounded-tl-lg transition-all",
                isPressing 
                  ? "bg-emerald-500/50 animate-pulse" 
                  : "bg-emerald-500/20 hover:bg-emerald-500/30"
              )}
            >
              <div className="absolute bottom-1 right-1 text-xs text-emerald-600 font-bold">
                ⬇
              </div>
            </div>
          </div>

          <div className={cn(
            "mt-4 pt-3 border-t",
            isDarkMode ? "border-zinc-800" : "border-slate-200"
          )}>
            <a 
              href={snamUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                isDarkMode 
                  ? "text-emerald-400 hover:text-emerald-300" 
                  : "text-emerald-600 hover:text-emerald-700"
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