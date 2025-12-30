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
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Satellite,
  Pencil,
  Trash2,
  Building2,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';
import { toast } from 'sonner';

export default function RegionalLinkPlan() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    institucion: '',
    cargo: '',
    nombre: '',
    telefono_1: '',
    telefono_2: '',
    telefono_satelital: '',
    mail: '',
    notas: ''
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['regional-contacts'],
    queryFn: () => base44.entities.RegionalContact.list()
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

  const resetForm = () => {
    setFormData({
      institucion: '',
      cargo: '',
      nombre: '',
      telefono_1: '',
      telefono_2: '',
      telefono_satelital: '',
      mail: '',
      notas: ''
    });
    setEditingContact(null);
    setShowForm(false);
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
      notas: contact.notas || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este contacto?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.institucion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>

        {/* Search */}
        <Card className={cn(
          "p-4",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, institución o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

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
                    <Badge className="mb-2 bg-orange-500">{contact.institucion}</Badge>
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
    </div>
  );
}