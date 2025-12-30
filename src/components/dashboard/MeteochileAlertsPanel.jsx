import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, RefreshCw, ExternalLink, AlertTriangle, Wind, Droplets, Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historicalAlerts, setHistoricalAlerts] = useState([]);

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
      
      const currentAlerts = result.alerts || [];
      setAlerts(currentAlerts);
      setLastUpdate(new Date());
      
      // Guardar nuevas alertas y desactivar las que ya no existen
      const dbAlerts = await base44.entities.WeatherAlert.filter({ is_active: true });
      
      // Crear identificador único para cada alerta
      const alertKey = (alert) => `${alert.type}-${alert.region}-${alert.phenomenon}`;
      const currentKeys = new Set(currentAlerts.map(alertKey));
      
      // Desactivar alertas que ya no están activas
      for (const dbAlert of dbAlerts) {
        const key = alertKey(dbAlert);
        if (!currentKeys.has(key)) {
          await base44.entities.WeatherAlert.update(dbAlert.id, {
            is_active: false,
            deactivated_at: new Date().toISOString()
          });
        }
      }
      
      // Agregar nuevas alertas
      const existingKeys = new Set(dbAlerts.map(alertKey));
      const newAlerts = currentAlerts.filter(alert => !existingKeys.has(alertKey(alert)));
      
      for (const alert of newAlerts) {
        await base44.entities.WeatherAlert.create({
          type: alert.type,
          region: alert.region,
          phenomenon: alert.phenomenon,
          description: alert.description,
          emission_time: alert.time || new Date().toLocaleString('es-CL'),
          is_active: true
        });
      }
      
    } catch (error) {
      console.error('Error fetching Meteochile alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const loadHistoricalAlerts = async () => {
    try {
      const historical = await base44.entities.WeatherAlert.filter(
        { is_active: false },
        '-deactivated_at',
        50
      );
      setHistoricalAlerts(historical);
    } catch (error) {
      console.error('Error loading historical alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    loadHistoricalAlerts();
    const interval = setInterval(() => fetchAlerts(), 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (showHistory) {
      loadHistoricalAlerts();
    }
  }, [showHistory]);

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
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <a
              href="https://climatologia.meteochile.gob.cl/application/diarioc/mapaRedEmaNacional"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  isDarkMode 
                    ? "border-amber-500/50 bg-amber-950 text-amber-400 hover:bg-amber-900 hover:text-amber-300" 
                    : "border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Sistema de Alertas
              </Button>
            </a>
            <a
              href="https://www.meteochile.gob.cl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  isDarkMode 
                    ? "border-sky-500/50 bg-sky-950 text-sky-400 hover:bg-sky-900 hover:text-sky-300" 
                    : "border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100"
                )}
              >
                <Cloud className="w-3.5 h-3.5 mr-1.5" />
                Pronóstico Meteorológico
              </Button>
            </a>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {loading ? (
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Cloud className="w-12 h-12 text-slate-300 mb-3" />
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      No hay alertas meteorológicas activas
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '400px', width: '100%' }}>
                    <iframe 
                      src="https://climatologia.meteochile.gob.cl/application/diarioc/mapaRedEmaNacional"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="Mapa Red de Estaciones Meteorológicas"
                      allowFullScreen
                    />
                  </div>
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
            "pt-4 mt-4 border-t",
            isDarkMode ? "border-slate-800" : "border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "w-full text-xs",
                isDarkMode 
                  ? "border-slate-700 hover:bg-slate-800" 
                  : "border-slate-200 hover:bg-slate-50"
              )}
            >
              {showHistory ? <ChevronUp className="w-3 h-3 mr-1.5" /> : <ChevronDown className="w-3 h-3 mr-1.5" />}
              {showHistory ? 'Ocultar historial' : 'Ver historial de alertas'}
            </Button>

            {showHistory && (
              <div className={cn(
                "mt-3 pt-3 border-t space-y-2 max-h-64 overflow-y-auto",
                isDarkMode ? "border-slate-800" : "border-slate-200"
              )}>
                {historicalAlerts.length === 0 ? (
                  <p className={cn(
                    "text-xs text-center py-4",
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  )}>
                    No hay alertas en el historial
                  </p>
                ) : (
                  historicalAlerts.map((alert, index) => {
                    const style = alertTypeStyles[alert.type] || alertTypeStyles['Verde'];
                    const Icon = getPhenomenonIcon(alert.phenomenon);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border opacity-70",
                          isDarkMode 
                            ? "bg-slate-800/50 border-slate-700" 
                            : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className={cn("p-1 rounded", style.bg)}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <Badge className={cn("text-[10px] font-bold", style.bg, "text-white")}>
                              {style.label}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {alert.deactivated_at 
                              ? new Date(alert.deactivated_at).toLocaleDateString('es-CL', { 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : alert.emission_time}
                          </span>
                        </div>
                        <p className={cn(
                          "text-xs font-medium mb-1",
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        )}>
                          {alert.phenomenon} - {alert.region}
                        </p>
                        <p className={cn(
                          "text-[10px] leading-relaxed",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}>
                          {alert.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          </>
          )}
          </Card>
          );
          }