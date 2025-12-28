import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Plus, Flame, Package, Radio, Building2, AlertTriangle, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from "@/lib/utils";

const { BaseLayer, Overlay } = LayersControl;

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types
const createIncidentIcon = (severity) => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };
  const color = colors[severity] || colors.medium;
  
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
      <div style="transform: rotate(45deg); color: white; font-size: 18px;">⚠️</div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const createPOIIcon = (type) => {
  const config = {
    resource: { emoji: '📦', color: '#3b82f6' },
    command_center: { emoji: '🏢', color: '#8b5cf6' },
    hospital: { emoji: '🏥', color: '#ef4444' },
    shelter: { emoji: '🏠', color: '#10b981' },
    other: { emoji: '📍', color: '#64748b' }
  };
  const { emoji, color } = config[type] || config.other;
  
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">
      ${emoji}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const createSenapredIcon = (level) => {
  const colors = {
    'Roja': '#ef4444',
    'Amarilla': '#eab308',
    'Verde': '#22c55e',
    'Preventiva': '#3b82f6'
  };
  const color = colors[level] || colors.Preventiva;
  
  return L.divIcon({
    className: 'custom-senapred-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 4px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px; transform: rotate(45deg);">
      <div style="transform: rotate(-45deg); color: white;">⚠</div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

export default function InteractiveMap({ 
  incidents = [], 
  resources = [],
  pois = [],
  onAddPOI,
  height = "600px",
  center = [-33.4489, -70.6693] // Santiago, Chile
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(11);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [newPOI, setNewPOI] = useState({
    name: '',
    type: 'resource',
    description: '',
    lat: 0,
    lng: 0
  });

  // Mock SENAPRED alerts (in production, fetch from API)
  const [senapredAlerts] = useState([
    { id: 1, name: 'Alerta Roja - RM', level: 'Roja', lat: -33.4489, lng: -70.6693 },
    { id: 2, name: 'Alerta Amarilla - Valparaíso', level: 'Amarilla', lat: -33.0472, lng: -71.6127 },
    { id: 3, name: 'Alerta Preventiva - Maule', level: 'Preventiva', lat: -35.4264, lng: -71.6554 }
  ]);

  useEffect(() => {
    if (incidents.length > 0 && incidents[0].coordinates) {
      setMapCenter([incidents[0].coordinates.lat, incidents[0].coordinates.lng]);
      setZoom(12);
    }
  }, [incidents]);

  const handleMapClick = (latlng) => {
    if (isAddingPOI) {
      setClickedLocation(latlng);
      setNewPOI({ ...newPOI, lat: latlng.lat, lng: latlng.lng });
      setShowAddPOI(true);
    }
  };

  const handleSavePOI = () => {
    if (onAddPOI && newPOI.name) {
      onAddPOI(newPOI);
      setShowAddPOI(false);
      setIsAddingPOI(false);
      setNewPOI({ name: '', type: 'resource', description: '', lat: 0, lng: 0 });
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e'
    };
    return colors[severity] || colors.medium;
  };

  const activeIncidents = incidents.filter(i => i.status === 'active');

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-slate-900">Mapa Interactivo</h3>
            <Badge variant="secondary">{activeIncidents.length} activos</Badge>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddingPOI(!isAddingPOI)}
            className={cn(
              "transition-colors",
              isAddingPOI ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-600 hover:bg-slate-700"
            )}
          >
            {isAddingPOI ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Agregar PDI
              </>
            )}
          </Button>
        </div>

        {isAddingPOI && (
          <div className="px-4 py-2 bg-orange-50 border-b border-orange-200 text-sm text-orange-800">
            📍 Haz clic en el mapa para agregar un Punto de Interés
          </div>
        )}

        <div style={{ height, width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapClickHandler onMapClick={handleMapClick} />
            
            <LayersControl position="topright">
              <BaseLayer checked name="Mapa Estándar">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="Satélite">
                <TileLayer
                  attribution='&copy; Google'
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                />
              </BaseLayer>
              <BaseLayer name="Terreno">
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>

              {/* Incidentes Activos */}
              <Overlay checked name="Incidentes Activos">
                <LayerGroup>
                  {activeIncidents.map((incident) => {
                    if (!incident.coordinates?.lat || !incident.coordinates?.lng) return null;
                    const position = [incident.coordinates.lat, incident.coordinates.lng];
                    
                    return (
                      <React.Fragment key={incident.id}>
                        <Marker 
                          position={position}
                          icon={createIncidentIcon(incident.severity)}
                        >
                          <Popup maxWidth={300}>
                            <div className="p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">#{incident.incident_number}</Badge>
                                <Badge style={{ backgroundColor: getSeverityColor(incident.severity), color: 'white' }}>
                                  {incident.severity}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-slate-900 mb-1">{incident.name}</h3>
                              <p className="text-sm text-slate-600 mb-2">{incident.location}</p>
                              <p className="text-xs text-slate-500">{incident.description}</p>
                            </div>
                          </Popup>
                        </Marker>
                        <Circle
                          center={position}
                          radius={500}
                          pathOptions={{
                            color: getSeverityColor(incident.severity),
                            fillColor: getSeverityColor(incident.severity),
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: '5, 5'
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                </LayerGroup>
              </Overlay>

              {/* Puntos de Interés */}
              <Overlay checked name="Puntos de Interés">
                <LayerGroup>
                  {pois.map((poi) => (
                    <Marker
                      key={poi.id}
                      position={[poi.lat, poi.lng]}
                      icon={createPOIIcon(poi.type)}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold text-slate-900">{poi.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{poi.description}</p>
                          <Badge variant="secondary" className="mt-2">{poi.type}</Badge>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </Overlay>

              {/* Recursos */}
              {resources.length > 0 && (
                <Overlay name="Recursos Desplegados">
                  <LayerGroup>
                    {resources.filter(r => r.coordinates?.lat && r.coordinates?.lng).map((resource) => (
                      <Marker
                        key={resource.id}
                        position={[resource.coordinates.lat, resource.coordinates.lng]}
                        icon={createPOIIcon('resource')}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-semibold text-slate-900">{resource.name}</h4>
                            <p className="text-xs text-slate-500">{resource.category}</p>
                            <Badge variant="secondary" className="mt-2">{resource.status}</Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </Overlay>
              )}

              {/* Alertas SENAPRED */}
              <Overlay name="Alertas SENAPRED">
                <LayerGroup>
                  {senapredAlerts.map((alert) => (
                    <Marker
                      key={alert.id}
                      position={[alert.lat, alert.lng]}
                      icon={createSenapredIcon(alert.level)}
                    >
                      <Popup>
                        <div className="p-2">
                          <Badge 
                            className="mb-2"
                            style={{ 
                              backgroundColor: alert.level === 'Roja' ? '#ef4444' : 
                                              alert.level === 'Amarilla' ? '#eab308' : 
                                              alert.level === 'Verde' ? '#22c55e' : '#3b82f6',
                              color: 'white'
                            }}
                          >
                            {alert.level}
                          </Badge>
                          <h4 className="font-semibold text-slate-900">{alert.name}</h4>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </Overlay>
            </LayersControl>
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-slate-600">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-600">Medio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📦</span>
              <span className="text-slate-600">Recursos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <span className="text-slate-600">Comando</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Add POI Dialog */}
      <Dialog open={showAddPOI} onOpenChange={setShowAddPOI}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Punto de Interés</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newPOI.name}
                onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                placeholder="Ej: Centro de Comando Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newPOI.type} onValueChange={(value) => setNewPOI({ ...newPOI, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource">📦 Recursos</SelectItem>
                  <SelectItem value="command_center">🏢 Centro de Comando</SelectItem>
                  <SelectItem value="hospital">🏥 Hospital</SelectItem>
                  <SelectItem value="shelter">🏠 Refugio</SelectItem>
                  <SelectItem value="other">📍 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={newPOI.description}
                onChange={(e) => setNewPOI({ ...newPOI, description: e.target.value })}
                placeholder="Descripción breve"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input value={newPOI.lat.toFixed(6)} disabled />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input value={newPOI.lng.toFixed(6)} disabled />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddPOI(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePOI}
                disabled={!newPOI.name}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Guardar Punto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}