import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  MapPin, 
  Filter,
  List,
  Map as MapIcon,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IncidentMap from '../components/maps/IncidentMap';
import IncidentCard from '../components/incidents/IncidentCard';

export default function IncidentMapPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 100),
  });

  const filteredIncidents = incidents.filter((incident) => {
    const hasCoordinates = incident.coordinates?.lat && incident.coordinates?.lng;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return hasCoordinates && matchesStatus && matchesSeverity;
  });

  const handleIncidentClick = (incident) => {
    navigate(createPageUrl(`IncidentDetail?id=${incident.id}`));
  };

  const activeCount = incidents.filter(i => i.status === 'active' && i.coordinates?.lat).length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'active' && i.coordinates?.lat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa de Incidentes</h1>
          <p className="text-slate-500 mt-1">Visualiza la ubicación de todos los incidentes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Mapa
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <List className="w-4 h-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {incidents.filter(i => i.coordinates?.lat).length}
              </p>
              <p className="text-sm text-slate-500">Con Ubicación</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{activeCount}</p>
              <p className="text-sm text-red-600">Activos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{criticalCount}</p>
              <p className="text-sm text-orange-600">Críticos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filtros:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="contained">Contenidos</TabsTrigger>
                <TabsTrigger value="resolved">Resueltos</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="low">Bajo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      ) : filteredIncidents.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900">No hay incidentes con ubicación</h3>
          <p className="text-slate-500 text-sm mt-1">
            Los incidentes deben tener coordenadas para aparecer en el mapa
          </p>
        </Card>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <IncidentMap
            incidents={filteredIncidents}
            onIncidentClick={handleIncidentClick}
            height="600px"
            showRadius={statusFilter === 'active'}
          />
          
          {/* Legend */}
          <Card className="p-4">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Leyenda</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-xs text-slate-600">Crítico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-xs text-slate-600">Alto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-xs text-slate-600">Medio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Bajo</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Haz clic en los marcadores para ver detalles del incidente
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}