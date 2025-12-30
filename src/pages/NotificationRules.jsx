import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Bell, Mail, MessageSquare, Users, Shield, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

const incidentTypes = [
  { value: 'fire', label: 'Incendio', icon: '🔥' },
  { value: 'hazmat', label: 'Mat. Peligrosos', icon: '☢️' },
  { value: 'medical', label: 'Médica', icon: '🏥' },
  { value: 'rescue', label: 'Rescate', icon: '⛑️' },
  { value: 'natural_disaster', label: 'Desastre Natural', icon: '🌊' },
  { value: 'civil_emergency', label: 'Emergencia Civil', icon: '🚨' },
  { value: 'other', label: 'Otro', icon: '❓' }
];

const severities = [
  { value: 'minor_emergency', label: 'Emergencia Menor', color: 'bg-green-100 text-green-700' },
  { value: 'major_emergency', label: 'Emergencia Mayor', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'disaster', label: 'Desastre', color: 'bg-orange-100 text-orange-700' },
  { value: 'catastrophe', label: 'Catástrofe', color: 'bg-red-100 text-red-700' }
];

const statuses = [
  { value: 'active', label: 'Activo' },
  { value: 'contained', label: 'Contenido' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'monitoring', label: 'Monitoreo' }
];

const commandRoles = [
  { value: 'incident_commander', label: 'Comandante del Incidente' },
  { value: 'operations_chief', label: 'Jefe de Operaciones' },
  { value: 'planning_chief', label: 'Jefe de Planificación' },
  { value: 'logistics_chief', label: 'Jefe de Logística' },
  { value: 'finance_chief', label: 'Jefe de Finanzas' },
  { value: 'safety_officer', label: 'Oficial de Seguridad' },
  { value: 'public_info_officer', label: 'Oficial de Información' },
  { value: 'liaison_officer', label: 'Oficial de Enlace' }
];

