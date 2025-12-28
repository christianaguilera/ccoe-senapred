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
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-white">
          {/* Organigrama Visual */}
          <div className="space-y-8">
            
            {/* Nivel 1 - Comandante del Incidente */}
            <div className="flex flex-col items-center">
              <div className="relative w-80">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => handleAssign('incident_commander')}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative bg-white rounded-xl border-2 border-orange-500 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Comando</p>
                        <h3 className="font-bold text-slate-900 text-lg">Comandante del Incidente</h3>
                        {getStaffByRole('incident_commander') ? (
                          <div className="mt-1">
                            <p className="font-semibold text-slate-700">{getStaffByRole('incident_commander').name}</p>
                            {getStaffByRole('incident_commander').contact && (
                              <p className="text-xs text-slate-500">{getStaffByRole('incident_commander').contact}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic mt-1">Sin asignar</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Líneas verticales hacia Staff de Comando */}
              <div className="w-0.5 h-8 bg-slate-300" />
              <div className="w-px h-4 bg-slate-300" />
            </div>

            {/* Nivel 2 - Staff de Comando */}
            <div className="relative">
              {/* Línea horizontal superior */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-slate-300" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
              {['public_info_officer', 'safety_officer', 'liaison_officer'].map((role, idx) => {
                const config = roleConfig[role];
                const member = getStaffByRole(role);
                const Icon = config.icon;
                return (
                  <div key={role} className="relative">
                    {/* Línea vertical hacia arriba */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-300 -mt-8" />
                    
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => handleAssign(role)}
                    >
                      <div className="bg-white rounded-lg border-2 border-slate-200 p-4 hover:border-slate-400 hover:shadow-lg transition-all">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Staff</p>
                            <h4 className="font-semibold text-sm text-slate-900 leading-tight mb-1">
                              {config.title}
                            </h4>
                            {member ? (
                              <div>
                                <p className="text-sm font-medium text-slate-700">{member.name}</p>
                                {member.contact && (
                                  <p className="text-xs text-slate-500">{member.contact}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Sin asignar</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Línea vertical hacia Secciones Generales */}
            <div className="flex flex-col items-center py-6">
              <div className="w-px h-12 bg-slate-300" />
              <div className="w-20 h-px bg-slate-300" />
              <div className="w-px h-12 bg-slate-300" />
            </div>

            {/* Nivel 3 - Secciones Generales */}
            <div className="relative">
              {/* Línea horizontal superior */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-11/12 h-px bg-slate-300" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {['operations_chief', 'planning_chief', 'logistics_chief', 'finance_chief'].map((role) => {
                const config = roleConfig[role];
                const member = getStaffByRole(role);
                const Icon = config.icon;
                
                return (
                  <div key={role} className="relative">
                    {/* Línea vertical hacia arriba */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-300 -mt-8" />
                    
                    <div 
                      className="group cursor-pointer"
                      onClick={() => handleAssign(role)}
                    >
                      <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden hover:border-slate-400 hover:shadow-xl transition-all">
                        <div className={`h-3 ${config.color}`} />
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-500 uppercase">Sección</p>
                              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                {config.title}
                              </h4>
                            </div>
                          </div>

                          {member ? (
                            <div className="space-y-1 border-t pt-3">
                              <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                              {member.contact && (
                                <p className="text-xs text-slate-500">📞 {member.contact}</p>
                              )}
                              {member.radio_channel && (
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <Radio className="w-3 h-3" />
                                  {member.radio_channel}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-3 border-t">
                              <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                              <p className="text-xs text-slate-400 italic">Sin asignar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Nota informativa */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 italic">
                Haz clic en cualquier posición para asignar o editar personal
              </p>
            </div>
          </div>
        </Card>
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