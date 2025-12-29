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
  HelpCircle,
  FileText,
  Building2 } from
'lucide-react';
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
  SelectValue } from
"@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import IncidentForm from '../components/incidents/IncidentForm';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import IncidentMap from '../components/maps/IncidentMap';
import ICSStructureView from '../components/incidents/ICSStructureView';
import { processIncidentNotifications } from '../components/notifications/NotificationEngine';
import FormSCI201 from '../components/reports/FormSCI201';
import FormSCI202 from '../components/reports/FormSCI202';
import FormSCI203 from '../components/reports/FormSCI203';
import FormSCI204 from '../components/reports/FormSCI204';
import FormSCI205 from '../components/reports/FormSCI205';
import FormSCI206 from '../components/reports/FormSCI206';
import FormSCI207 from '../components/reports/FormSCI207';
import FormSCI211 from '../components/reports/FormSCI211';
import FormSCI214 from '../components/reports/FormSCI214';
import FormSCI215A from '../components/reports/FormSCI215A';
import FormSCI221 from '../components/reports/FormSCI221';
import FormSCI222 from '../components/reports/FormSCI222';
import GeneralIncidentReport from '../components/reports/GeneralIncidentReport';
import OperationsBoard from '../components/operations/OperationsBoard';
import SituationRoomAlert from '../components/alerts/SituationRoomAlert';
import { useTheme } from '../components/contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id');

  const [showEditForm, setShowEditForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showSCI201, setShowSCI201] = useState(false);
  const [showSCI202, setShowSCI202] = useState(false);
  const [showSCI203, setShowSCI203] = useState(false);
  const [showSCI204, setShowSCI204] = useState(false);
  const [showSCI205, setShowSCI205] = useState(false);
  const [showSCI206, setShowSCI206] = useState(false);
  const [showSCI207, setShowSCI207] = useState(false);
  const [showSCI211, setShowSCI211] = useState(false);
  const [showSCI214, setShowSCI214] = useState(false);
  const [showSCI215A, setShowSCI215A] = useState(false);
  const [showSCI221, setShowSCI221] = useState(false);
  const [showSCI222, setShowSCI222] = useState(false);
  const [showGeneralReport, setShowGeneralReport] = useState(false);
  const [showInstitutions, setShowInstitutions] = useState(false);
  const [showOperationsBoard, setShowOperationsBoard] = useState(false);
  const [newLog, setNewLog] = useState({ action: '', category: 'general', priority: 'info' });
  const [newStaff, setNewStaff] = useState({ role: '', name: '', contact: '', radio_channel: '' });
  const [newInstitution, setNewInstitution] = useState({ nombre: 'Bomberos', contact_person: '', phone: '', units_deployed: 1, detalle_recursos: '' });

  // Check if any modal/dialog is open
  const isAnyModalOpen = showEditForm || showStaffForm || showLogForm || showSCI201 ||
  showSCI202 || showSCI203 || showSCI204 || showSCI205 || showSCI206 ||
  showSCI207 || showSCI211 || showSCI214 || showSCI215A || showSCI221 || showSCI222 || showGeneralReport || showInstitutions || showOperationsBoard;

  const queryClient = useQueryClient();

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      const incidents = await base44.entities.Incident.filter({ id: incidentId });
      return incidents[0];
    },
    enabled: !!incidentId
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', incidentId],
    queryFn: () => base44.entities.CommandStaff.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', incidentId],
    queryFn: () => base44.entities.ActivityLog.filter({ incident_id: incidentId }, '-created_date', 20),
    enabled: !!incidentId
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', incidentId],
    queryFn: () => base44.entities.Resource.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions', incidentId],
    queryFn: () => base44.entities.Institution.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const updated = await base44.entities.Incident.update(incidentId, data);

      // Determinar tipo de acción para notificaciones
      const action = data.status && data.status !== incident.status ? 'status_changed' : 'updated';

      // Procesar reglas de notificación automáticas
      await processIncidentNotifications({ ...incident, ...data, id: incidentId }, action);

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowEditForm(false);
    }
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
    }
  });

  const createStaffMutation = useMutation({
    mutationFn: (data) => base44.entities.CommandStaff.create({
      ...data,
      incident_id: incidentId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', incidentId] });
      setNewStaff({ role: '', name: '', contact: '', radio_channel: '' });
      setShowStaffForm(false);
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id) => base44.entities.CommandStaff.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', incidentId] });
    }
  });

  const createInstitutionMutation = useMutation({
    mutationFn: (data) => base44.entities.Institution.create({
      ...data,
      incident_id: incidentId,
      arrival_time: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions', incidentId] });
      setNewInstitution({ nombre: 'Bomberos', contact_person: '', phone: '', units_deployed: 1, detalle_recursos: '' });
      setShowInstitutions(false);
    }
  });

  const deleteInstitutionMutation = useMutation({
    mutationFn: (id) => base44.entities.Institution.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions', incidentId] });
    }
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
      </div>);

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
      </Card>);

  }

  const type = typeConfig[incident.type] || typeConfig.other;
  const severity = severityConfig[incident.severity] || severityConfig.medium;
  const status = statusConfig[incident.status] || statusConfig.active;
  const TypeIcon = type.icon;

  return (
    <div className="space-y-6">
      {/* Situation Room Alert */}
      {incident.severity === 'critical' && incident.status === 'active' &&
      <SituationRoomAlert
        severity={incident.severity}
        title="ALERTA DE INCIDENTE CRÍTICO"
        message={`${incident.name} - ${incident.location}`}
        details={[
        { label: 'Tipo', value: typeConfig[incident.type]?.label || incident.type },
        { label: 'Estado', value: statusConfig[incident.status]?.label || incident.status },
        { label: 'Recursos', value: resources.length },
        { label: 'Personal', value: staff.length },
        { label: 'Instituciones', value: institutions.length }]
        } />

      }

      {incident.severity === 'high' && incident.status === 'active' &&
      <SituationRoomAlert
        severity={incident.severity}
        title="INCIDENTE DE ALTA PRIORIDAD"
        message={`${incident.name} - Requiere atención`}
        details={[
        { label: 'Ubicación', value: incident.location },
        { label: 'Recursos', value: resources.length },
        { label: 'Personal', value: staff.length }]
        } />

      }

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Link to={createPageUrl('Incidents')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-slate-400">
                #{incident.incident_number || 'N/A'}
              </span>
              <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
              <span className={cn("text-sm font-medium", status.text)}>{status.label}</span>
            </div>
            <div className="relative">
              <h1 className={cn(
                "text-2xl font-bold pr-48",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{incident.name}</h1>
              <div className="absolute top-0 right-0">
                <Select
                  value={incident.status}
                  onValueChange={(value) => updateMutation.mutate({ status: value })}>

                  <SelectTrigger className="w-auto min-w-[160px] h-10 border-2 border-orange-500 bg-orange-50 hover:bg-orange-100 font-semibold shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🔴 Activo</SelectItem>
                    <SelectItem value="contained">🟡 Contenido</SelectItem>
                    <SelectItem value="monitoring">🔵 Monitoreo</SelectItem>
                    <SelectItem value="resolved">🟢 Resuelto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => setShowOperationsBoard(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Tablero Operaciones
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => setShowGeneralReport(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Reporte General
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          {!isAnyModalOpen && incident.coordinates?.lat && incident.coordinates?.lng &&
          <IncidentMap
            incidents={[incident]}
            selectedIncident={incident}
            height="400px"
            showRadius={true} />
          }

          {/* Info Card */}
          <Card className={cn(
            "p-6",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
          )}>
            <div className="flex items-start gap-4 mb-6">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", type.color)}>
                <TypeIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={severity.color}>{severity.label}</Badge>
                  <Badge variant="secondary">{type.label}</Badge>
                </div>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                )}>{incident.description || 'Sin descripción'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className={cn(
                "flex items-center gap-3",
                isDarkMode ? "text-slate-300" : "text-slate-600"
              )}>
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Ubicación</p>
                  <p className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{incident.location}</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3",
                isDarkMode ? "text-slate-300" : "text-slate-600"
              )}>
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Inicio</p>
                  <p className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>
                    {incident.start_time ?
                    format(new Date(incident.start_time), "dd MMM yyyy, HH:mm", { locale: es }) :
                    'No especificado'}
                  </p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3",
                isDarkMode ? "text-slate-300" : "text-slate-600"
              )}>
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Comandante</p>
                  <p className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{incident.incident_commander || 'No asignado'}</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3",
                isDarkMode ? "text-slate-300" : "text-slate-600"
              )}>
                <Radio className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Recursos Asignados</p>
                  <p className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{resources.length} recurso(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Instituciones Presentes ({institutions.length})</p>
                  {institutions.length > 0 ?
                  <div className="flex flex-wrap gap-1">
                      {institutions.map((inst) =>
                    <span key={inst.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          {inst.nombre}
                        </span>
                    )}
                    </div> :

                  <p className="font-medium text-slate-500">Ninguna</p>
                  }
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t mt-4">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowInstitutions(true)}>
                <Building2 className="w-4 h-4 mr-2" />
                Gestionar Instituciones Presentes
              </Button>
            </div>
          </Card>

          {/* ICS Structure View */}
          <ICSStructureView staff={staff} />

          {/* Tabs */}
          <Tabs defaultValue="staff" className="space-y-4">
            <TabsList className={cn(
              "w-full justify-start",
              isDarkMode ? "bg-slate-800" : "bg-slate-100"
            )}>
              <TabsTrigger value="staff">Personal de Comando</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="staff" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={cn(
                  "font-semibold",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>Estructura de Comando</h3>
                <Button size="sm" onClick={() => setShowStaffForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
              
              {staff.length === 0 ?
              <Card className="p-8 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay personal asignado</p>
                </Card> :

              <div className="grid sm:grid-cols-2 gap-3">
                  {staff.map((member) =>
                <Card key={member.id} className="p-4 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            {roleLabels[member.role] || member.role}
                          </p>
                          <p className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>{member.name}</p>
                          {member.contact &&
                      <p className="text-sm text-slate-500 mt-1">{member.contact}</p>
                      }
                          {member.radio_channel &&
                      <p className="text-xs text-slate-400 mt-1">
                              <Radio className="w-3 h-3 inline mr-1" />
                              Canal: {member.radio_channel}
                            </p>
                      }
                        </div>
                        <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                      onClick={() => deleteStaffMutation.mutate(member.id)}>

                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                )}
                </div>
              }
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={cn(
                  "font-semibold",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>Recursos Asignados</h3>
                <Link to={createPageUrl(`Resources?incident=${incidentId}`)}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Gestionar
                  </Button>
                </Link>
              </div>

              {resources.length === 0 ?
              <Card className="p-8 text-center">
                  <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay recursos asignados</p>
                </Card> :

              <div className="grid sm:grid-cols-2 gap-3">
                  {resources.map((resource) =>
                <Card key={resource.id} className={cn(
                  "p-4",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
                )}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>{resource.name}</p>
                          <p className="text-sm text-slate-500">{resource.category}</p>
                        </div>
                        <Badge variant={resource.status === 'deployed' ? 'default' : 'secondary'}>
                          {resource.status === 'deployed' ? 'Desplegado' :
                      resource.status === 'available' ? 'Disponible' :
                      resource.status === 'en_route' ? 'En Camino' : 'Fuera de Servicio'}
                        </Badge>
                      </div>
                    </Card>
                )}
                </div>
              }
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Activity */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className={cn(
              "font-semibold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Bitácora</h3>
            <Button size="sm" variant="outline" onClick={() => setShowLogForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Entrada
            </Button>
          </div>
          <ActivityTimeline activities={activities} incidents={[incident]} />

          <div className="space-y-2 mt-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowSCI201(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-201-Resumen del Incidente
            </Button>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowSCI202(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-202-Plan de Acción del Incidente
            </Button>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowSCI203(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-203-Listado de Asignación
            </Button>
            <Button
              className="w-full bg-pink-600 hover:bg-pink-700"
              onClick={() => setShowSCI204(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-204-Asignaciones Tácticas
            </Button>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => setShowSCI205(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-205-Plan de Comunicaciones
            </Button>
            <Button
              className="w-full bg-rose-600 hover:bg-rose-700"
              onClick={() => setShowSCI206(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-206-Plan Médico
            </Button>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setShowSCI207(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-207-Registro de Víctimas
            </Button>
            <Button
              className="w-full bg-slate-600 hover:bg-slate-700"
              onClick={() => setShowSCI211(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-211-Registro y Control de Recursos
            </Button>
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => setShowSCI214(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-214-Registro de Actividades
            </Button>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowSCI215A(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-215A-Análisis de Seguridad
            </Button>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowSCI221(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-221-Verificación Desmovilización
            </Button>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowSCI222(true)}>
              <FileText className="w-4 h-4 mr-2" />
              SCI-222-Prioridades de Recursos
            </Button>
            </div>
        </div>
      </div>

      {/* Edit Incident Modal */}
      <IncidentForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={updateMutation.mutate}
        incident={incident}
        isLoading={updateMutation.isPending} />


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
                onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>

                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) =>
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Nombre completo" />

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contacto</label>
              <Input
                value={newStaff.contact}
                onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                placeholder="Teléfono o radio" />

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Canal de Radio</label>
              <Input
                value={newStaff.radio_channel}
                onChange={(e) => setNewStaff({ ...newStaff, radio_channel: e.target.value })}
                placeholder="Ej: Canal 5" />

            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowStaffForm(false)}>Cancelar</Button>
              <Button
                onClick={() => createStaffMutation.mutate(newStaff)}
                disabled={!newStaff.role || !newStaff.name || createStaffMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600">

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
                  onValueChange={(value) => setNewLog({ ...newLog, category: value })}>

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
                  onValueChange={(value) => setNewLog({ ...newLog, priority: value })}>

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
                rows={3} />

            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowLogForm(false)}>Cancelar</Button>
              <Button
                onClick={() => createLogMutation.mutate(newLog)}
                disabled={!newLog.action || createLogMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600">

                <Send className="w-4 h-4 mr-2" />
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario SCI-201 */}
      <FormSCI201
        open={showSCI201}
        onClose={() => setShowSCI201(false)}
        incident={incident} />

      {/* Formulario SCI-202 */}
      <FormSCI202
        open={showSCI202}
        onClose={() => setShowSCI202(false)}
        incident={incident} />

      {/* Formulario SCI-203 */}
      <FormSCI203
        open={showSCI203}
        onClose={() => setShowSCI203(false)}
        incident={incident} />

      {/* Formulario SCI-204 */}
      <FormSCI204
        open={showSCI204}
        onClose={() => setShowSCI204(false)}
        incident={incident} />

      {/* Formulario SCI-205 */}
      <FormSCI205
        open={showSCI205}
        onClose={() => setShowSCI205(false)}
        incident={incident} />

      {/* Formulario SCI-206 */}
      <FormSCI206
        open={showSCI206}
        onClose={() => setShowSCI206(false)}
        incident={incident} />

      {/* Formulario SCI-207 */}
      <FormSCI207
        open={showSCI207}
        onClose={() => setShowSCI207(false)}
        incident={incident} />

      {/* Formulario SCI-211 */}
      <FormSCI211
        open={showSCI211}
        onClose={() => setShowSCI211(false)}
        incident={incident} />

      {/* Formulario SCI-214 */}
      <FormSCI214
        open={showSCI214}
        onClose={() => setShowSCI214(false)}
        incident={incident} />

      {/* Formulario SCI-215A */}
      <FormSCI215A
        open={showSCI215A}
        onClose={() => setShowSCI215A(false)}
        incident={incident} />

      {/* Formulario SCI-221 */}
      <FormSCI221
        open={showSCI221}
        onClose={() => setShowSCI221(false)}
        incident={incident} />

      {/* Formulario SCI-222 */}
      <FormSCI222
        open={showSCI222}
        onClose={() => setShowSCI222(false)}
        incident={incident} />

      {/* Reporte General */}
      <GeneralIncidentReport
        open={showGeneralReport}
        onClose={() => setShowGeneralReport(false)}
        incident={incident}
        staff={staff}
        resources={resources}
        institutions={institutions}
        activities={activities} />


      {/* Tablero de Operaciones */}
      <OperationsBoard
        open={showOperationsBoard}
        onClose={() => setShowOperationsBoard(false)}
        incident={incident}
        staff={staff}
        resources={resources} />


      {/* Institutions Modal */}
      <Dialog open={showInstitutions} onOpenChange={setShowInstitutions}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Instituciones Presentes en el Incidente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Add Institution Form */}
            <Card className="p-4 bg-slate-50">
              <h4 className="font-semibold mb-4">Agregar Institución</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Institución</label>
                  <Select
                    value={newInstitution.nombre}
                    onValueChange={(value) => setNewInstitution({ ...newInstitution, nombre: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bomberos">Bomberos</SelectItem>
                      <SelectItem value="Carabineros">Carabineros</SelectItem>
                      <SelectItem value="Ambulancia/SAMU">Ambulancia/SAMU</SelectItem>
                      <SelectItem value="Ejército">Ejército</SelectItem>
                      <SelectItem value="SENAPRED">SENAPRED</SelectItem>
                      <SelectItem value="Cruz Roja">Cruz Roja</SelectItem>
                      <SelectItem value="Municipalidad">Municipalidad</SelectItem>
                      <SelectItem value="PDI">PDI</SelectItem>
                      <SelectItem value="Defensa Civil">Defensa Civil</SelectItem>
                      <SelectItem value="CONAF">CONAF</SelectItem>
                      <SelectItem value="MOP">MOP</SelectItem>
                      <SelectItem value="Armada de Chile">Armada de Chile</SelectItem>
                      <SelectItem value="FACH">FACH</SelectItem>
                      <SelectItem value="BRIFE Ejército">BRIFE Ejército</SelectItem>
                      <SelectItem value="PARME Ejército">PARME Ejército</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persona de Contacto</label>
                  <Input
                    value={newInstitution.contact_person}
                    onChange={(e) => setNewInstitution({ ...newInstitution, contact_person: e.target.value })}
                    placeholder="Nombre del contacto" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={newInstitution.phone}
                    onChange={(e) => setNewInstitution({ ...newInstitution, phone: e.target.value })}
                    placeholder="+56 9 1234 5678" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unidades Desplegadas</label>
                  <Input
                    type="number"
                    value={newInstitution.units_deployed}
                    onChange={(e) => setNewInstitution({ ...newInstitution, units_deployed: parseInt(e.target.value) || 1 })}
                    min="1" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Detalle de Recursos</label>
                <Textarea
                  value={newInstitution.detalle_recursos}
                  onChange={(e) => setNewInstitution({ ...newInstitution, detalle_recursos: e.target.value })}
                  placeholder="Ej: 3 carros bombas, 15 bomberos, 2 autobombas, equipos SCBA"
                  rows={2} />
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => createInstitutionMutation.mutate(newInstitution)}
                  disabled={!newInstitution.nombre || createInstitutionMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Institución
                </Button>
              </div>
            </Card>

            {/* Institutions List */}
            <div className="space-y-3">
              <h4 className={cn(
                "font-semibold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>Instituciones Registradas ({institutions.length})</h4>
              {institutions.length === 0 ?
              <Card className="p-8 text-center">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay instituciones registradas</p>
                </Card> :

              <div className="space-y-2">
                  {institutions.map((institution) =>
                <Card key={institution.id} className="p-4 group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900"
                            )}>{institution.nombre}</p>
                            {institution.units_deployed > 0 &&
                        <Badge variant="secondary">
                                {institution.units_deployed} unidad(es)
                              </Badge>
                        }
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                            {institution.contact_person &&
                        <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{institution.contact_person}</span>
                              </div>
                        }
                            {institution.phone &&
                        <div className="flex items-center gap-1">
                                <Radio className="w-3 h-3" />
                                <span>{institution.phone}</span>
                              </div>
                        }
                          </div>
                          {institution.detalle_recursos &&
                      <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                              <p className="text-xs font-medium text-slate-700 mb-1">Recursos:</p>
                              <p className="text-xs text-slate-600">{institution.detalle_recursos}</p>
                            </div>
                      }
                          {institution.arrival_time &&
                      <p className="text-xs text-slate-400 mt-2">
                              Llegada: {format(new Date(institution.arrival_time), "dd/MM/yyyy HH:mm", { locale: es })}
                            </p>
                      }
                        </div>
                        <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                      onClick={() => deleteInstitutionMutation.mutate(institution.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                )}
                </div>
              }
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowInstitutions(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>);

}