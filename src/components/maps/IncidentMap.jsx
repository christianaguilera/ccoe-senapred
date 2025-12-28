import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Flame } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const { BaseLayer } = LayersControl;

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
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };
  
  const color = colors[severity] || colors.medium;
  
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
  showRadius = false
}) {
  const [mapCenter, setMapCenter] = useState([19.4326, -99.1332]); // Default: Mexico City
  const [mapZoom, setMapZoom] = useState(11);

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
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo'
    };
    return labels[severity] || 'Medio';
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
      critical: 1000,
      high: 500,
      medium: 300,
      low: 200
    };
    return radii[severity] || 300;
  };

  return (
    <Card className="overflow-hidden">
      <div style={{ height, width: '100%' }}>
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

                {/* Show radius circle for selected incident or if showRadius is true */}
                {(isSelected || showRadius) && (
                  <Circle
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
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}