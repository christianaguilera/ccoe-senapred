import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Edit2,
  Trash2,
  AlertTriangle,
  Shield,
  Radio,
  FileText,
  DollarSign,
  ClipboardList,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import OrgChartCard from '../components/ics/OrgChartCard';
import StaffAssignmentForm from '../components/ics/StaffAssignmentForm';

const roleConfig = {
  incident_commander: { 
    title: 'Comandante del Incidente', 
    color: 'bg-orange-600',
    icon: Shield,
    description: 'Autoridad general sobre el incidente'
  },
  public_info_officer: { 
    title: 'Oficial de Información Pública', 
    color: 'bg-blue-600',
    icon: Info,
    description: 'Maneja información y medios'
  },
  safety_officer: { 
    title: 'Oficial de Seguridad', 
    color: 'bg-red-600',
    icon: AlertCircle,
    description: 'Supervisa seguridad de operaciones'
  },
  liaison_officer: { 
    title: 'Oficial de Enlace', 
    color: 'bg-purple-600',
    icon: Users,
    description: 'Coordina con agencias externas'
  },
  operations_chief: { 
    title: 'Jefe de Operaciones', 
    color: 'bg-emerald-600',
    icon: Radio,
    description: 'Dirige tácticas de respuesta'
  },
  planning_chief: { 
    title: 'Jefe de Planificación', 
    color: 'bg-cyan-600',
    icon: ClipboardList,
    description: 'Recopila información y planifica'
  },
  logistics_chief: { 
    title: 'Jefe de Logística', 
    color: 'bg-amber-600',
    icon: FileText,
    description: 'Provee recursos y servicios'
  },
  finance_chief: { 
    title: 'Jefe de Finanzas/Admin', 
    color: 'bg-indigo-600',
    icon: DollarSign,
    description: 'Maneja costos y contratos'
  }
};

export default function ICSStructure() {
  const [selectedIncident, setSelectedIncident] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const queryClient = useQueryClient();

  // Fetch active incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => base44.entities.Incident.filter({ status: 'active' }),
  });

  // Fetch staff for selected incident
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', selectedIncident],
    queryFn: () => base44.entities.CommandStaff.filter({ incident_id: selectedIncident }),
    enabled: !!selectedIncident,
  });

  // Get current incident details
  const currentIncident = incidents.find(i => i.id === selectedIncident);

  // Create/Update staff
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingMember) {
        return base44.entities.CommandStaff.update(editingMember.id, {
          ...data,
          incident_id: selectedIncident
        });
      } else {
        return base44.entities.CommandStaff.create({
          ...data,
          incident_id: selectedIncident
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedIncident] });
      setShowForm(false);
      setEditingMember(null);
      setSelectedRole('');
    },
  });

  // Delete staff
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CommandStaff.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', selectedIncident] });
    },
  });

  // Helper to get staff member by role
  const getStaffByRole = (role) => {
    return staff.find(m => m.role === role);
  };

  // Handle assignment
  const handleAssign = (role) => {
    const existing = getStaffByRole(role);
    if (existing) {
      setEditingMember(existing);
    } else {
      setEditingMember(null);
      setSelectedRole(role);
    }
    setShowForm(true);
  };

  // Auto-select first active incident
  React.useEffect(() => {
    if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0].id);
    }
  }, [incidents, selectedIncident]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estructura Organizacional ICS</h1>
          <p className="text-slate-500 mt-1">Sistema de Comando de Incidentes</p>
        </div>
      </div>

      {/* Incident Selector */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Seleccionar Incidente Activo
            </label>
            <Select value={selectedIncident} onValueChange={setSelectedIncident}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar incidente..." />
              </SelectTrigger>
              <SelectContent>
                {incidents.length === 0 ? (
                  <SelectItem value="none" disabled>No hay incidentes activos</SelectItem>
                ) : (
                  incidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.incident_number} - {incident.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {currentIncident && (
            <div className="flex gap-2">
              <Badge className="bg-red-100 text-red-700">
                {currentIncident.severity === 'critical' ? 'Crítico' :
                 currentIncident.severity === 'high' ? 'Alto' :
                 currentIncident.severity === 'medium' ? 'Medio' : 'Bajo'}
              </Badge>
              <Badge variant="outline">
                {currentIncident.type === 'fire' ? 'Incendio' :
                 currentIncident.type === 'hazmat' ? 'HAZMAT' :
                 currentIncident.type === 'medical' ? 'Médico' :
                 currentIncident.type === 'rescue' ? 'Rescate' : 'Otro'}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {!selectedIncident ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sin Incidente Seleccionado</AlertTitle>
          <AlertDescription>
            Selecciona un incidente activo para ver su estructura organizacional ICS.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incident Commander - Top Level */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Comando
                </h3>
              </div>
              <div 
                className="relative"
                onClick={() => handleAssign('incident_commander')}
              >
                <OrgChartCard
                  role="incident_commander"
                  title={roleConfig.incident_commander.title}
                  member={getStaffByRole('incident_commander')}
                  level={1}
                  color={roleConfig.incident_commander.color}
                  variant="commander"
                />
                {!getStaffByRole('incident_commander') && (
                  <Button 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                    variant="secondary"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Asignar
                  </Button>
                )}
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-8 bg-slate-300" />
          </div>

          {/* Command Staff - Second Level */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Staff de Comando
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {['public_info_officer', 'safety_officer', 'liaison_officer'].map((role) => {
                const config = roleConfig[role];
                const member = getStaffByRole(role);
                return (
                  <div 
                    key={role}
                    className="relative group"
                    onClick={() => handleAssign(role)}
                  >
                    <OrgChartCard
                      role={role}
                      title={config.title}
                      member={member}
                      level={2}
                      color={config.color}
                      variant="staff"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {member ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMember(member);
                              setShowForm(true);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(member.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Asignar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-300" />
            </div>
          </div>

          {/* General Staff - Sections */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Secciones Generales
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['operations_chief', 'planning_chief', 'logistics_chief', 'finance_chief'].map((role) => {
                const config = roleConfig[role];
                const member = getStaffByRole(role);
                const Icon = config.icon;
                
                return (
                  <Card 
                    key={role}
                    className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => handleAssign(role)}
                  >
                    <div className={`h-2 ${config.color}`} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                            {config.title}
                          </h4>
                        </div>
                      </div>

                      {member ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900">{member.name}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMember(member);
                                  setShowForm(true);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(member.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {member.contact && (
                            <p className="text-xs text-slate-500">{member.contact}</p>
                          )}
                          {member.radio_channel && (
                            <Badge variant="outline" className="text-xs">
                              <Radio className="w-3 h-3 mr-1" />
                              {member.radio_channel}
                            </Badge>
                          )}
                          <p className="text-xs text-slate-400 mt-2">{config.description}</p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 mb-3">Sin asignar</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Asignar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <Card className="p-4 bg-slate-50">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Leyenda ICS</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-600" />
                <span className="text-slate-600">Comando</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-600" />
                <span className="text-slate-600">Operaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-600" />
                <span className="text-slate-600">Planificación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-600" />
                <span className="text-slate-600">Logística</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Assignment Form */}
      <StaffAssignmentForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMember(null);
          setSelectedRole('');
        }}
        onSubmit={(data) => saveMutation.mutate(selectedRole ? { ...data, role: selectedRole } : data)}
        incident={currentIncident}
        member={editingMember}
        isLoading={saveMutation.isPending}
      />
    </div>
  );
}