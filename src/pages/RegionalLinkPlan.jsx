import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Satellite,
  Pencil,
  Trash2,
  Building2,
  User,
  FolderPlus,
  Folder,
  Download
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';
import { toast } from 'sonner';

export default function RegionalLinkPlan() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [formData, setFormData] = useState({
    institucion: '',
    cargo: '',
    nombre: '',
    telefono_1: '',
    telefono_2: '',
    telefono_satelital: '',
    mail: '',
    nombre_subrogante: '',
    cargo_subrogante: '',
    telefono_1_subrogante: '',
    telefono_2_subrogante: '',
    mail_subrogante: '',
    group_id: '',
    notas: ''
  });
  const [groupFormData, setGroupFormData] = useState({
    nombre: '',
    descripcion: '',
    color: 'blue'
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['regional-contacts'],
    queryFn: () => base44.entities.RegionalContact.list()
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['contact-groups'],
    queryFn: () => base44.entities.ContactGroup.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RegionalContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['regional-contacts']);
      resetForm();
      toast.success('Contacto agregado exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RegionalContact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['regional-contacts']);
      resetForm();
      toast.success('Contacto actualizado exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RegionalContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['regional-contacts']);
      toast.success('Contacto eliminado');
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactGroup.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-groups']);
      resetGroupForm();
      toast.success('Grupo creado exitosamente');
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContactGroup.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-groups']);
      resetGroupForm();
      toast.success('Grupo actualizado');
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactGroup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-groups']);
      toast.success('Grupo eliminado');
    }
  });

  const resetForm = () => {
    setFormData({
      institucion: '',
      cargo: '',
      nombre: '',
      telefono_1: '',
      telefono_2: '',
      telefono_satelital: '',
      mail: '',
      nombre_subrogante: '',
      cargo_subrogante: '',
      telefono_1_subrogante: '',
      telefono_2_subrogante: '',
      mail_subrogante: '',
      group_id: '',
      notas: ''
    });
    setEditingContact(null);
    setShowForm(false);
  };

  const resetGroupForm = () => {
    setGroupFormData({
      nombre: '',
      descripcion: '',
      color: 'blue'
    });
    setEditingGroup(null);
    setShowGroupForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      institucion: contact.institucion || '',
      cargo: contact.cargo || '',
      nombre: contact.nombre || '',
      telefono_1: contact.telefono_1 || '',
      telefono_2: contact.telefono_2 || '',
      telefono_satelital: contact.telefono_satelital || '',
      mail: contact.mail || '',
      nombre_subrogante: contact.nombre_subrogante || '',
      cargo_subrogante: contact.cargo_subrogante || '',
      telefono_1_subrogante: contact.telefono_1_subrogante || '',
      telefono_2_subrogante: contact.telefono_2_subrogante || '',
      mail_subrogante: contact.mail_subrogante || '',
      group_id: contact.group_id || '',
      notas: contact.notas || ''
    });
    setShowForm(true);
  };

  const handleSubmitGroup = (e) => {
    e.preventDefault();
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data: groupFormData });
    } else {
      createGroupMutation.mutate(groupFormData);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      nombre: group.nombre || '',
      descripcion: group.descripcion || '',
      color: group.color || 'blue'
    });
    setShowGroupForm(true);
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm('¿Eliminar este grupo? Los contactos no se eliminarán.')) {
      deleteGroupMutation.mutate(id);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este contacto?')) {
      deleteMutation.mutate(id);
    }
  };

  const exportGroupToCSV = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const groupContacts = contacts.filter(c => c.group_id === groupId);
    
    if (groupContacts.length === 0) {
      toast.error('Este grupo no tiene contactos para exportar');
      return;
    }

    // CSV headers
    const headers = [
      'Institución',
      'Cargo',
      'Nombre',
      'Teléfono 1',
      'Teléfono 2',
      'Teléfono Satelital',
      'Email',
      'Nombre Subrogante',
      'Cargo Subrogante',
      'Teléfono 1 Subrogante',
      'Teléfono 2 Subrogante',
      'Email Subrogante',
      'Notas'
    ];

    // CSV rows
    const rows = groupContacts.map(contact => [
      contact.institucion || '',
      contact.cargo || '',
      contact.nombre || '',
      contact.telefono_1 || '',
      contact.telefono_2 || '',
      contact.telefono_satelital || '',
      contact.mail || '',
      contact.nombre_subrogante || '',
      contact.cargo_subrogante || '',
      contact.telefono_1_subrogante || '',
      contact.telefono_2_subrogante || '',
      contact.mail_subrogante || '',
      contact.notas || ''
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Grupo_${group?.nombre || 'Contactos'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Grupo exportado exitosamente');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.institucion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = selectedGroup === 'all' || 
      (selectedGroup === 'none' && !contact.group_id) ||
      contact.group_id === selectedGroup;
    
    return matchesSearch && matchesGroup;
  });

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.nombre || 'Sin grupo';
  };

  const getGroupColor = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.color || 'slate';
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500'
  };

  return (
    <div className={cn(
      "min-h-screen p-6",
      isDarkMode ? "bg-zinc-950" : "bg-slate-50"
    )}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              "text-3xl font-bold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              Plan de Enlace Regional
            </h1>
            <p className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-slate-400" : "text-slate-600"
            )}>
              Directorio de contactos institucionales
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowGroupForm(true)}
              variant="outline"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className={cn(
          "p-4",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, institución o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                <SelectItem value="none">Sin grupo</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Groups Management */}
        {groups.length > 0 && (
          <Card className={cn(
            "p-4",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
          )}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn(
                "text-sm font-semibold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                Grupos de Contactos
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <Badge 
                  key={group.id}
                  className={cn(
                    "px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity",
                    colorClasses[group.color] || 'bg-slate-500',
                    "text-white"
                  )}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {group.nombre}
                  <div className="ml-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportGroupToCSV(group.id);
                      }}
                      className="hover:bg-white/20 rounded p-0.5"
                      title="Descargar grupo"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(group);
                      }}
                      className="hover:bg-white/20 rounded p-0.5"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="hover:bg-white/20 rounded p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn(
            "p-4",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                  {contacts.length}
                </p>
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  Total Contactos
                </p>
              </div>
            </div>
          </Card>

          <Card className={cn(
            "p-4",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                  {new Set(contacts.map(c => c.institucion)).size}
                </p>
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  Instituciones
                </p>
              </div>
            </div>
          </Card>

          <Card className={cn(
            "p-4",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                  {filteredContacts.length}
                </p>
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  Resultados
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
              Cargando contactos...
            </p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className={cn(
            "p-12 text-center",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
          )}>
            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className={cn("font-medium mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
              No hay contactos
            </p>
            <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
              {searchTerm ? 'No se encontraron resultados' : 'Comience agregando un nuevo contacto'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className={cn(
                "p-6",
                isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white hover:bg-slate-50",
                "transition-colors"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-orange-500">{contact.institucion}</Badge>
                      {contact.group_id && (
                        <Badge className={cn(
                          "text-white",
                          colorClasses[getGroupColor(contact.group_id)]
                        )}>
                          <Folder className="w-3 h-3 mr-1" />
                          {getGroupName(contact.group_id)}
                        </Badge>
                      )}
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {contact.nombre}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      {contact.cargo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(contact)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(contact.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className={cn(isDarkMode ? "text-slate-300" : "text-slate-700")}>
                      {contact.telefono_1}
                    </span>
                  </div>

                  {contact.telefono_2 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span className={cn(isDarkMode ? "text-slate-300" : "text-slate-700")}>
                        {contact.telefono_2}
                      </span>
                    </div>
                  )}

                  {contact.telefono_satelital && (
                    <div className="flex items-center gap-2 text-sm">
                      <Satellite className="w-4 h-4 text-purple-500" />
                      <span className={cn(isDarkMode ? "text-slate-300" : "text-slate-700")}>
                        {contact.telefono_satelital}
                      </span>
                    </div>
                  )}

                  {contact.mail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <a 
                        href={`mailto:${contact.mail}`}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        {contact.mail}
                      </a>
                    </div>
                  )}

                  {(contact.nombre_subrogante || contact.cargo_subrogante) && (
                    <div className={cn(
                      "mt-3 pt-3 border-t",
                      isDarkMode ? "border-zinc-800" : "border-slate-200"
                    )}>
                      <p className={cn(
                        "text-xs font-semibold mb-2",
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      )}>
                        Subrogante
                      </p>
                      {contact.nombre_subrogante && (
                        <p className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-white" : "text-slate-900"
                        )}>
                          {contact.nombre_subrogante}
                        </p>
                      )}
                      {contact.cargo_subrogante && (
                        <p className={cn(
                          "text-xs mb-2",
                          isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}>
                          {contact.cargo_subrogante}
                        </p>
                      )}
                      {contact.telefono_1_subrogante && (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Phone className="w-3 h-3 text-blue-500" />
                          <span className={cn(isDarkMode ? "text-slate-300" : "text-slate-700")}>
                            {contact.telefono_1_subrogante}
                          </span>
                        </div>
                      )}
                      {contact.telefono_2_subrogante && (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Phone className="w-3 h-3 text-green-500" />
                          <span className={cn(isDarkMode ? "text-slate-300" : "text-slate-700")}>
                            {contact.telefono_2_subrogante}
                          </span>
                        </div>
                      )}
                      {contact.mail_subrogante && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-orange-500" />
                          <a 
                            href={`mailto:${contact.mail_subrogante}`}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            {contact.mail_subrogante}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {contact.notas && (
                    <div className={cn(
                      "mt-3 pt-3 border-t text-xs",
                      isDarkMode ? "border-zinc-800 text-slate-400" : "border-slate-200 text-slate-600"
                    )}>
                      {contact.notas}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Institución *</Label>
                <Input
                  value={formData.institucion}
                  onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                  required
                  placeholder="Ej: Bomberos de Chile"
                />
              </div>

              <div>
                <Label>Cargo *</Label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                  placeholder="Ej: Director Regional"
                />
              </div>

              <div>
                <Label>Nombre Completo *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Juan Pérez González"
                />
              </div>

              <div>
                <Label>Teléfono 1 *</Label>
                <Input
                  value={formData.telefono_1}
                  onChange={(e) => setFormData({ ...formData, telefono_1: e.target.value })}
                  required
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <Label>Teléfono 2</Label>
                <Input
                  value={formData.telefono_2}
                  onChange={(e) => setFormData({ ...formData, telefono_2: e.target.value })}
                  placeholder="+56 9 8765 4321"
                />
              </div>

              <div>
                <Label>Teléfono Satelital</Label>
                <Input
                  value={formData.telefono_satelital}
                  onChange={(e) => setFormData({ ...formData, telefono_satelital: e.target.value })}
                  placeholder="+870 XXX XXX XXX"
                />
              </div>

              <div>
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  value={formData.mail}
                  onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                  placeholder="ejemplo@dominio.cl"
                />
              </div>

              <div className="col-span-2">
                <Label>Grupo</Label>
                <Select value={formData.group_id} onValueChange={(value) => setFormData({ ...formData, group_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sin grupo</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subrogante Section */}
              <div className="col-span-2 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Información del Subrogante</h3>
              </div>

              <div>
                <Label>Nombre Subrogante</Label>
                <Input
                  value={formData.nombre_subrogante}
                  onChange={(e) => setFormData({ ...formData, nombre_subrogante: e.target.value })}
                  placeholder="Ej: María González"
                />
              </div>

              <div>
                <Label>Cargo Subrogante</Label>
                <Input
                  value={formData.cargo_subrogante}
                  onChange={(e) => setFormData({ ...formData, cargo_subrogante: e.target.value })}
                  placeholder="Ej: Subdirector"
                />
              </div>

              <div>
                <Label>Teléfono 1 Subrogante</Label>
                <Input
                  value={formData.telefono_1_subrogante}
                  onChange={(e) => setFormData({ ...formData, telefono_1_subrogante: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <Label>Teléfono 2 Subrogante</Label>
                <Input
                  value={formData.telefono_2_subrogante}
                  onChange={(e) => setFormData({ ...formData, telefono_2_subrogante: e.target.value })}
                  placeholder="+56 9 8765 4321"
                />
              </div>

              <div className="col-span-2">
                <Label>Correo Electrónico Subrogante</Label>
                <Input
                  type="email"
                  value={formData.mail_subrogante}
                  onChange={(e) => setFormData({ ...formData, mail_subrogante: e.target.value })}
                  placeholder="subrogante@dominio.cl"
                />
              </div>

              <div className="col-span-2 pt-4 border-t">
                <Label>Notas Adicionales</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Información adicional..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                {editingContact ? 'Actualizar' : 'Crear'} Contacto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Form Dialog */}
      <Dialog open={showGroupForm} onOpenChange={(open) => !open && resetGroupForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo de Contactos'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitGroup} className="space-y-4">
            <div>
              <Label>Nombre del Grupo *</Label>
              <Input
                value={groupFormData.nombre}
                onChange={(e) => setGroupFormData({ ...groupFormData, nombre: e.target.value })}
                required
                placeholder="Ej: Bomberos Región Los Lagos"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={groupFormData.descripcion}
                onChange={(e) => setGroupFormData({ ...groupFormData, descripcion: e.target.value })}
                placeholder="Descripción del grupo..."
                rows={3}
              />
            </div>

            <div>
              <Label>Color Identificador</Label>
              <Select value={groupFormData.color} onValueChange={(value) => setGroupFormData({ ...groupFormData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(colorClasses).map(color => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded", colorClasses[color])} />
                        <span className="capitalize">{color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetGroupForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                {editingGroup ? 'Actualizar' : 'Crear'} Grupo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}