export default function NotificationRules() {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true,
    trigger_conditions: {
      incident_types: [],
      severities: [],
      statuses: []
    },
    notification_channels: ['internal'],
    recipients: {
      specific_users: [],
      roles: [],
      command_roles: []
    },
    message_template: '🚨 Nuevo incidente: {incident_name}\nTipo: {incident_type}\nSeveridad: {incident_severity}\nUbicación: {incident_location}'
  });
  const [newUserEmail, setNewUserEmail] = useState('');

  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['notification-rules'],
    queryFn: () => base44.entities.NotificationRule.list('-created_date')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NotificationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotificationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NotificationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.NotificationRule.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      active: true,
      trigger_conditions: {
        incident_types: [],
        severities: [],
        statuses: []
      },
      notification_channels: ['internal'],
      recipients: {
        specific_users: [],
        roles: [],
        command_roles: []
      },
      message_template: '🚨 Nuevo incidente: {incident_name}\nTipo: {incident_type}\nSeveridad: {incident_severity}\nUbicación: {incident_location}\nDescripción: {incident_description}'
    });
    setNewUserEmail('');
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      active: rule.active,
      trigger_conditions: rule.trigger_conditions || { incident_types: [], severities: [], statuses: [] },
      notification_channels: rule.notification_channels || ['internal'],
      recipients: rule.recipients || { specific_users: [], roles: [], command_roles: [] },
      message_template: rule.message_template || ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleCondition = (category, value) => {
    const current = formData.trigger_conditions[category] || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({
      ...formData,
      trigger_conditions: {
        ...formData.trigger_conditions,
        [category]: newValues
      }
    });
  };

  const toggleChannel = (channel) => {
    const current = formData.notification_channels || [];
    const newChannels = current.includes(channel)
      ? current.filter(c => c !== channel)
      : [...current, channel];
    setFormData({ ...formData, notification_channels: newChannels });
  };

  const toggleRecipient = (category, value) => {
    const current = formData.recipients[category] || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        [category]: newValues
      }
    });
  };

  const addUserEmail = () => {
    if (newUserEmail && !formData.recipients.specific_users.includes(newUserEmail)) {
      setFormData({
        ...formData,
        recipients: {
          ...formData.recipients,
          specific_users: [...formData.recipients.specific_users, newUserEmail]
        }
      });
      setNewUserEmail('');
    }
  };

  const removeUserEmail = (email) => {
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        specific_users: formData.recipients.specific_users.filter(e => e !== email)
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reglas de Notificación</h1>
          <p className="text-slate-500 mt-1">Configura notificaciones automáticas para incidentes</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Regla
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-slate-100" />)}
        </div>
      ) : rules.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay reglas configuradas</h3>
          <p className="text-slate-500 mb-4">Crea tu primera regla de notificación automática</p>
          <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Regla
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{rule.name}</h3>
                    <Switch
                      checked={rule.active}
                      onCheckedChange={(active) => toggleActiveMutation.mutate({ id: rule.id, active })}
                    />
                    <Badge variant={rule.active ? 'default' : 'secondary'}>
                      {rule.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(rule.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">CONDICIONES DE ACTIVACIÓN:</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.trigger_conditions?.incident_types?.map(type => {
                      const typeData = incidentTypes.find(t => t.value === type);
                      return (
                        <Badge key={type} variant="outline" className="text-xs">
                          {typeData?.icon} {typeData?.label}
                        </Badge>
                      );
                    })}
                    {rule.trigger_conditions?.severities?.map(sev => {
                      const sevData = severities.find(s => s.value === sev);
                      return <Badge key={sev} className={cn("text-xs", sevData?.color)}>{sevData?.label}</Badge>;
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">CANALES:</p>
                  <div className="flex gap-2">
                    {rule.notification_channels?.includes('email') && (
                      <Badge variant="outline"><Mail className="w-3 h-3 mr-1" />Email</Badge>
                    )}
                    {rule.notification_channels?.includes('internal') && (
                      <Badge variant="outline"><MessageSquare className="w-3 h-3 mr-1" />Interno</Badge>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-2">DESTINATARIOS:</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.recipients?.specific_users?.map(email => (
                      <Badge key={email} variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />{email}
                      </Badge>
                    ))}
                    {rule.recipients?.roles?.map(role => (
                      <Badge key={role} className="text-xs bg-blue-100 text-blue-700">
                        <Shield className="w-3 h-3 mr-1" />{role === 'admin' ? 'Administradores' : 'Usuarios'}
                      </Badge>
                    ))}
                    {rule.recipients?.command_roles?.map(role => {
                      const roleData = commandRoles.find(r => r.value === role);
                      return (
                        <Badge key={role} className="text-xs bg-purple-100 text-purple-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />{roleData?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar Regla' : 'Nueva Regla de Notificación'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Regla</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Notificar incendios críticos"
                />
              </div>
            </div>

            {/* Trigger Conditions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Condiciones de Activación</h3>
              
              <div className="space-y-2">
                <Label>Tipos de Incidente</Label>
                <div className="flex flex-wrap gap-2">
                  {incidentTypes.map(type => (
                    <Badge
                      key={type.value}
                      variant={formData.trigger_conditions.incident_types?.includes(type.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCondition('incident_types', type.value)}
                    >
                      {type.icon} {type.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niveles de Severidad</Label>
                <div className="flex flex-wrap gap-2">
                  {severities.map(sev => (
                    <Badge
                      key={sev.value}
                      className={cn(
                        "cursor-pointer",
                        formData.trigger_conditions.severities?.includes(sev.value) ? sev.color : 'bg-slate-100 text-slate-600'
                      )}
                      onClick={() => toggleCondition('severities', sev.value)}
                    >
                      {sev.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estados</Label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <Badge
                      key={status.value}
                      variant={formData.trigger_conditions.statuses?.includes(status.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCondition('statuses', status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Canales de Notificación</h3>
              <div className="flex gap-4">
                <Badge
                  variant={formData.notification_channels?.includes('internal') ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4"
                  onClick={() => toggleChannel('internal')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Notificación Interna
                </Badge>
                <Badge
                  variant={formData.notification_channels?.includes('email') ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4"
                  onClick={() => toggleChannel('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Badge>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Destinatarios</h3>

              <div className="space-y-2">
                <Label>Usuarios Específicos</Label>
                <div className="flex gap-2">
                  <Input
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    onKeyDown={(e) => e.key === 'Enter' && addUserEmail()}
                  />
                  <Button onClick={addUserEmail} type="button">Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.recipients.specific_users?.map(email => (
                    <Badge key={email} variant="secondary" className="cursor-pointer" onClick={() => removeUserEmail(email)}>
                      {email} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles de Usuario</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={formData.recipients.roles?.includes('admin') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRecipient('roles', 'admin')}
                  >
                    Administradores
                  </Badge>
                  <Badge
                    variant={formData.recipients.roles?.includes('user') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRecipient('roles', 'user')}
                  >
                    Usuarios
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles de Comando ICS</Label>
                <div className="flex flex-wrap gap-2">
                  {commandRoles.map(role => (
                    <Badge
                      key={role.value}
                      variant={formData.recipients.command_roles?.includes(role.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleRecipient('command_roles', role.value)}
                    >
                      {role.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Template */}
            <div className="space-y-2">
              <Label>Plantilla del Mensaje</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                rows={4}
                placeholder="Variables: {incident_name}, {incident_type}, {incident_severity}, {incident_location}, {incident_description}"
              />
              <p className="text-xs text-slate-500">
                Usa variables: {'{incident_name}'}, {'{incident_type}'}, {'{incident_severity}'}, {'{incident_location}'}, {'{incident_description}'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || formData.notification_channels.length === 0 || createMutation.isPending || updateMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {editingRule ? 'Actualizar' : 'Crear'} Regla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}