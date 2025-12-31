import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, RefreshCw, ExternalLink, AlertTriangle, Wind, Droplets, Thermometer, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

const defaultButtons = [
  { id: 'red-estaciones', label: 'Red de Estaciones', icon: AlertTriangle, url: 'https://climatologia.meteochile.gob.cl/application/diarioc/mapaRedEmaNacional', color: 'amber' },
  { id: 'pronostico', label: 'Pron. Meteorológico', icon: Cloud, url: 'https://www.meteochile.gob.cl/', color: 'sky' }
];

export default function MeteochileAlertsPanel() {
  const { isDarkMode } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historicalAlerts, setHistoricalAlerts] = useState([]);
  const [buttons, setButtons] = useState(() => {
    const saved = localStorage.getItem('meteochile-buttons-order');
    return saved ? JSON.parse(saved) : defaultButtons;
  });
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const pressStartRef = useRef(null);

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(buttons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setButtons(items);
    localStorage.setItem('meteochile-buttons-order', JSON.stringify(items));
  };

  const handleMouseDown = (e) => {
    pressStartRef.current = Date.now();
    const timer = setTimeout(() => {
      setIsDraggingEnabled(true);
    }, 3000);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (isDraggingEnabled && Date.now() - pressStartRef.current < 3000) {
      // Si se suelta antes de 3 segundos, no activar
      setIsDraggingEnabled(false);
    }
  };

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="meteochile-buttons" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-2"
                >
                  {buttons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <Draggable 
                        key={button.id} 
                        draggableId={button.id} 
                        index={index}
                        isDragDisabled={!isDraggingEnabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative"
                          >
                            <a
                              href={button.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseLeave}
                              onTouchStart={handleMouseDown}
                              onTouchEnd={handleMouseUp}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "h-9 text-sm px-4 transition-all",
                                  button.color === 'amber' 
                                    ? isDarkMode 
                                      ? "border-amber-500/50 bg-amber-950 text-amber-400 hover:bg-amber-900 hover:text-amber-300" 
                                      : "border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : isDarkMode 
                                      ? "border-sky-500/50 bg-sky-950 text-sky-400 hover:bg-sky-900 hover:text-sky-300" 
                                      : "border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100",
                                  snapshot.isDragging && "shadow-lg scale-105 cursor-grabbing",
                                  isDraggingEnabled && "cursor-grab"
                                )}
                              >
                                {isDraggingEnabled && (
                                  <span {...provided.dragHandleProps}>
                                    <GripVertical className="w-3 h-3 mr-1" />
                                  </span>
                                )}
                                <Icon className="w-3.5 h-3.5 mr-1.5" />
                                {button.label}
                              </Button>
                            </a>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {isDraggingEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDraggingEnabled(false)}
              className="h-8 text-xs text-green-600"
            >
              ✓ Listo
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className={cn(
          "pt-4 border-t",
          isDarkMode ? "border-slate-800" : "border-slate-200"
        )}>
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
      )}
          </Card>
          );
          }