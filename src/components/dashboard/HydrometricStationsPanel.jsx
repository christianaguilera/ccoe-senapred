import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplets, ExternalLink, RefreshCw, AlertTriangle, Info, Map, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function HydrometricStationsPanel() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extrae información de TODAS las estaciones hidrométricas de Chile que están transmitiendo actualmente desde https://snia.mop.gob.cl/sat/site/informes/mapas/mapas.xhtml.
        Para cada estación devuelve: nombre (string), region (string), tipo (string como Fluviométrica, Meteorológica, etc), 
        estado_transmision (string: debe ser "transmitiendo"), 
        alerta (string: "ninguna", "azul", "amarilla", "roja"), 
        caudal_o_nivel (número si disponible, sino null), unidad (string si disponible),
        latitud (número), longitud (número).
        IMPORTANTE: Solo incluye estaciones que están transmitiendo actualmente (en línea).
        Ordena por alertas más críticas primero, luego por región.
        Incluye todas las estaciones en línea que encuentres.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            estaciones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nombre: { type: "string" },
                  region: { type: "string" },
                  tipo: { type: "string" },
                  estado_transmision: { type: "string" },
                  alerta: { type: "string" },
                  caudal_o_nivel: { type: ["number", "null"] },
                  unidad: { type: "string" },
                  latitud: { type: "number" },
                  longitud: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Filtrar solo estaciones en línea (transmitiendo)
      const onlineStations = (response.estaciones || []).filter(
        st => st.estado_transmision?.toLowerCase() === 'transmitiendo'
      );
      setStations(onlineStations);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar estaciones:', error);
      setStations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const getAlertColor = (alerta) => {
    switch (alerta?.toLowerCase()) {
      case 'roja': return 'bg-red-500 text-white';
      case 'amarilla': return 'bg-yellow-500 text-slate-900';
      case 'azul': return 'bg-blue-500 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const getTransmissionIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'transmitiendo': return '✓';
      case 'sin_transmision': return '✗';
      case 'error': return '⚠';
      default: return '?';
    }
  };

  const getTransmissionColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'transmitiendo': return 'text-green-600';
      case 'sin_transmision': return 'text-slate-400';
      case 'error': return 'text-orange-600';
      default: return 'text-slate-400';
    }
  };

  const getMarkerIcon = (station) => {
    let color = '#64748b'; // default gray
    
    if (station.alerta === 'roja') color = '#ef4444';
    else if (station.alerta === 'amarilla') color = '#eab308';
    else if (station.alerta === 'azul') color = '#3b82f6';
    else if (station.estado_transmision === 'transmitiendo') color = '#10b981';
    
    return L.divIcon({
      className: 'custom-station-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="color: white; font-size: 12px; font-weight: bold;">💧</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Estaciones Hidrométricas DGA</h2>
            <p className="text-xs text-slate-500">
              {lastUpdate && `Actualizado: ${lastUpdate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} • `}
              {stations.length} estaciones en línea
            </p>
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
            onClick={fetchStations}
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
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
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
            {stations.filter(st => st.latitud && st.longitud).map((station, idx) => (
              <Marker
                key={idx}
                position={[station.latitud, station.longitud]}
                icon={getMarkerIcon(station)}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {station.alerta && station.alerta !== 'ninguna' && (
                        <Badge className={`${getAlertColor(station.alerta)} font-semibold text-xs px-2 py-0.5`}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Alerta {station.alerta}
                        </Badge>
                      )}
                      <span className={`text-xs font-mono ${getTransmissionColor(station.estado_transmision)}`}>
                        {getTransmissionIcon(station.estado_transmision)} {station.estado_transmision}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{station.nombre}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{station.tipo}</span>
                      <span>{station.region}</span>
                    </div>
                    {station.caudal_o_nivel !== null && (
                      <p className="text-xs text-blue-600 font-medium">
                        {station.caudal_o_nivel} {station.unidad || 'm³/s'}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {stations.map((station, idx) => (
            <div 
              key={idx} 
              className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {station.alerta && station.alerta !== 'ninguna' && (
                      <Badge className={`${getAlertColor(station.alerta)} font-semibold text-xs px-2 py-0.5`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Alerta {station.alerta}
                      </Badge>
                    )}
                    <span className={`text-xs font-mono ${getTransmissionColor(station.estado_transmision)}`}>
                      {getTransmissionIcon(station.estado_transmision)} {station.estado_transmision}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {station.nombre}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{station.tipo}</span>
                    <span>{station.region}</span>
                  </div>
                  {station.caudal_o_nivel !== null && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {station.caudal_o_nivel} {station.unidad || 'm³/s'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-200">
        <a 
          href="https://snia.mop.gob.cl/sat/site/informes/mapas/mapas.xhtml" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          Ver más en SNIA DGA
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}