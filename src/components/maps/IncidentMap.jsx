import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Flame, Plus, MapPinned, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddPOIDialog from './AddPOIDialog';

const { BaseLayer, Overlay } = LayersControl;

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for incidents
const createIncidentIcon = (severity, type) => {
  const colors = {
    catastrophe: '#ef4444',
    disaster: '#f97316',
    major_emergency: '#eab308',
    minor_emergency: '#22c55e'
  };
  
  const color = colors[severity] || colors.minor_emergency;
  
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 18px;">⚠️</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Custom icon for POIs
const createPOIIcon = (type) => {
  // SCI Label types use text instead of emojis
  const labelTypes = {
    pc: { text: 'PC', shape: 'square', bg: '#f97316' },
    acv: { text: 'ACV', shape: 'circle', bg: '#eab308' },
    staging_e: { text: 'E', shape: 'circle', bg: '#eab308' },
    helibase_h: { text: 'H', shape: 'circle', bg: '#eab308' },
    base_b: { text: 'B', shape: 'circle', bg: '#eab308' },
    camp_c: { text: 'C', shape: 'circle', bg: '#eab308' },
    pas: { text: 'PAS', shape: 'square', bg: '#f97316' },
    pap: { text: 'PAP', shape: 'square', bg: '#f97316' }
  };

  const icons = {
    command_center: '🏢',
    resource_station: '📦',
    medical_post: '🏥',
    staging_area: '🚧',
    heliport: '🚁',
    water_source: '💧',
    hazard_zone: '☢️',
    evacuation_point: '🚪',
    supply_depot: '🏪',
    firefighters: '🚒',
    ambulance: '🚑',
    police: '🚓',
    rescue_team: '🦺',
    shelter: '🏠',
    food_distribution: '🍽️',
    water_distribution: '🚰',
    generator: '⚡',
    communications: '📡',
    roadblock: '🚧',
    debris: '💥',
    field_hospital: '⛺',
    military: '🪖',
    volunteers: '🤝',
    other: '📍'
  };

  const colors = {
    command_center: '#3b82f6',
    resource_station: '#8b5cf6',
    medical_post: '#ef4444',
    staging_area: '#f59e0b',
    heliport: '#06b6d4',
    water_source: '#0ea5e9',
    hazard_zone: '#dc2626',
    evacuation_point: '#10b981',
    supply_depot: '#6366f1',
    firefighters: '#dc2626',
    ambulance: '#f59e0b',
    police: '#3b82f6',
    rescue_team: '#f97316',
    shelter: '#8b5cf6',
    food_distribution: '#10b981',
    water_distribution: '#06b6d4',
    generator: '#eab308',
    communications: '#6366f1',
    roadblock: '#ef4444',
    debris: '#991b1b',
    field_hospital: '#ec4899',
    military: '#059669',
    volunteers: '#14b8a6',
    other: '#64748b'
  };

  // Check if this is a label type (SCI labels)
  if (labelTypes[type]) {
    const label = labelTypes[type];
    const borderRadius = label.shape === 'circle' ? '50%' : '8px';
    return L.divIcon({
      className: 'custom-poi-label',
      html: `
        <div style="
          background-color: ${label.bg};
          width: 45px;
          height: 45px;
          border-radius: ${borderRadius};
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: white;
          font-family: Arial, sans-serif;
        ">
          ${label.text}
        </div>
      `,
      iconSize: [45, 45],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });
  }

  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="
        background-color: ${colors[type] || colors.other};
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        ${icons[type] || icons.other}
      </div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};



function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function IncidentMap({ 
  incidents = [], 
  selectedIncident = null,
  onIncidentClick = null,
  height = "500px",
  showRadius = false,
  incidentId = null,
  enablePOI = false
}) {
  const [mapCenter, setMapCenter] = useState([-33.4489, -70.6693]); // Default: Santiago, Chile
  const [mapZoom, setMapZoom] = useState(11);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const queryClient = useQueryClient();

  // Fetch POIs
  const { data: allPOIs = [] } = useQuery({
    queryKey: ['pois'],
    queryFn: () => base44.entities.PointOfInterest.list(),
    enabled: enablePOI
  });

  // Filter POIs by incident if incidentId is provided
  const pois = incidentId 
    ? allPOIs.filter(poi => poi.incident_id === incidentId)
    : allPOIs;

  // Create POI mutation
  const createPOI = useMutation({
    mutationFn: (data) => base44.entities.PointOfInterest.create({
      ...data,
      incident_id: incidentId,
      status: 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pois'] });
      setShowAddPOI(false);
      setClickedCoords(null);
    }
  });

  // Delete POI mutation
  const deletePOI = useMutation({
    mutationFn: (id) => base44.entities.PointOfInterest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pois'] });
    }
  });

  useEffect(() => {
    if (selectedIncident?.coordinates) {
      setMapCenter([selectedIncident.coordinates.lat, selectedIncident.coordinates.lng]);
      setMapZoom(14);
    } else if (incidents.length > 0 && incidents[0].coordinates) {
      setMapCenter([incidents[0].coordinates.lat, incidents[0].coordinates.lng]);
      setMapZoom(11);
    }
  }, [selectedIncident, incidents]);

  const getSeverityColor = (severity) => {
    const colors = {
      catastrophe: '#ef4444',
      disaster: '#f97316',
      major_emergency: '#eab308',
      minor_emergency: '#22c55e'
    };
    return colors[severity] || colors.minor_emergency;
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      catastrophe: 'Catástrofe',
      disaster: 'Desastre',
      major_emergency: 'Emergencia Mayor',
      minor_emergency: 'Emergencia Menor'
    };
    return labels[severity] || 'Emergencia Menor';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Activo',
      contained: 'Contenido',
      resolved: 'Resuelto',
      monitoring: 'Monitoreo'
    };
    return labels[status] || 'Activo';
  };

  const getRadiusMeters = (severity) => {
    const radii = {
      catastrophe: 1000,
      disaster: 500,
      major_emergency: 300,
      minor_emergency: 200
    };
    return radii[severity] || 300;
  };

  const getPOITypeLabel = (type) => {
    const labels = {
      command_center: 'Centro de Comando',
      resource_station: 'Estación de Recursos',
      medical_post: 'Puesto Médico',
      staging_area: 'Área de Preparación',
      heliport: 'Helipuerto',
      water_source: 'Fuente de Agua',
      hazard_zone: 'Zona de Peligro',
      evacuation_point: 'Punto de Evacuación',
      supply_depot: 'Depósito de Suministros',
      firefighters: 'Bomberos',
      ambulance: 'Ambulancia',
      police: 'Policía',
      rescue_team: 'Equipo de Rescate',
      shelter: 'Refugio',
      food_distribution: 'Distribución de Alimentos',
      water_distribution: 'Distribución de Agua',
      generator: 'Generador',
      communications: 'Comunicaciones',
      roadblock: 'Bloqueo de Ruta',
      debris: 'Escombros',
      field_hospital: 'Hospital de Campaña',
      military: 'Militar',
      volunteers: 'Voluntarios',
      pc: 'PC - Puesto de Comando',
      acv: 'ACV - Área Concentración de Víctimas',
      staging_e: 'E - Área de Espera',
      helibase_h: 'H - Helibase',
      base_b: 'B - Base',
      camp_c: 'C - Campamento',
      pas: 'PAS - Puesto Avanzado de Seguridad',
      pap: 'PAP - Puesto Avanzado de Planificación',
      other: 'Otro'
    };
    return labels[type] || type;
  };



  return (
    <Card className="overflow-hidden">
      {enablePOI && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <Button
            size="sm"
            onClick={() => setShowAddPOI(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar POI
          </Button>
        </div>
      )}

      <div style={{ height: showAddPOI ? '250px' : height, width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
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
            <BaseLayer name="Híbrido">
              <TileLayer
                attribution='&copy; Google'
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              />
            </BaseLayer>

            {/* Capa de Radio de Incidentes */}
            <Overlay checked name="Radio de Incidentes">
              <>
                {incidents.map((incident) => {
                  if (!incident.coordinates?.lat || !incident.coordinates?.lng) return null;
                  const position = [incident.coordinates.lat, incident.coordinates.lng];
                  return (
                    <Circle
                      key={`radius-${incident.id}`}
                      center={position}
                      radius={getRadiusMeters(incident.severity)}
                      pathOptions={{
                        color: getSeverityColor(incident.severity),
                        fillColor: getSeverityColor(incident.severity),
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                      }}
                    />
                  );
                })}
              </>
            </Overlay>
          </LayersControl>

          {incidents.map((incident) => {
            if (!incident.coordinates?.lat || !incident.coordinates?.lng) return null;
            
            const position = [incident.coordinates.lat, incident.coordinates.lng];
            const isSelected = selectedIncident?.id === incident.id;
            
            return (
              <React.Fragment key={incident.id}>
                <Marker 
                  position={position}
                  icon={createIncidentIcon(incident.severity, incident.type)}
                  eventHandlers={{
                    click: () => {
                      if (onIncidentClick) {
                        onIncidentClick(incident);
                      }
                    }
                  }}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">
                          #{incident.incident_number}
                        </span>
                        <Badge 
                          className="text-xs"
                          style={{ 
                            backgroundColor: getSeverityColor(incident.severity),
                            color: 'white'
                          }}
                        >
                          {getSeverityLabel(incident.severity)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {incident.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {incident.location}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getStatusLabel(incident.status)}
                        </Badge>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* POI Markers */}
          {enablePOI && pois.map((poi) => {
            if (!poi.coordinates?.lat || !poi.coordinates?.lng) return null;
            
            const position = [poi.coordinates.lat, poi.coordinates.lng];
            
            return (
              <Marker 
                key={poi.id}
                position={position}
                icon={createPOIIcon(poi.type)}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getPOITypeLabel(poi.type)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePOI.mutate(poi.id)}
                        className="h-6 px-2 text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {poi.name}
                    </h3>
                    {poi.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {poi.description}
                      </p>
                    )}
                    {poi.contact_info && (
                      <p className="text-xs text-slate-500">
                        📞 {poi.contact_info}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Add POI Dialog */}
      {enablePOI && (
        <AddPOIDialog
          open={showAddPOI}
          onClose={() => {
            setShowAddPOI(false);
            setClickedCoords(null);
          }}
          onAdd={(data) => createPOI.mutate(data)}
          initialCoordinates={clickedCoords}
          incidentCoordinates={selectedIncident?.coordinates || (incidents[0]?.coordinates)}
        />
      )}
    </Card>
  );
}