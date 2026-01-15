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
import { Loader2 } from 'lucide-react';

const roleOptions = [
  { value: 'incident_commander', label: 'Comandante del Incidente' },
  { value: 'public_info_officer', label: 'Oficial de Información Pública' },
  { value: 'safety_officer', label: 'Oficial de Seguridad' },
  { value: 'liaison_officer', label: 'Oficial de Enlace' },
  { value: 'operations_chief', label: 'Jefe de Operaciones' },
  { value: 'planning_chief', label: 'Jefe de Planificación' },
  { value: 'logistics_chief', label: 'Jefe de Logística' },
  { value: 'finance_chief', label: 'Jefe de Finanzas/Administración' }
];

export default function StaffAssignmentForm({ open, onClose, onSubmit, incident, member, isLoading }) {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    institucion: '',
    cargo: '',
    contact: '',
    radio_channel: '',
    notes: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        role: member.role || '',
        name: member.name || '',
        institucion: member.institucion || '',
        cargo: member.cargo || '',
        contact: member.contact || '',
        radio_channel: member.radio_channel || '',
        notes: member.notes || ''
      });
    } else {
      setFormData({
        role: '',
        name: '',
        institucion: '',
        cargo: '',
        contact: '',
        radio_channel: '',
        notes: ''
      });
    }
  }, [member, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Editar Asignación' : 'Asignar Personal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol/Posición *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre y apellido"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institucion">Institución</Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                placeholder="Ej: Bomberos de Chile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ej: Capitán"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contacto</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radio_channel">Canal de Radio</Label>
              <Input
                id="radio_channel"
                value={formData.radio_channel}
                onChange={(e) => setFormData({ ...formData, radio_channel: e.target.value })}
                placeholder="Ej: Canal 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
              rows={2}
            />
          </div>

          {incident && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Incidente:</strong> {incident.incident_number} - {incident.name}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {member ? 'Guardar Cambios' : 'Asignar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}