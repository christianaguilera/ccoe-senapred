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

function DrawingTool({ drawMode, onDrawComplete }) {
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
  onDrawingsChange
}) {
  const [mapCenter, setMapCenter] = useState([-33.4489, -70.6693]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [editingDrawing, setEditingDrawing] = useState(null);
  const [drawMode, setDrawMode] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    type: 'hazard_zone',
    description: '',
    resources: '',
    priority: 'medium'
  });

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
      priority: 'medium'
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
        ...metadata
      };
      onDrawingsChange([...drawings, newDrawing]);
      setCurrentDrawing(null);
    }
    setShowMetadataDialog(false);
  };

  const handleEdit = (drawing) => {
    setEditingDrawing(drawing);
    setMetadata({
      name: drawing.name || '',
      type: drawing.type || 'hazard_zone',
      description: drawing.description || '',
      resources: drawing.resources || '',
      priority: drawing.priority || 'medium'
    });
    setShowMetadataDialog(true);
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
    const color = getDrawingColor(drawing.type);
    
    if (drawing.geometry.type === 'marker') {
      return (
        <Marker 
          key={drawing.id}
          position={drawing.geometry.coordinates}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{drawing.name || 'Sin nombre'}</h3>
              <p className="text-xs text-slate-600 mb-1">{getTypeLabel(drawing.type)}</p>
              {drawing.description && <p className="text-xs mb-1">{drawing.description}</p>}
              {drawing.resources && <p className="text-xs text-blue-600 mb-1">Recursos: {drawing.resources}</p>}
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleDelete(drawing.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    } else if (drawing.geometry.type === 'circle') {
      return (
        <Circle
          key={drawing.id}
          center={drawing.geometry.center}
          radius={drawing.geometry.radius}
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
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleDelete(drawing.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Circle>
      );
    } else if (drawing.geometry.type === 'polygon') {
      return (
        <Polygon
          key={drawing.id}
          positions={drawing.geometry.coordinates}
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
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleDelete(drawing.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Polygon>
      );
    } else if (drawing.geometry.type === 'polyline') {
      return (
        <Polyline
          key={drawing.id}
          positions={drawing.geometry.coordinates}
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
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleDelete(drawing.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Polyline>
      );
    } else if (drawing.geometry.type === 'rectangle') {
      return (
        <Rectangle
          key={drawing.id}
          bounds={drawing.geometry.coordinates}
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
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleEdit(drawing)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleDelete(drawing.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Rectangle>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Drawing Tools */}
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
          <div className="text-xs font-semibold mb-2">Herramientas de Dibujo</div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant={drawMode === 'marker' ? 'default' : 'outline'}
              onClick={() => setDrawMode(drawMode === 'marker' ? null : 'marker')}
              className="w-full justify-start"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Marcador
            </Button>
            <Button
              size="sm"
              variant={drawMode === 'circle' ? 'default' : 'outline'}
              onClick={() => setDrawMode(drawMode === 'circle' ? null : 'circle')}
              className="w-full justify-start"
            >
              <CircleIcon className="w-4 h-4 mr-2" />
              Círculo
            </Button>
            <Button
              size="sm"
              variant={drawMode === 'polygon' ? 'default' : 'outline'}
              onClick={() => setDrawMode(drawMode === 'polygon' ? null : 'polygon')}
              className="w-full justify-start"
            >
              <Square className="w-4 h-4 mr-2" />
              Polígono
            </Button>
            <Button
              size="sm"
              variant={drawMode === 'polyline' ? 'default' : 'outline'}
              onClick={() => setDrawMode(drawMode === 'polyline' ? null : 'polyline')}
              className="w-full justify-start"
            >
              <Minus className="w-4 h-4 mr-2" />
              Línea
            </Button>
            <Button
              size="sm"
              variant={drawMode === 'rectangle' ? 'default' : 'outline'}
              onClick={() => setDrawMode(drawMode === 'rectangle' ? null : 'rectangle')}
              className="w-full justify-start"
            >
              <Square className="w-4 h-4 mr-2" />
              Rectángulo
            </Button>
          </div>
          {drawMode && (
            <div className="text-xs text-slate-500 mt-2 p-2 bg-blue-50 rounded">
              {drawMode === 'marker' && 'Click en el mapa para colocar marcador'}
              {drawMode === 'circle' && 'Click para centro, luego click para radio'}
              {drawMode === 'polygon' && 'Click para puntos, doble-click para finalizar'}
              {drawMode === 'polyline' && 'Click para puntos, doble-click para finalizar'}
              {drawMode === 'rectangle' && 'Click para esquina, luego click para finalizar'}
            </div>
          )}
        </div>
        
        <div style={{ height: '450px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <DrawingTool drawMode={drawMode} onDrawComplete={handleDrawComplete} />
            
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

            {/* Render existing drawings */}
            {drawings.map(drawing => renderDrawing(drawing))}

            {/* Incident marker */}
            {incident?.coordinates?.lat && incident?.coordinates?.lng && (
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
            )}
          </MapContainer>
        </div>
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

            <div className="flex justify-end gap-3 pt-4">
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
        </DialogContent>
      </Dialog>
    </>
  );
}