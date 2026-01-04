import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl, Marker, Circle, Polygon, Polyline, Rectangle, Popup, useMapEvents } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, MapPin, Circle as CircleIcon, Square, Minus } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  
  return null;
}

function DrawingTool({ drawMode, onDrawComplete, selectedIcon }) {
  const [tempPoints, setTempPoints] = useState([]);
  
  useMapEvents({
    click(e) {
      if (!drawMode) return;
      
      const { lat, lng } = e.latlng;
      
      if (drawMode === 'marker') {
        onDrawComplete({
          type: 'marker',
          coordinates: [lat, lng]
        });
      } else if (drawMode === 'icon' && selectedIcon) {
        onDrawComplete({
          type: 'icon',
          coordinates: [lat, lng],
          iconType: selectedIcon
        });
      } else if (drawMode === 'circle') {
        if (tempPoints.length === 0) {
          setTempPoints([[lat, lng]]);
        } else {
          const center = tempPoints[0];
          const radius = e.latlng.distanceTo(center);
          onDrawComplete({
            type: 'circle',
            center: center,
            radius: radius
          });
          setTempPoints([]);
        }
      } else if (drawMode === 'polygon' || drawMode === 'polyline') {
        setTempPoints([...tempPoints, [lat, lng]]);
      } else if (drawMode === 'rectangle') {
        if (tempPoints.length === 0) {
          setTempPoints([[lat, lng]]);
        } else {
          onDrawComplete({
            type: 'rectangle',
            coordinates: [tempPoints[0], [lat, lng]]
          });
          setTempPoints([]);
        }
      }
    },
    dblclick(e) {
      if ((drawMode === 'polygon' || drawMode === 'polyline') && tempPoints.length >= 2) {
        onDrawComplete({
          type: drawMode,
          coordinates: tempPoints
        });
        setTempPoints([]);
      }
    }
  });
  
  return null;
}

