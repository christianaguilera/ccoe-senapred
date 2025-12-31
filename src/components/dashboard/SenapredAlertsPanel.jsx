import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Map, List, Flame, Cloud, Droplets } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from "@/lib/utils";

const alertTypeStyles = {
  'Roja': { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', label: 'Roja' },
  'Amarilla': { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', label: 'Amarilla' },
  'Naranja': { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', label: 'Naranja' },
  'Verde': { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Verde' },
  'Temprana Preventiva': { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', label: 'Preventiva' }
};

const phenomenonIcons = {
  'incendio': Flame,
  'calor': Cloud,
  'lluvia': Droplets,
  'default': AlertTriangle
};

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

export default function SenapredAlertsPanel() {
  const { isDarkMode } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchAlerts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza el sitio web de alertas de SENAPRED (https://senapred.cl/alertas) y extrae todas las alertas activas actualmente en Chile.
        
        Para cada alerta, extrae:
        - Tipo de alerta (Roja, Amarilla, Verde, Temprana Preventiva, Naranja)
        - Región(es) afectada(s)
        - Fenómeno o amenaza (incendio forestal, calor extremo, lluvia, etc.)
        - Descripción breve y detallada de la alerta
        - Hora de emisión si está disponible
        
        Devuelve las alertas ordenadas por severidad (Roja primero, luego Naranja, Amarilla, Verde, Preventiva).
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
                  type: { type: "string", enum: ["Roja", "Naranja", "Amarilla", "Verde", "Temprana Preventiva"] },
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
      console.error('Error fetching SENAPRED alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPhenomenonIcon = (phenomenon) => {
    const key = phenomenon?.toLowerCase() || 'default';
    if (key.includes('incendio') || key.includes('fuego')) return phenomenonIcons.incendio;
    if (key.includes('calor') || key.includes('temperatura')) return phenomenonIcons.calor;
    if (key.includes('lluvia') || key.includes('precipit')) return phenomenonIcons.lluvia;
    return phenomenonIcons.default;
  };

  const getAlertCoordinates = (alert) => {
    const region = alert.region;
    for (const [key, coords] of Object.entries(regionCoordinates)) {
      if (region.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }
    return [-33.4489, -70.6693];
  };

  const getMarkerColor = (alertType) => {
    switch (alertType) {
      case 'Roja': return '#ef4444';
      case 'Naranja': return '#f97316';
      case 'Amarilla': return '#eab308';
      case 'Verde': return '#10b981';
      case 'Temprana Preventiva': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const regionMatch = regionFilter === 'all' || alert.region.toLowerCase().includes(regionFilter.toLowerCase());
    const typeMatch = typeFilter === 'all' || alert.type === typeFilter;
    return regionMatch && typeMatch;
  });

  const availableRegions = [...new Set(alerts.map(a => a.region))].sort();

  return (
    <Card className={cn(
      "p-6 h-full flex flex-col",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn("w-5 h-5", isDarkMode ? "text-orange-400" : "text-orange-600")} />
          <div>
            <h3 className={cn(
              "font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Alertas SENAPRED</h3>
            <p className="text-xs text-slate-500">Sistema Nacional de Emergencia</p>
          </div>
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
                  <SelectItem value="Temprana Preventiva">Preventiva</SelectItem>
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
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-300 mb-3" />
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  )}>
                    No hay alertas SENAPRED activas
                  </p>
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
                          : `bg-${alert.type === 'Roja' ? 'red' : alert.type === 'Naranja' ? 'orange' : alert.type === 'Amarilla' ? 'amber' : alert.type === 'Temprana Preventiva' ? 'blue' : 'emerald'}-50 ${style.border} hover:shadow-md`
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
            <div className="flex items-center justify-between">
              {lastUpdate && (
                <span className="text-xs text-slate-500">
                  Actualizado: {lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <a
                href="https://senapred.cl/alertas"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-xs flex items-center gap-1 transition-colors",
                  isDarkMode 
                    ? "text-orange-400 hover:text-orange-300" 
                    : "text-orange-600 hover:text-orange-700"
                )}
              >
                Ver todas las alertas
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </>
      )}
    </Card>);

}