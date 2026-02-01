import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function PowerBIPanel() {
  const { isDarkMode } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [height, setHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [showIframe, setShowIframe] = useState(true);
  const powerBIUrl = "https://experience.arcgis.com/experience/6fd06a884b7e43de800927c153a90e7c/page/PYROCAST?views=Monitoreo";

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newHeight = e.clientY - e.target.getBoundingClientRect().top;
        if (newHeight > 300 && newHeight < 1200) {
          setHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
          <div className="relative">
            {showIframe ? (
              <>
                <div 
                  className="rounded-lg overflow-hidden border border-slate-200" 
                  style={{ height: `${height}px`, width: '100%' }}
                >
                  <iframe 
                    key={refreshKey}
                    src={powerBIUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Power BI Dashboard"
                    allowFullScreen
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowIframe(false)}
                  className={cn(
                    "absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white z-10",
                    isDarkMode && "bg-red-500/90"
                  )}
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
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  )}>Click para mostrar dashboard</p>
                </div>
              </div>
            )}
            <div 
              onMouseDown={handleMouseDown}
              className={cn(
                "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/20 transition-colors",
                isResizing && "bg-blue-500/30"
              )}
              style={{ height: '8px' }}
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
        </>
      )}
    </Card>
  );
}