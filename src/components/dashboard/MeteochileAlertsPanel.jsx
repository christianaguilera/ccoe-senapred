import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, RefreshCw, ExternalLink, AlertTriangle, Wind, Droplets, Thermometer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

const alertTypeStyles = {
  'Roja': { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', label: 'Roja' },
  'Amarilla': { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', label: 'Amarilla' },
  'Naranja': { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', label: 'Naranja' },
  'Verde': { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Verde' },
};

const phenomenonIcons = {
  'viento': Wind,
  'lluvia': Droplets,
  'temperatura': Thermometer,
  'default': Cloud
};

export default function MeteochileAlertsPanel() {
  const { isDarkMode } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAlerts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza el sitio web de alertas meteorológicas de Meteochile (https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml) y extrae las alertas meteorológicas activas actualmente en Chile. 
        
        Para cada alerta, extrae:
        - Tipo de alerta (Roja, Amarilla, Naranja, Verde)
        - Región(es) afectada(s)
        - Fenómeno meteorológico (viento, lluvia, temperatura, etc.)
        - Descripción breve
        - Hora de emisión si está disponible
        
        Devuelve las alertas ordenadas por severidad (Roja primero, luego Naranja, Amarilla, Verde).
        Si no hay alertas activas, devuelve un array vacío.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["Roja", "Naranja", "Amarilla", "Verde"] },
                  region: { type: "string" },
                  phenomenon: { type: "string" },
                  description: { type: "string" },
                  time: { type: "string" }
                },
                required: ["type", "region", "phenomenon", "description"]
              }
            }
          }
        }
      });
      
      setAlerts(result.alerts || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching Meteochile alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(), 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const getPhenomenonIcon = (phenomenon) => {
    const key = phenomenon?.toLowerCase() || 'default';
    if (key.includes('viento')) return phenomenonIcons.viento;
    if (key.includes('lluvia') || key.includes('precipit')) return phenomenonIcons.lluvia;
    if (key.includes('temperatura') || key.includes('calor') || key.includes('frío')) return phenomenonIcons.temperatura;
    return phenomenonIcons.default;
  };

  return (
    <Card className={cn(
      "p-6 h-full flex flex-col",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className={cn("w-5 h-5", isDarkMode ? "text-sky-400" : "text-sky-600")} />
          <h3 className={cn(
            "font-semibold",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>Alertas Meteorológicas</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className={cn(
            "h-8 w-8",
            isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Cloud className="w-12 h-12 text-slate-300 mb-3" />
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                No hay alertas meteorológicas activas
              </p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const style = alertTypeStyles[alert.type] || alertTypeStyles['Verde'];
              const Icon = getPhenomenonIcon(alert.phenomenon);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isDarkMode 
                      ? "bg-slate-800 border-slate-700 hover:border-slate-600" 
                      : `bg-${alert.type === 'Roja' ? 'red' : alert.type === 'Naranja' ? 'orange' : alert.type === 'Amarilla' ? 'amber' : 'emerald'}-50 ${style.border} hover:shadow-md`
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", style.bg)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <Badge className={cn("font-bold", style.bg, "text-white")}>
                        {style.label}
                      </Badge>
                    </div>
                    {alert.time && (
                      <span className="text-xs text-slate-500">{alert.time}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "font-semibold text-sm",
                      isDarkMode ? "text-white" : style.text
                    )}>
                      {alert.phenomenon} - {alert.region}
                    </p>
                    <p className={cn(
                      "text-xs leading-relaxed",
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    )}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className={cn(
        "pt-4 mt-4 border-t flex items-center justify-between",
        isDarkMode ? "border-slate-800" : "border-slate-200"
      )}>
        {lastUpdate && (
          <span className="text-xs text-slate-500">
            Actualizado: {lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <a
          href="https://www.meteochile.gob.cl/PortalDMC-web/index.xhtml"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-xs flex items-center gap-1 transition-colors",
            isDarkMode 
              ? "text-sky-400 hover:text-sky-300" 
              : "text-sky-600 hover:text-sky-700"
          )}
        >
          Ver todas las alertas
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}