import React, { useState, useEffect } from 'react';
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
    severity: 'medium',
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
        severity: 'medium',
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
              <Label htmlFor="severity">Severidad</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
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
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Dirección o ubicación del incidente"
                  required
                />
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