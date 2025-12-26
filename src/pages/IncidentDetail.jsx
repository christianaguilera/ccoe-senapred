import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Edit2,
  Plus,
  Trash2,
  Send,
  Radio,
  Users,
  Flame,
  AlertTriangle,
  Heart,
  Anchor,
  Cloud,
  HelpCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import IncidentForm from '../components/incidents/IncidentForm';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';

const typeConfig = {
  fire: { icon: Flame, label: 'Incendio', color: 'bg-red-500' },
  hazmat: { icon: AlertTriangle, label: 'Materiales Peligrosos', color: 'bg-yellow-500' },
  medical: { icon: Heart, label: 'Emergencia Médica', color: 'bg-pink-500' },
  rescue: { icon: Anchor, label: 'Rescate', color: 'bg-blue-500' },
  natural_disaster: { icon: Cloud, label: 'Desastre Natural', color: 'bg-purple-500' },
  civil_emergency: { icon: Users, label: 'Emergencia Civil', color: 'bg-indigo-500' },
  other: { icon: HelpCircle, label: 'Otro', color: 'bg-slate-500' }
};

const severityConfig = {
  low: { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-700' }
};

const statusConfig = {
  active: { label: 'Activo', color: 'bg-red-500', text: 'text-red-700' },
  contained: { label: 'Contenido', color: 'bg-amber-500', text: 'text-amber-700' },
  resolved: { label: 'Resuelto', color: 'bg-emerald-500', text: 'text-emerald-700' },
  monitoring: { label: 'Monitoreo', color: 'bg-blue-500', text: 'text-blue-700' }
};

const roleLabels = {
  incident_commander: 'Comandante del Incidente',
  public_info_officer: 'Oficial de Información Pública',
  safety_officer: 'Oficial de Seguridad',
  liaison_officer: 'Oficial de Enlace',
  operations_chief: 'Jefe de Operaciones',
  planning_chief: 'Jefe de Planificación',
  logistics_chief: 'Jefe de Logística',
  finance_chief: 'Jefe de Finanzas/Admin'
};

export default function IncidentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id');

  const [showEditForm, setShowEditForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ action: '', category: 'general', priority: 'info' });
  const [newStaff, setNewStaff] = useState({ role: '', name: '', contact: '', radio_channel: '' });

  const queryClient = useQueryClient();

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      const incidents = await base44.entities.Incident.filter({ id: incidentId });
      return incidents[0];
    },
    enabled: !!incidentId,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', incidentId],
    queryFn: () => base44.entities.CommandStaff.filter({ incident_id: incidentId }),
    enabled: !!incidentId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', incidentId],
    queryFn: () => base44.entities.ActivityLog.filter({ incident_id: incidentId }, '-created_date', 20),
    enabled: !!incidentId,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', incidentId],
    queryFn: () => base44.entities.Resource.filter({ incident_id: incidentId }),
    enabled: !!incidentId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Incident.update(incidentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      setShowEditForm(false);
    },
  });

  const createLogMutation = useMutation({
    mutationFn: (data) => base44.entities.ActivityLog.create({
      ...data,
      incident_id: incidentId,
      timestamp: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', incidentId] });
      setNewLog({ action: '', category: 'general', priority: 'info' });
      setShowLogForm(false);
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (data) => base44.entities.CommandStaff.create({
      ...data,
      incident_id: incidentId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', incidentId] });
      setNewStaff({ role: '', name: '', contact: '', radio_channel: '' });
      setShowStaffForm(false);
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id) => base44.entities.CommandStaff.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', incidentId] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <Card className="p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Incidente no encontrado</h2>
        <p className="text-slate-500 mt-2">El incidente solicitado no existe</p>
        <Link to={createPageUrl('Incidents')}>
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Incidentes
          </Button>
        </Link>
      </Card>
    );
  }

  const type = typeConfig[incident.type] || typeConfig.other;
  const severity = severityConfig[incident.severity] || severityConfig.medium;
  const status = statusConfig[incident.status] || statusConfig.active;
  const TypeIcon = type.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Incidents')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-400">
                #{incident.incident_number || 'N/A'}
              </span>
              <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
              <span className={cn("text-sm font-medium", status.text)}>{status.label}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{incident.name}</h1>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowEditForm(true)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", type.color)}>
                <TypeIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={severity.color}>{severity.label}</Badge>
                  <Badge variant="secondary">{type.label}</Badge>
                </div>
                <p className="text-slate-600">{incident.description || 'Sin descripción'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Ubicación</p>
                  <p className="font-medium">{incident.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Inicio</p>
                  <p className="font-medium">
                    {incident.start_time 
                      ? format(new Date(incident.start_time), "dd MMM yyyy, HH:mm", { locale: es })
                      : 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Comandante</p>
                  <p className="font-medium">{incident.incident_commander || 'No asignado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Radio className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Recursos Asignados</p>
                  <p className="font-medium">{resources.length} recurso(s)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="staff" className="space-y-4">
            <TabsList className="bg-slate-100 w-full justify-start">
              <TabsTrigger value="staff">Personal de Comando</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="staff" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Estructura de Comando</h3>
                <Button size="sm" onClick={() => setShowStaffForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
              
              {staff.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay personal asignado</p>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {staff.map((member) => (
                    <Card key={member.id} className="p-4 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            {roleLabels[member.role] || member.role}
                          </p>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          {member.contact && (
                            <p className="text-sm text-slate-500 mt-1">{member.contact}</p>
                          )}
                          {member.radio_channel && (
                            <p className="text-xs text-slate-400 mt-1">
                              <Radio className="w-3 h-3 inline mr-1" />
                              Canal: {member.radio_channel}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                          onClick={() => deleteStaffMutation.mutate(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Recursos Asignados</h3>
                <Link to={createPageUrl(`Resources?incident=${incidentId}`)}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Gestionar
                  </Button>
                </Link>
              </div>

              {resources.length === 0 ? (
                <Card className="p-8 text-center">
                  <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay recursos asignados</p>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{resource.name}</p>
                          <p className="text-sm text-slate-500">{resource.category}</p>
                        </div>
                        <Badge variant={resource.status === 'deployed' ? 'default' : 'secondary'}>
                          {resource.status === 'deployed' ? 'Desplegado' : 
                           resource.status === 'available' ? 'Disponible' :
                           resource.status === 'en_route' ? 'En Camino' : 'Fuera de Servicio'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Activity */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Bitácora</h3>
            <Button size="sm" variant="outline" onClick={() => setShowLogForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Entrada
            </Button>
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Edit Incident Modal */}
      <IncidentForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={updateMutation.mutate}
        incident={incident}
        isLoading={updateMutation.isPending}
      />

      {/* Add Staff Modal */}
      <Dialog open={showStaffForm} onOpenChange={setShowStaffForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Personal de Comando</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <Select
                value={newStaff.role}
                onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contacto</label>
              <Input
                value={newStaff.contact}
                onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                placeholder="Teléfono o radio"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Canal de Radio</label>
              <Input
                value={newStaff.radio_channel}
                onChange={(e) => setNewStaff({ ...newStaff, radio_channel: e.target.value })}
                placeholder="Ej: Canal 5"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowStaffForm(false)}>Cancelar</Button>
              <Button 
                onClick={() => createStaffMutation.mutate(newStaff)}
                disabled={!newStaff.role || !newStaff.name || createStaffMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Log Entry Modal */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Entrada de Bitácora</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select
                  value={newLog.category}
                  onValueChange={(value) => setNewLog({ ...newLog, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="command">Comando</SelectItem>
                    <SelectItem value="operations">Operaciones</SelectItem>
                    <SelectItem value="planning">Planificación</SelectItem>
                    <SelectItem value="logistics">Logística</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridad</label>
                <Select
                  value={newLog.priority}
                  onValueChange={(value) => setNewLog({ ...newLog, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativo</SelectItem>
                    <SelectItem value="warning">Advertencia</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={newLog.action}
                onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                placeholder="Describa la acción o evento..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowLogForm(false)}>Cancelar</Button>
              <Button 
                onClick={() => createLogMutation.mutate(newLog)}
                disabled={!newLog.action || createLogMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}