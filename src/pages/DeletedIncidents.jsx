import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import IncidentCard from '../components/incidents/IncidentCard';

export default function DeletedIncidents() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: deletedIncidents = [], isLoading } = useQuery({
    queryKey: ['deleted-incidents'],
    queryFn: () => base44.entities.Incident.filter({ deleted: true }, '-updated_date', 100),
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => base44.entities.Incident.update(id, { deleted: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Incident.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-incidents'] });
    }
  });

  const handleRestore = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Restaurar este incidente?')) {
      restoreMutation.mutate(id);
    }
  };

  const handlePermanentDelete = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) {
      permanentDeleteMutation.mutate(id);
    }
  };

  const filteredIncidents = deletedIncidents.filter((incident) => {
    const matchesSearch = incident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.incident_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Archivo de Incidentes</h1>
          <p className="text-slate-500 mt-1">Repositorio de incidentes archivados</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar incidentes eliminados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
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
          <h3 className="font-semibold text-slate-900">No hay incidentes eliminados</h3>
          <p className="text-slate-500 text-sm mt-1">
            Los incidentes eliminados aparecerán aquí
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="relative group">
              <div className="opacity-75 hover:opacity-100 transition-opacity">
                <IncidentCard incident={incident} />
              </div>
              <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleRestore(e, incident.id)}
                  className="bg-white hover:bg-green-50 text-green-600 hover:text-green-700 border-green-200"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Restaurar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handlePermanentDelete(e, incident.id, incident.name)}
                  className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}