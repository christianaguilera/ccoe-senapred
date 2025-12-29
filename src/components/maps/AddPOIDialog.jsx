import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  return null;
}

const poiTypes = {
  // Etiquetas SCI oficiales
  pc: 'PC - Puesto de Comando',
  acv: 'ACV - Área Concentración de Víctimas',
  staging_e: 'E - Área de Espera',
  helibase_h: 'H - Helibase',
  base_b: 'B - Base',
  camp_c: 'C - Campamento',
  pas: 'PAS - Puesto Avanzado Seguridad',
  pap: 'PAP - Puesto Avanzado Planificación',
  
  // Otros puntos de interés
  command_center: '🏢 Centro de Comando',
  resource_station: '📦 Estación de Recursos',
  medical_post: '🏥 Puesto Médico',
  staging_area: '🚧 Área de Preparación',
  heliport: '🚁 Helipuerto',
  water_source: '💧 Fuente de Agua',
  hazard_zone: '☢️ Zona de Peligro',
  evacuation_point: '🚪 Punto de Evacuación',
  supply_depot: '🏪 Depósito de Suministros',
  firefighters: '🚒 Bomberos',
  ambulance: '🚑 Ambulancia',
  police: '🚓 Policía',
  rescue_team: '🦺 Equipo de Rescate',
  shelter: '🏠 Refugio',
  food_distribution: '🍽️ Distribución de Alimentos',
  water_distribution: '🚰 Distribución de Agua',
  generator: '⚡ Generador',
  communications: '📡 Comunicaciones',
  roadblock: '🚧 Bloqueo de Ruta',
  debris: '💥 Escombros',
  field_hospital: '⛺ Hospital de Campaña',
  military: '🪖 Militar',
  volunteers: '🤝 Voluntarios',
  other: '📍 Otro'
};

export default function AddPOIDialog({ open, onClose, onAdd, initialCoordinates = null, incidentCoordinates = null }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'pc',
    description: '',
    contact_info: '',
    coordinates: initialCoordinates || { lat: '', lng: '' }
  });

  const mapCenter = incidentCoordinates 
    ? [incidentCoordinates.lat, incidentCoordinates.lng] 
    : [-33.4489, -70.6693];

  const handleMapClick = (latlng) => {
    setFormData({
      ...formData,
      coordinates: { lat: latlng.lat, lng: latlng.lng }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: '',
      type: 'pc',
      description: '',
      contact_info: '',
      coordinates: { lat: '', lng: '' }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Punto de Interés</DialogTitle>
        </DialogHeader>
        
        {/* Map Section */}
        <div className="mb-4">
          <Label className="mb-2 block">Seleccionar ubicación en el mapa (click para marcar)</Label>
          <div style={{ height: '300px', width: '100%' }} className="rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {formData.coordinates.lat && formData.coordinates.lng && (
                <Marker position={[formData.coordinates.lat, formData.coordinates.lng]} />
              )}
            </MapContainer>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Centro de Comando Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(poiTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitud *</Label>
              <Input
                type="number"
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) }
                })}
                placeholder="-33.4489"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Longitud *</Label>
              <Input
                type="number"
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) }
                })}
                placeholder="-70.6693"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del punto de interés"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Información de contacto</Label>
            <Input
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              placeholder="Teléfono, radio, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              <MapPin className="w-4 h-4 mr-2" />
              Agregar Punto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}