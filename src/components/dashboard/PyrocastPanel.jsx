import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function PyrocastPanel() {
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pyrocastUrl = "https://experience.arcgis.com/experience/6fd06a884b7e43de800927c153a90e7c/page/PYROCAST?views=Monitoreo";

  return (
    <div>
      <div className={cn(
        "flex items-center justify-between pb-3 border-b mb-4",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <h2 className={cn(
          "text-lg font-bold tracking-wider flex items-center gap-2",
          isDarkMode ? "text-white" : "text-slate-900"
        )}>
          <div className="w-1 h-6 bg-orange-500"></div>
          <Flame className="w-5 h-5 text-orange-500" />
          PYROCAST - MONITOREO
        </h2>
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
        <Card className={cn(
          "p-0 border-2 shadow-xl overflow-hidden",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="rounded-lg overflow-hidden" style={{ height: '600px', width: '100%' }}>
            <iframe 
              src={pyrocastUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Pyrocast Monitoreo"
              allowFullScreen
            />
          </div>

          <div className={cn(
            "p-4 border-t",
            isDarkMode ? "border-slate-800" : "border-slate-200"
          )}>
            <a 
              href={pyrocastUrl}
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
        </Card>
      )}
    </div>
  );
}