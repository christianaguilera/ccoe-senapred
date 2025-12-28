import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, X } from 'lucide-react';

export default function ReportFilters({ filters, onFilterChange, onReset }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900">Filtros</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm">Fecha Inicio</Label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Fecha Fin</Label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
          />
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Tipo de Incidente</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange({ ...filters, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
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

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="contained">Contenido</SelectItem>
              <SelectItem value="resolved">Resuelto</SelectItem>
              <SelectItem value="monitoring">Monitoreo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Severidad</Label>
          <Select
            value={filters.severity}
            onValueChange={(value) => onFilterChange({ ...filters, severity: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las severidades</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}