import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ExternalLink, RefreshCw, Map, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function ChileanSeismicPanel() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const fetchEarthquakes = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extrae los últimos 15 sismos de Chile desde el sitio web https://sismologia.cl/. 
        Para cada sismo devuelve: fecha_hora (string en formato DD/MM/YYYY HH:mm), lugar (string), profundidad (número en km), magnitud (número), latitud (número), longitud (número), url_detalle (string).
        Ordena por fecha más reciente primero.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sismos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  fecha_hora: { type: "string" },
                  lugar: { type: "string" },
                  profundidad: { type: "number" },
                  magnitud: { type: "number" },
                  latitud: { type: "number" },
                  longitud: { type: "number" },
                  url_detalle: { type: "string" }
                }
              }
            }
          }
        }
      });

      setEarthquakes(response.sismos || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar sismos:', error);
      setEarthquakes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEarthquakes();
  }, []);

  const getMagnitudeColor = (magnitude) => {
    if (magnitude >= 6) return 'bg-red-500 text-white';
    if (magnitude >= 5) return 'bg-orange-500 text-white';
    if (magnitude >= 4) return 'bg-yellow-500 text-slate-900';
    if (magnitude >= 3) return 'bg-blue-500 text-white';
    return 'bg-slate-500 text-white';
  };

  const getMagnitudeLabel = (magnitude) => {
    if (magnitude >= 6) return 'Fuerte';
    if (magnitude >= 5) return 'Moderado';
    if (magnitude >= 4) return 'Leve';
    return 'Menor';
  };

  const getCircleRadius = (magnitude) => {
    return magnitude * 5000; // Scale for visibility
  };

  const getCircleColor = (magnitude) => {
    if (magnitude >= 6) return '#ef4444';
    if (magnitude >= 5) return '#f97316';
    if (magnitude >= 4) return '#eab308';
    if (magnitude >= 3) return '#3b82f6';
    return '#64748b';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Últimos Sismos Chile</h2>
            {lastUpdate && (
              <p className="text-xs text-slate-500">
                Actualizado: {lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
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
            onClick={fetchEarthquakes}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border-b border-slate-100 pb-3">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : earthquakes.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No se pudieron cargar los datos
        </div>
      ) : viewMode === 'map' ? (
        <div style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden">
          <MapContainer
            center={[-33.4489, -70.6693]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {earthquakes.filter(eq => eq.latitud && eq.longitud).map((eq, idx) => (
              <CircleMarker
                key={idx}
                center={[eq.latitud, eq.longitud]}
                radius={Math.max(eq.magnitud * 2, 4)}
                fillColor={getCircleColor(eq.magnitud)}
                color={getCircleColor(eq.magnitud)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup>
                  <div className="p-2">
                    <Badge className={`${getMagnitudeColor(eq.magnitud)} font-bold text-xs px-2 py-0.5 mb-2`}>
                      Magnitud {eq.magnitud} - {getMagnitudeLabel(eq.magnitud)}
                    </Badge>
                    <p className="text-sm font-semibold mb-1">{eq.lugar}</p>
                    <p className="text-xs text-slate-600 mb-1">Profundidad: {eq.profundidad} km</p>
                    <p className="text-xs text-slate-500">{eq.fecha_hora}</p>
                    {eq.url_detalle && (
                      <a 
                        href={eq.url_detalle}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-2"
                      >
                        Ver detalle <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {earthquakes.map((eq, idx) => (
            <div 
              key={idx} 
              className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getMagnitudeColor(eq.magnitud)} font-bold text-xs px-2 py-0.5`}>
                      {eq.magnitud} {getMagnitudeLabel(eq.magnitud)}
                    </Badge>
                    <span className="text-xs text-slate-500">{eq.fecha_hora}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {eq.lugar}
                  </p>
                  <p className="text-xs text-slate-600">
                    Profundidad: {eq.profundidad} km
                  </p>
                </div>
                {eq.url_detalle && (
                  <a 
                    href={eq.url_detalle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-200">
        <a 
          href="https://sismologia.cl/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
        >
          Ver más en Sismología Chile
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}