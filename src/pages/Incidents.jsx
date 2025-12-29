import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IncidentCard from '../components/incidents/IncidentCard';
import IncidentForm from '../components/incidents/IncidentForm';
import { processIncidentNotifications } from '../components/notifications/NotificationEngine';

export default function Incidents() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: allIncidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 100),
  });

  // Filter out deleted incidents
  const incidents = allIncidents.filter(i => !i.deleted);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Incident.update(id, { deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const newIncident = await base44.entities.Incident.create(data);
      
      // Procesar reglas de notificación automáticas
      await processIncidentNotifications(newIncident, 'created');
      
      return newIncident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowForm(false);
    },
  });

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.incident_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = incidents.filter(i => i.status === 'active').length;
  const containedCount = incidents.filter(i => i.status === 'contained').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incidentes</h1>
          <p className="text-slate-500 mt-1">Gestiona todos los incidentes del sistema</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Incidente
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              Todos ({incidents.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white">
              Activos ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="contained" className="data-[state=active]:bg-white">
              Contenidos ({containedCount})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white">
              Resueltos ({resolvedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, ubicación o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
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

      {/* Incidents List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-5">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900">No se encontraron incidentes</h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea un nuevo incidente para comenzar'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <Button 
              className="mt-4 bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Incidente
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <IncidentCard 
              key={incident.id} 
              incident={incident}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <IncidentForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={createMutation.mutate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}