export default function DrawableOperationsMap({ 
  incident,
  drawings = [],
  onDrawingsChange,
  resources = []
}) {
  const [mapCenter, setMapCenter] = useState([-33.4489, -70.6693]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [editingDrawing, setEditingDrawing] = useState(null);
  const [drawMode, setDrawMode] = useState(null);
  const [editingPoints, setEditingPoints] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    type: 'hazard_zone',
    description: '',
    resources: '',
    priority: 'medium',
    color: '#ef4444'
  });

  // Emergency icons kit
  const emergencyIcons = {
    // Vehículos de emergencia
    fire_truck: { icon: '🚒', label: 'Carro Bomba', category: 'Bomberos' },
    ambulance: { icon: '🚑', label: 'Ambulancia', category: 'Médico' },
    police_car: { icon: '🚓', label: 'Patrulla', category: 'Policía' },
    helicopter: { icon: '🚁', label: 'Helicóptero', category: 'Aéreo' },
    boat: { icon: '🚤', label: 'Lancha', category: 'Acuático' },
    
    // Personal
    firefighter: { icon: '👨‍🚒', label: 'Bombero', category: 'Personal' },
    medic: { icon: '👨‍⚕️', label: 'Paramédico', category: 'Personal' },
    police_officer: { icon: '👮', label: 'Policía', category: 'Personal' },
    
    // Equipamiento
    fire_extinguisher: { icon: '🧯', label: 'Extintor', category: 'Equipamiento' },
    medical_kit: { icon: '🏥', label: 'Botiquín', category: 'Equipamiento' },
    barrier: { icon: '🚧', label: 'Barrera', category: 'Equipamiento' },
    radio: { icon: '📡', label: 'Puesto de Comunicaciones', category: 'Comunicaciones' },
    
    // Instalaciones
    hospital: { icon: '🏥', label: 'Hospital', category: 'Instalaciones' },
    command_post: { icon: '🏢', label: 'Puesto Comando', category: 'Instalaciones' },
    shelter: { icon: '🏠', label: 'Albergue', category: 'Instalaciones' },
    water_tank: { icon: '💧', label: 'Tanque Agua', category: 'Instalaciones' },
    
    // Alertas
    fire: { icon: '🔥', label: 'Incendio', category: 'Alertas' },
    hazard: { icon: '☢️', label: 'Peligro', category: 'Alertas' },
    explosion: { icon: '💥', label: 'Explosión', category: 'Alertas' },
    flood: { icon: '🌊', label: 'Inundación', category: 'Alertas' },
  };

  // Map resource type to icon
  const getResourceIcon = (type, category) => {
    if (type === 'vehicle') {
      if (category?.toLowerCase().includes('bomba')) return 'fire_truck';
      if (category?.toLowerCase().includes('ambulancia')) return 'ambulance';
      if (category?.toLowerCase().includes('patrulla') || category?.toLowerCase().includes('policia')) return 'police_car';
      if (category?.toLowerCase().includes('helicóptero') || category?.toLowerCase().includes('helicoptero')) return 'helicopter';
      if (category?.toLowerCase().includes('lancha') || category?.toLowerCase().includes('bote')) return 'boat';
    }
    if (type === 'personnel') {
      if (category?.toLowerCase().includes('bombero')) return 'firefighter';
      if (category?.toLowerCase().includes('médico') || category?.toLowerCase().includes('medico') || category?.toLowerCase().includes('paramédico')) return 'medic';
      if (category?.toLowerCase().includes('policía') || category?.toLowerCase().includes('policia')) return 'police_officer';
    }
    if (type === 'equipment') {
      if (category?.toLowerCase().includes('extintor')) return 'fire_extinguisher';
      if (category?.toLowerCase().includes('botiquín') || category?.toLowerCase().includes('medico')) return 'medical_kit';
      if (category?.toLowerCase().includes('barrera')) return 'barrier';
      if (category?.toLowerCase().includes('radio') || category?.toLowerCase().includes('comunicación')) return 'radio';
    }
    return 'fire_truck';
  };

  useEffect(() => {
    if (incident?.coordinates) {
      setMapCenter([incident.coordinates.lat, incident.coordinates.lng]);
      setMapZoom(14);
    }
  }, [incident]);

  const handleDrawComplete = (geometry) => {
    setDrawMode(null);
    setCurrentDrawing({ geometry, id: Date.now() });
    setMetadata({
      name: '',
      type: 'hazard_zone',
      description: '',
      resources: '',
      priority: 'medium',
      color: '#ef4444'
    });
    setShowMetadataDialog(true);
  };

  const handleSaveMetadata = () => {
    if (editingDrawing) {
      // Update existing drawing
      const updatedDrawings = drawings.map(d => 
        d.id === editingDrawing.id 
          ? { ...d, ...metadata }
          : d
      );
      onDrawingsChange(updatedDrawings);
      setEditingDrawing(null);
    } else if (currentDrawing) {
      // Add new drawing
      const newDrawing = {
        ...currentDrawing,
        ...metadata,
        resourceId: metadata.resourceId || null
      };
      onDrawingsChange([...drawings, newDrawing]);
      setCurrentDrawing(null);
    }
    setShowMetadataDialog(false);
    setMetadata({
      name: '',
      type: 'hazard_zone',
      description: '',
      resources: '',
      priority: 'medium',
      resourceId: null,
      color: '#ef4444'
    });
  };

  const handleEdit = (drawing) => {
    setEditingDrawing(drawing);
    setMetadata({
      name: drawing.name || '',
      type: drawing.type || 'hazard_zone',
      description: drawing.description || '',
      resources: drawing.resources || '',
      priority: drawing.priority || 'medium',
      color: drawing.color || '#ef4444'
    });
    setShowMetadataDialog(true);
  };

  const handleEditPoints = (drawing) => {
    setEditingPoints(drawing);
  };

  const handleSaveEditedPoints = () => {
    if (editingPoints) {
      const updatedDrawings = drawings.map(d => 
        d.id === editingPoints.id ? editingPoints : d
      );
      onDrawingsChange(updatedDrawings);
      setEditingPoints(null);
    }
  };

  const handleDelete = (drawingId) => {
    const updatedDrawings = drawings.filter(d => d.id !== drawingId);
    onDrawingsChange(updatedDrawings);
  };

  const getDrawingColor = (type) => {
    const colors = {
      hazard_zone: '#ef4444',
      safe_zone: '#10b981',
      evacuation_route: '#3b82f6',
      staging_area: '#f59e0b',
      water_source: '#06b6d4',
      fire_line: '#dc2626',
      access_point: '#8b5cf6',
      restricted_area: '#f97316',
      medical_area: '#ec4899',
      other: '#64748b'
    };
    return colors[type] || colors.other;
  };

  const getTypeLabel = (type) => {
    const labels = {
      hazard_zone: 'Zona de Peligro',
      safe_zone: 'Zona Segura',
      evacuation_route: 'Ruta de Evacuación',
      staging_area: 'Área de Preparación',
      water_source: 'Fuente de Agua',
      fire_line: 'Línea de Fuego',
      access_point: 'Punto de Acceso',
      restricted_area: 'Área Restringida',
      medical_area: 'Área Médica',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  const renderDrawing = (drawing) => {
    const color = drawing.color || getDrawingColor(drawing.type);
    const isEditing = editingPoints?.id === drawing.id;
    
    if (drawing.geometry.type === 'icon') {
      const iconData = emergencyIcons[drawing.geometry.iconType];
      const linkedResource = drawing.resourceId ? resources.find(r => r.id === drawing.resourceId) : null;
      
      return (
        <Marker 
          key={drawing.id}
          position={isEditing ? editingPoints.geometry.coordinates : drawing.geometry.coordinates}
          draggable={isEditing}
          icon={L.divIcon({
            className: 'custom-emergency-icon',
            html: `
              <div style="
                background-color: #f97316;
                width: 50px;
                height: 40px;
                border-radius: 6px;
                border: 2px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: bold;
                color: white;
                font-family: Arial, sans-serif;
              ">
                PC
              </div>
            `,
            iconSize: [50, 40],
            iconAnchor: [25, 20],
            popupAnchor: [0, -20]
          })}
          eventHandlers={isEditing ? {
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              setEditingPoints({
                ...editingPoints,
                geometry: { ...editingPoints.geometry, coordinates: [lat, lng] }
              });
            }
          } : {}}
        >
          <Popup>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{iconData?.icon}</span>
                <div>
                  <h3 className="font-bold text-sm">{drawing.name || iconData?.label}</h3>
                  <p className="text-xs text-slate-500">{iconData?.category}</p>
                </div>
              </div>
              {linkedResource && (
                <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-700 font-semibold">🔗 Recurso: {linkedResource.name}</p>
                  <p className="text-xs text-green-600">{linkedResource.category}</p>
                </div>
              )}
              {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
              {drawing.resources && <p className="text-xs text-blue-600 mb-1">Info: {drawing.resources}</p>}
              {isEditing ? (
                <div className="flex gap-1 mt-2">
                  <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                    <Edit2 className="w-3 h-3 mr-1" />
                    Mover
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      );
    } else if (drawing.geometry.type === 'marker') {
      return (
        <Marker 
          key={drawing.id}
          position={isEditing ? editingPoints.geometry.coordinates : drawing.geometry.coordinates}
          draggable={isEditing}
          eventHandlers={isEditing ? {
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              setEditingPoints({
                ...editingPoints,
                geometry: { ...editingPoints.geometry, coordinates: [lat, lng] }
              });
            }
          } : {}}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
              <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
              {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
              {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
              {isEditing ? (
                <div className="flex gap-1 mt-2">
                  <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                    <Edit2 className="w-3 h-3 mr-1" />
                    Mover
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      );
    } else if (drawing.geometry.type === 'circle') {
      return (
        <Circle
          key={drawing.id}
          center={isEditing ? editingPoints.geometry.center : drawing.geometry.center}
          radius={isEditing ? editingPoints.geometry.radius : drawing.geometry.radius}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
              <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
              {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
              {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={editingPoints.geometry.radius}
                    onChange={(e) => setEditingPoints({
                      ...editingPoints,
                      geometry: { ...editingPoints.geometry, radius: parseFloat(e.target.value) }
                    })}
                    placeholder="Radio (metros)"
                    className="h-7 text-xs"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                    <Edit2 className="w-3 h-3 mr-1" />
                    Puntos
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Circle>
      );
    } else if (drawing.geometry.type === 'polygon') {
      return (
        <>
          <Polygon
            key={drawing.id}
            positions={isEditing ? editingPoints.geometry.coordinates : drawing.geometry.coordinates}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
                <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
                {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
                {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
                {isEditing ? (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                      <Edit2 className="w-3 h-3 mr-1" />
                      Puntos
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
          {isEditing && editingPoints.geometry.coordinates.map((coord, idx) => (
            <Marker
              key={`edit-${drawing.id}-${idx}`}
              position={coord}
              draggable={true}
              icon={L.divIcon({
                className: 'custom-edit-marker',
                html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid ${color}; border-radius: 50%;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  const newCoords = [...editingPoints.geometry.coordinates];
                  newCoords[idx] = [lat, lng];
                  setEditingPoints({
                    ...editingPoints,
                    geometry: { ...editingPoints.geometry, coordinates: newCoords }
                  });
                }
              }}
            />
          ))}
        </>
      );
    } else if (drawing.geometry.type === 'polyline') {
      return (
        <>
          <Polyline
            key={drawing.id}
            positions={isEditing ? editingPoints.geometry.coordinates : drawing.geometry.coordinates}
            pathOptions={{
              color: color,
              weight: 3
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
                <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
                {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
                {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
                {isEditing ? (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                      <Edit2 className="w-3 h-3 mr-1" />
                      Puntos
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Popup>
          </Polyline>
          {isEditing && editingPoints.geometry.coordinates.map((coord, idx) => (
            <Marker
              key={`edit-${drawing.id}-${idx}`}
              position={coord}
              draggable={true}
              icon={L.divIcon({
                className: 'custom-edit-marker',
                html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid ${color}; border-radius: 50%;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  const newCoords = [...editingPoints.geometry.coordinates];
                  newCoords[idx] = [lat, lng];
                  setEditingPoints({
                    ...editingPoints,
                    geometry: { ...editingPoints.geometry, coordinates: newCoords }
                  });
                }
              }}
            />
          ))}
        </>
      );
    } else if (drawing.geometry.type === 'rectangle') {
      return (
        <>
          <Rectangle
            key={drawing.id}
            bounds={isEditing ? editingPoints.geometry.coordinates : drawing.geometry.coordinates}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
                <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
                {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
                {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
                {isEditing ? (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="h-6 px-2 bg-green-600 hover:bg-green-700" onClick={handleSaveEditedPoints}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => setEditingPoints(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEditPoints(drawing)}>
                      <Edit2 className="w-3 h-3 mr-1" />
                      Puntos
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => handleDelete(drawing.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Popup>
          </Rectangle>
          {isEditing && editingPoints.geometry.coordinates.map((coord, idx) => (
            <Marker
              key={`edit-${drawing.id}-${idx}`}
              position={coord}
              draggable={true}
              icon={L.divIcon({
                className: 'custom-edit-marker',
                html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid ${color}; border-radius: 50%;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  const newCoords = [...editingPoints.geometry.coordinates];
                  newCoords[idx] = [lat, lng];
                  setEditingPoints({
                    ...editingPoints,
                    geometry: { ...editingPoints.geometry, coordinates: newCoords }
                  });
                }
              }}
            />
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div style={{ height: '450px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <DrawingTool drawMode={drawMode} onDrawComplete={handleDrawComplete} selectedIcon={selectedIcon} />
            
            <LayersControl position="topright">
              <BaseLayer checked name="Mapa Estándar">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="ArcGIS Emergencias">
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
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

            {/* Incident marker */}
            {incident?.coordinates?.lat && incident?.coordinates?.lng && (
              <>
                <Marker
                  position={[incident.coordinates.lat, incident.coordinates.lng]}
                  icon={L.divIcon({
                    className: 'custom-incident-marker',
                    html: `
                      <div style="
                        background-color: #ef4444;
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
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-sm mb-1">📍 Incidente</h3>
                      <p className="text-xs font-semibold">{incident.name}</p>
                      <p className="text-xs text-slate-500">{incident.location}</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[incident.coordinates.lat, incident.coordinates.lng]}
                  radius={500}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              </>
            )}

            {/* Render existing drawings */}
            {drawings.map(drawing => renderDrawing(drawing))}
          </MapContainer>
        </div>
      </Card>

      {/* Drawing Tools - Below Map */}
      <Card className="p-3 mt-4">
        <div className="text-xs font-semibold mb-2 text-center">Herramientas de Dibujo</div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant={showIconPicker ? 'default' : 'outline'}
            onClick={() => {
              setShowIconPicker(!showIconPicker);
              setDrawMode(null);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2 col-span-3 bg-orange-50 hover:bg-orange-100 border-orange-300"
          >
            <span className="text-lg">🚒</span>
            <span className="text-xs font-semibold">Iconos de Emergencia</span>
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'marker' ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode(drawMode === 'marker' ? null : 'marker');
              setShowIconPicker(false);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Marcador</span>
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'circle' ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode(drawMode === 'circle' ? null : 'circle');
              setShowIconPicker(false);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <CircleIcon className="w-4 h-4" />
            <span className="text-xs">Círculo</span>
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'polygon' ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode(drawMode === 'polygon' ? null : 'polygon');
              setShowIconPicker(false);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Square className="w-4 h-4" />
            <span className="text-xs">Polígono</span>
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'polyline' ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode(drawMode === 'polyline' ? null : 'polyline');
              setShowIconPicker(false);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Minus className="w-4 h-4" />
            <span className="text-xs">Línea</span>
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'rectangle' ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode(drawMode === 'rectangle' ? null : 'rectangle');
              setShowIconPicker(false);
            }}
            className="flex flex-col items-center gap-1 h-auto py-2 col-span-2"
          >
            <Square className="w-4 h-4" />
            <span className="text-xs">Rectángulo</span>
          </Button>
        </div>

        {/* Icon Picker */}
        {showIconPicker && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border max-h-96 overflow-y-auto">
            {/* Resources Section */}
            {resources.length > 0 && (
              <div className="mb-4 pb-3 border-b">
                <div className="text-xs font-semibold mb-2 text-orange-600">📦 Recursos del Incidente:</div>
                <div className="space-y-1">
                  {resources.filter(r => r.status === 'deployed' || r.status === 'available').map((resource) => {
                    const iconKey = getResourceIcon(resource.type, resource.category);
                    const iconData = emergencyIcons[iconKey];
                    const existingDrawing = drawings.find(d => d.resourceId === resource.id);
                    
                    return (
                      <Button
                        key={resource.id}
                        size="sm"
                        variant={existingDrawing ? 'default' : 'outline'}
                        onClick={() => {
                          if (existingDrawing) {
                            // Already on map, center on it
                            setMapCenter([existingDrawing.geometry.coordinates[0], existingDrawing.geometry.coordinates[1]]);
                          } else {
                            // Add to map
                            setSelectedIcon(iconKey);
                            setDrawMode('icon');
                            setMetadata({
                              ...metadata,
                              name: resource.name,
                              resourceId: resource.id
                            });
                          }
                        }}
                        className="w-full justify-start gap-2 h-auto py-2"
                      >
                        <span className="text-lg">{iconData.icon}</span>
                        <div className="text-left flex-1">
                          <div className="text-xs font-semibold">{resource.name}</div>
                          <div className="text-[10px] text-slate-500">{resource.category}</div>
                        </div>
                        {existingDrawing ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">En Mapa</span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Ubicar</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Icons Section */}
            <div className="text-xs font-semibold mb-2">🎨 Iconos Generales:</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(emergencyIcons).map(([key, data]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedIcon === key ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedIcon(key);
                    setDrawMode('icon');
                    setMetadata({
                      ...metadata,
                      resourceId: null
                    });
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  title={data.label}
                >
                  <span className="text-xl">{data.icon}</span>
                  <span className="text-[10px] text-center leading-tight">{data.label}</span>
                </Button>
              ))}
            </div>
            {selectedIcon && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-center">
                Click en el mapa para colocar: {emergencyIcons[selectedIcon].label}
              </div>
            )}
          </div>
        )}

        {drawMode && drawMode !== 'icon' && (
          <div className="text-xs text-slate-500 mt-2 p-2 bg-blue-50 rounded text-center">
            {drawMode === 'marker' && 'Click en el mapa para colocar marcador'}
            {drawMode === 'circle' && 'Click para centro, luego click para radio'}
            {drawMode === 'polygon' && 'Click para puntos, doble-click para finalizar'}
            {drawMode === 'polyline' && 'Click para puntos, doble-click para finalizar'}
            {drawMode === 'rectangle' && 'Click para esquina, luego click para finalizar'}
          </div>
        )}
      </Card>

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDrawing ? 'Editar Elemento' : 'Información del Elemento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Icon Type Selector */}
            {currentDrawing?.geometry?.type === 'icon' && !editingDrawing && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Icono</Label>
                  <Select
                    value={metadata.resourceId ? 'resource' : 'general'}
                    onValueChange={(value) => {
                      if (value === 'general') {
                        setMetadata({ ...metadata, resourceId: null });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Icono General</SelectItem>
                      <SelectItem value="resource">Recurso del Incidente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!metadata.resourceId && currentDrawing?.geometry?.iconType && (
                  <div className="space-y-2">
                    <Label>Icono Específico</Label>
                    <Select
                      value={currentDrawing.geometry.iconType}
                      onValueChange={(value) => {
                        const updatedDrawing = {
                          ...currentDrawing,
                          geometry: { ...currentDrawing.geometry, iconType: value }
                        };
                        setCurrentDrawing(updatedDrawing);
                        setSelectedIcon(value);
                        setMetadata({ ...metadata, name: emergencyIcons[value].label });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {Object.entries(emergencyIcons).map(([key, data]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{data.icon}</span>
                              <span>{data.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="p-2 bg-slate-50 rounded border flex items-center gap-2">
                      <span className="text-2xl">{emergencyIcons[currentDrawing.geometry.iconType].icon}</span>
                      <div className="text-xs">
                        <div className="font-semibold">{emergencyIcons[currentDrawing.geometry.iconType].label}</div>
                        <div className="text-slate-500">{emergencyIcons[currentDrawing.geometry.iconType].category}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Resource Selector */}
            {currentDrawing?.geometry?.type === 'icon' && !editingDrawing && metadata.resourceId === null && resources.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular con Recurso (Opcional)</Label>
                <Select
                  value={metadata.resourceId || 'none'}
                  onValueChange={(value) => {
                    if (value !== 'none') {
                      const resource = resources.find(r => r.id === value);
                      if (resource) {
                        setMetadata({ 
                          ...metadata, 
                          resourceId: value,
                          name: resource.name 
                        });
                      }
                    } else {
                      setMetadata({ ...metadata, resourceId: null });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin vincular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin vincular</SelectItem>
                    {resources.filter(r => r.status === 'deployed' || r.status === 'available').map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                placeholder="Ej: Zona de peligro sector A"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={metadata.type}
                onValueChange={(value) => setMetadata({ ...metadata, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hazard_zone">Zona de Peligro</SelectItem>
                  <SelectItem value="safe_zone">Zona Segura</SelectItem>
                  <SelectItem value="evacuation_route">Ruta de Evacuación</SelectItem>
                  <SelectItem value="staging_area">Área de Preparación</SelectItem>
                  <SelectItem value="water_source">Fuente de Agua</SelectItem>
                  <SelectItem value="fire_line">Línea de Fuego</SelectItem>
                  <SelectItem value="access_point">Punto de Acceso</SelectItem>
                  <SelectItem value="restricted_area">Área Restringida</SelectItem>
                  <SelectItem value="medical_area">Área Médica</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={metadata.priority}
                onValueChange={(value) => setMetadata({ ...metadata, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recursos Asignados</Label>
              <Input
                value={metadata.resources}
                onChange={(e) => setMetadata({ ...metadata, resources: e.target.value })}
                placeholder="Ej: 2 carros bombas, 10 bomberos"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Descripción detallada..."
                rows={3}
              />
            </div>

            {(currentDrawing?.geometry?.type === 'polygon' || currentDrawing?.geometry?.type === 'circle' || currentDrawing?.geometry?.type === 'rectangle' || editingDrawing) && (
              <div className="space-y-2">
                <Label>Color del Polígono</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={metadata.color}
                    onChange={(e) => setMetadata({ ...metadata, color: e.target.value })}
                    className="w-20 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={metadata.color}
                    onChange={(e) => setMetadata({ ...metadata, color: e.target.value })}
                    placeholder="#ef4444"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-3 pt-4">
              {editingDrawing && (
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleDelete(editingDrawing.id);
                    setShowMetadataDialog(false);
                    setEditingDrawing(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMetadataDialog(false);
                    setCurrentDrawing(null);
                    setEditingDrawing(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveMetadata}
                  disabled={!metadata.name}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}