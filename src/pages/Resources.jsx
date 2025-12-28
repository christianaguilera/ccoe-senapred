import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search,
  Package,
  Truck,
  User,
  Plane,
  Anchor,
  Wrench,
  Edit2,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const typeIcons = {
  personnel: User,
  vehicle: Truck,
  equipment: Wrench,
  aircraft: Plane,
  boat: Anchor
};

const typeLabels = {
  personnel: 'Personal',
  vehicle: 'Vehículo',
  equipment: 'Equipo',
  aircraft: 'Aeronave',
  boat: 'Embarcación'
};

const statusConfig = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700' },
  deployed: { label: 'Desplegado', color: 'bg-blue-100 text-blue-700' },
  en_route: { label: 'En Camino', color: 'bg-amber-100 text-amber-700' },
  out_of_service: { label: 'Fuera de Servicio', color: 'bg-slate-100 text-slate-700' }
};

export default function Resources() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedIncident = urlParams.get('incident');

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [resourceToAssign, setResourceToAssign] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'personnel',
    category: '',
    status: 'available',
    quantity: 1,
    assigned_to: '',
    incident_id: preselectedIncident || '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 100),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents-list'],
    queryFn: () => base44.entities.Incident.filter({ status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'personnel',
      category: '',
      status: 'available',
      quantity: 1,
      assigned_to: '',
      incident_id: preselectedIncident || '',
      notes: ''
    });
    setEditingResource(null);
    setShowForm(false);
  };

  const handleEdit = (resource) => {
    setFormData({
      name: resource.name || '',
      type: resource.type || 'personnel',
      category: resource.category || '',
      status: resource.status || 'available',
      quantity: resource.quantity || 1,
      assigned_to: resource.assigned_to || '',
      incident_id: resource.incident_id || '',
      notes: resource.notes || ''
    });
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const availableCount = resources.filter(r => r.status === 'available').length;
  const deployedCount = resources.filter(r => r.status === 'deployed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recursos</h1>
          <p className="text-slate-500 mt-1">Gestiona personal, vehículos y equipos</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Recurso
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{resources.length}</p>
          <p className="text-sm text-slate-500">Total</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50 border-emerald-200">
          <p className="text-2xl font-bold text-emerald-700">{availableCount}</p>
          <p className="text-sm text-emerald-600">Disponibles</p>
        </Card>
        <Card className="p-4 text-center bg-blue-50 border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{deployedCount}</p>
          <p className="text-sm text-blue-600">Desplegados</p>
        </Card>
        <Card className="p-4 text-center bg-amber-50 border-amber-200">
          <p className="text-2xl font-bold text-amber-700">
            {resources.filter(r => r.status === 'en_route').length}
          </p>
          <p className="text-sm text-amber-600">En Camino</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="available">Disponibles</TabsTrigger>
            <TabsTrigger value="deployed">Desplegados</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="personnel">Personal</SelectItem>
            <SelectItem value="vehicle">Vehículo</SelectItem>
            <SelectItem value="equipment">Equipo</SelectItem>
            <SelectItem value="aircraft">Aeronave</SelectItem>
            <SelectItem value="boat">Embarcación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-5">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900">No se encontraron recursos</h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'Agrega recursos para comenzar'}
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = typeIcons[resource.type] || Package;
            const status = statusConfig[resource.status] || statusConfig.available;
            
            return (
              <Card key={resource.id} className="p-5 group hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 truncate">{resource.name}</h3>
                        <p className="text-sm text-slate-500">{resource.category || typeLabels[resource.type]}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(resource)}
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => deleteMutation.mutate(resource.id)}
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={status.color}>{status.label}</Badge>
                      {resource.quantity > 1 && (
                        <Badge variant="outline">x{resource.quantity}</Badge>
                      )}
                    </div>
                    {resource.assigned_to && (
                      <p className="text-xs text-slate-400 mt-2">
                        Asignado: {resource.assigned_to}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={resetForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre del Recurso *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Unidad de Bomberos #1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personnel">Personal</SelectItem>
                    <SelectItem value="vehicle">Vehículo</SelectItem>
                    <SelectItem value="equipment">Equipo</SelectItem>
                    <SelectItem value="aircraft">Aeronave</SelectItem>
                    <SelectItem value="boat">Embarcación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="deployed">Desplegado</SelectItem>
                    <SelectItem value="en_route">En Camino</SelectItem>
                    <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Bombero, Ambulancia"
                />
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asignar a Incidente</Label>
              <Select
                value={formData.incident_id}
                onValueChange={(value) => setFormData({ ...formData, incident_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar incidente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin asignar</SelectItem>
                  {incidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.incident_number} - {incident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingResource ? 'Guardar Cambios' : 'Crear Recurso'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}