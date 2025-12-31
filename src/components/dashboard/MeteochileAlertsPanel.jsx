import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, RefreshCw, ExternalLink, AlertTriangle, Wind, Droplets, Thermometer, ChevronDown, ChevronUp, GripVertical, Map, List } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const notifiedAlertsRef = useRef(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return Notification.permission;
  };

  // Enviar notificación push
  const sendPushNotification = (alert) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    
    const alertKey = `${alert.type}-${alert.region}-${alert.phenomenon}`;
    if (notifiedAlertsRef.current.has(alertKey)) return;
    
    const title = `⚠️ Alerta ${alert.type} - Meteochile`;
    const body = `${alert.phenomenon} en ${alert.region}\n${alert.description}`;
    
    const notification = new Notification(title, {
      body: body,
      icon: 'https://www.meteochile.gob.cl/favicon.ico',
      badge: 'https://www.meteochile.gob.cl/favicon.ico',
      tag: alertKey,
      requireInteraction: alert.type === 'Roja',
      vibrate: [200, 100, 200]
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    notifiedAlertsRef.current.add(alertKey);
  };

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
        
        // Enviar notificación push para alertas críticas
        if (alert.type === 'Roja' || alert.type === 'Naranja') {
          sendPushNotification(alert);
        }
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
    // Solicitar permisos de notificación al montar
    requestNotificationPermission();
    
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

  // Coordenadas aproximadas de regiones de Chile
  const regionCoordinates = {
    'Arica y Parinacota': [-18.4746, -70.2979],
    'Tarapacá': [-20.2140, -69.4009],
    'Antofagasta': [-23.6509, -70.3975],
    'Atacama': [-27.3668, -70.3323],
    'Coquimbo': [-29.9533, -71.3395],
    'Valparaíso': [-33.0472, -71.6127],
    'Metropolitana': [-33.4489, -70.6693],
    'O\'Higgins': [-34.5755, -71.0022],
    'Maule': [-35.4264, -71.6554],
    'Ñuble': [-36.6097, -72.1036],
    'Biobío': [-37.4689, -72.3527],
    'Araucanía': [-38.9489, -72.3311],
    'Los Ríos': [-39.8196, -73.2452],
    'Los Lagos': [-41.4717, -72.9363],
    'Aysén': [-45.4064, -72.6890],
    'Magallanes': [-53.1638, -70.9171]
  };

  const getAlertCoordinates = (alert) => {
    const region = alert.region;
    for (const [key, coords] of Object.entries(regionCoordinates)) {
      if (region.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }
    return [-33.4489, -70.6693]; // Default: Santiago
  };

  const getMarkerColor = (alertType) => {
    switch (alertType) {
      case 'Roja': return '#ef4444';
      case 'Naranja': return '#f97316';
      case 'Amarilla': return '#eab308';
      case 'Verde': return '#10b981';
      default: return '#64748b';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const regionMatch = regionFilter === 'all' || alert.region.toLowerCase().includes(regionFilter.toLowerCase());
    const typeMatch = typeFilter === 'all' || alert.type === typeFilter;
    return regionMatch && typeMatch;
  });

  const availableRegions = [...new Set(alerts.map(a => a.region))].sort();

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
          {notificationPermission === 'granted' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border-green-300">
              🔔 Push activo
            </Badge>
          )}
          {notificationPermission === 'default' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={requestNotificationPermission}
              className="text-[10px] h-6 px-2"
            >
              Activar notificaciones
            </Button>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'default' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('map')}
              className="h-8 w-8"
            >
              <Map className="w-4 h-4" />
            </Button>
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
                  className="flex items-center gap-2 flex-wrap"
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
                                  "h-8 text-xs transition-all",
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
        <>
          {/* Filtros */}
          {alerts.length > 0 && (
            <div className={cn(
              "flex gap-2 mb-4 flex-wrap",
              isDarkMode ? "text-slate-300" : "text-slate-700"
            )}>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={cn(
                  "w-36 h-8 text-xs",
                  isDarkMode ? "bg-slate-800 border-slate-700" : ""
                )}>
                  <SelectValue placeholder="Tipo de alerta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las alertas</SelectItem>
                  <SelectItem value="Roja">Roja</SelectItem>
                  <SelectItem value="Naranja">Naranja</SelectItem>
                  <SelectItem value="Amarilla">Amarilla</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className={cn(
                  "w-40 h-8 text-xs",
                  isDarkMode ? "bg-slate-800 border-slate-700" : ""
                )}>
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las regiones</SelectItem>
                  {availableRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(typeFilter !== 'all' || regionFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setRegionFilter('all');
                  }}
                  className="h-8 text-xs"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : viewMode === 'map' ? (
            <div className="flex-1" style={{ minHeight: '400px' }}>
              {filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Map className="w-12 h-12 text-slate-300 mb-3" />
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  )}>
                    No hay alertas para mostrar en el mapa
                  </p>
                </div>
              ) : (
                <MapContainer
                  center={[-33.4489, -70.6693]}
                  zoom={5}
                  style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredAlerts.map((alert, idx) => {
                    const coords = getAlertCoordinates(alert);
                    const style = alertTypeStyles[alert.type] || alertTypeStyles['Verde'];
                    const Icon = getPhenomenonIcon(alert.phenomenon);
                    
                    return (
                      <CircleMarker
                        key={idx}
                        center={coords}
                        radius={alert.type === 'Roja' ? 15 : alert.type === 'Naranja' ? 12 : 10}
                        fillColor={getMarkerColor(alert.type)}
                        color="#ffffff"
                        weight={3}
                        opacity={1}
                        fillOpacity={0.7}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn("font-bold text-xs", style.bg, "text-white")}>
                                {style.label}
                              </Badge>
                              {alert.time && (
                                <span className="text-xs text-slate-500">{alert.time}</span>
                              )}
                            </div>
                            <p className="font-semibold text-sm mb-1">
                              {alert.phenomenon}
                            </p>
                            <p className="text-xs text-slate-600 mb-1">
                              📍 {alert.region}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              )}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredAlerts.length === 0 && alerts.length > 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-300 mb-3" />
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  )}>
                    No hay alertas que coincidan con los filtros
                  </p>
                </div>
              ) : alerts.length === 0 ? (
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
                filteredAlerts.map((alert, index) => {
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
                <div className="flex items-center justify-between mb-2">
                  <p className={cn(
                    "text-xs font-semibold",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    Historial de alertas ({historicalAlerts.length})
                  </p>
                  {historicalAlerts.length > 0 && (
                    <p className={cn(
                      "text-[10px]",
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    )}>
                      Últimas {historicalAlerts.length} alertas desactivadas
                    </p>
                  )}
                </div>
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