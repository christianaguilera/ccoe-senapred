import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import LocationPicker from '../maps/LocationPicker';

export default function IncidentForm({ open, onClose, onSubmit, incident, isLoading }) {
  const [formData, setFormData] = useState({
    incident_number: '',
    name: '',
    type: 'fire',
    severity: 'minor_emergency',
    status: 'active',
    location: '',
    region: '',
    provincia: '',
    comuna: '',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    description: '',
    incident_commander: '',
    start_time: new Date().toISOString().slice(0, 16),
  });
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (incident) {
      setFormData({
        incident_number: incident.incident_number || '',
        name: incident.name || '',
        type: incident.type || 'fire',
        severity: incident.severity || 'medium',
        status: incident.status || 'active',
        location: incident.location || '',
        region: incident.region || '',
        provincia: incident.provincia || '',
        comuna: incident.comuna || '',
        coordinates: incident.coordinates || { lat: 19.4326, lng: -99.1332 },
        description: incident.description || '',
        incident_commander: incident.incident_commander || '',
        start_time: incident.start_time ? incident.start_time.slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    } else {
      setFormData({
        incident_number: `INC-${Date.now().toString().slice(-6)}`,
        name: '',
        type: 'fire',
        severity: 'minor_emergency',
        status: 'active',
        location: '',
        region: '',
        provincia: '',
        comuna: '',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        description: '',
        incident_commander: '',
        start_time: new Date().toISOString().slice(0, 16),
      });
    }
  }, [incident, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLocationChange = (newLocation) => {
    setFormData({ ...formData, location: newLocation });
    
    // Auto-búsqueda con debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      if (newLocation.trim().length > 5) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newLocation)}&limit=1&accept-language=es`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setFormData(prev => ({
              ...prev,
              coordinates: {
                lat: parseFloat(lat),
                lng: parseFloat(lon)
              }
            }));
          }
        } catch (error) {
          console.error('Error al buscar coordenadas:', error);
        }
      }
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {incident ? 'Editar Incidente' : 'Nuevo Incidente'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="location">Ubicación</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TabsContent value="info" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incident_number">Número de Incidente</Label>
              <Input
                id="incident_number"
                value={formData.incident_number}
                onChange={(e) => setFormData({ ...formData, incident_number: e.target.value })}
                placeholder="INC-000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Fecha y Hora de Inicio</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Incidente *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Descripción breve del incidente"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Incidente</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fire">Incendio</SelectItem>
                  <SelectItem value="forest_fire">Incendio Forestal</SelectItem>
                  <SelectItem value="industrial_fire">Incendio Industrial</SelectItem>
                  <SelectItem value="residential_fire">Incendio Domiciliario</SelectItem>
                  <SelectItem value="critical_infrastructure_fire">Incendio en Infraestructura Crítica</SelectItem>
                  <SelectItem value="maritime_emergency">Emergencia Marítima</SelectItem>
                  <SelectItem value="shipwreck">Naufragio</SelectItem>
                  <SelectItem value="terrorist_attack">Atentado Terrorista</SelectItem>
                  <SelectItem value="bomb_threat">Aviso de Bomba</SelectItem>
                  <SelectItem value="aircraft_crash">Caída de Aeronave</SelectItem>
                  <SelectItem value="mass_removal">Remoción en Masa</SelectItem>
                  <SelectItem value="flash_flood">Aluvión</SelectItem>
                  <SelectItem value="tornado">Tornado</SelectItem>
                  <SelectItem value="earthquake">Sismo/Terremoto</SelectItem>
                  <SelectItem value="tsunami">Tsunami</SelectItem>
                  <SelectItem value="vehicle_accident">Accidente Vehicular</SelectItem>
                  <SelectItem value="multiple_vehicle_accident">Accidente Vehicular Múltiple</SelectItem>
                  <SelectItem value="missing_person_search">Búsqueda de Personas Extraviadas</SelectItem>
                  <SelectItem value="wilderness_rescue">Rescate Agreste</SelectItem>
                  <SelectItem value="high_seas_rescue">Rescate en Alta Mar</SelectItem>
                  <SelectItem value="high_mountain_rescue">Rescate en Alta Montaña</SelectItem>
                  <SelectItem value="hazmat">Materiales Peligrosos</SelectItem>
                  <SelectItem value="medical">Emergencia Médica</SelectItem>
                  <SelectItem value="rescue">Rescate</SelectItem>
                  <SelectItem value="natural_disaster">Desastre Natural</SelectItem>
                  <SelectItem value="civil_emergency">Emergencia Civil</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Nivel de Emergencia</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor_emergency">Emergencia Menor</SelectItem>
                  <SelectItem value="major_emergency">Emergencia Mayor</SelectItem>
                  <SelectItem value="disaster">Desastre</SelectItem>
                  <SelectItem value="catastrophe">Catástrofe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="contained">Contenido</SelectItem>
                <SelectItem value="monitoring">En Monitoreo</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="space-y-2">
                <Label htmlFor="location">Dirección *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Escribe la dirección y el mapa se actualizará automáticamente"
                  required
                />
                <p className="text-xs text-slate-500">
                  El mapa se actualiza automáticamente al escribir la dirección
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Ej: Metropolitana"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    placeholder="Ej: Santiago"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input
                    id="comuna"
                    value={formData.comuna}
                    onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                    placeholder="Ej: Las Condes"
                  />
                </div>
              </div>

          <div className="space-y-2">
            <Label htmlFor="incident_commander">Comandante del Incidente</Label>
            <Input
              id="incident_commander"
              value={formData.incident_commander}
              onChange={(e) => setFormData({ ...formData, incident_commander: e.target.value })}
              placeholder="Nombre del comandante"
            />
          </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles adicionales del incidente..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-5 mt-5">
              <LocationPicker
                coordinates={formData.coordinates}
                onCoordinatesChange={(coords) => setFormData({ ...formData, coordinates: coords })}
                address={formData.location}
                onAddressChange={(addr) => setFormData({ ...formData, location: addr })}
              />
            </TabsContent>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {incident ? 'Guardar Cambios' : 'Crear Incidente'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}