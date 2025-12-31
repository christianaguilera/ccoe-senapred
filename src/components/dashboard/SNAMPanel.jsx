import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ExternalLink, RefreshCw, Waves } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

export default function SNAMPanel() {
  const { isDarkMode } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const snamUrl = "https://www.snamchile.cl/";

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza el sitio web del Sistema Nacional de Alarma de Maremotos (SNAM) de Chile en https://www.snamchile.cl/ y extrae la información de alertas de tsunami activas.
        
        Para cada alerta o información relevante, extrae:
        - tipo: string (puede ser "Alerta", "Aviso", "Información", "Sin Alerta")
        - region: string (región o zona afectada)
        - descripcion: string (descripción de la situación)
        - fecha_hora: string (fecha y hora de la emisión)
        
        Si no hay alertas activas, devuelve un mensaje indicando que no hay alertas de tsunami vigentes.
        Ordena por fecha más reciente primero.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            estado_general: { type: "string" },
            alertas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  region: { type: "string" },
                  descripcion: { type: "string" },
                  fecha_hora: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAlerts(response.alertas || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar alertas SNAM:', error);
      setAlerts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    
    const interval = setInterval(() => {
      fetchAlerts();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (tipo) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('alerta')) return 'bg-red-500 text-white';
    if (tipoLower.includes('aviso')) return 'bg-orange-500 text-white';
    if (tipoLower.includes('información')) return 'bg-blue-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <Card className={cn(
      "p-6",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>SNAM Chile</h2>
            {lastUpdate && (
              <p className={cn(
                "text-xs",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                Actualizado: {lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={fetchAlerts}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn(
              "border-b pb-3",
              isDarkMode ? "border-slate-800" : "border-slate-100"
            )}>
              <Skeleton className={cn(
                "h-4 w-32 mb-2",
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              )} />
              <Skeleton className={cn(
                "h-3 w-full mb-1",
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              )} />
              <Skeleton className={cn(
                "h-3 w-24",
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              )} />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className={cn(
          "text-center py-8 text-sm",
          isDarkMode ? "text-slate-400" : "text-slate-500"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
            isDarkMode ? "bg-emerald-900/50" : "bg-emerald-50"
          )}>
            <Waves className={cn(
              "w-8 h-8",
              isDarkMode ? "text-emerald-400" : "text-emerald-600"
            )} />
          </div>
          <p className={cn(
            "font-semibold",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>Sin alertas de tsunami</p>
          <p className={cn(
            "text-xs mt-1",
            isDarkMode ? "text-slate-500" : "text-slate-600"
          )}>Todo en orden</p>
        </div>
      ) : (
        <div className={cn(
          "space-y-3 max-h-[400px] overflow-y-auto",
          isDarkMode ? "scrollbar-dark" : ""
        )}>
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={cn(
                "border-b last:border-0 pb-3 last:pb-0 hover:bg-opacity-50 -mx-2 px-2 py-2 rounded-lg transition-colors",
                isDarkMode 
                  ? "border-slate-800 hover:bg-slate-800" 
                  : "border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={`${getAlertColor(alert.tipo)} font-bold text-xs px-2 py-0.5`}>
                      {alert.tipo}
                    </Badge>
                    {alert.fecha_hora && (
                      <span className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      )}>{alert.fecha_hora}</span>
                    )}
                  </div>
                  {alert.region && (
                    <p className={cn(
                      "text-sm font-medium mb-1",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {alert.region}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    {alert.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "mt-4 pt-3 border-t",
        isDarkMode ? "border-slate-800" : "border-slate-200"
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
          Ver más en SNAM Chile
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}