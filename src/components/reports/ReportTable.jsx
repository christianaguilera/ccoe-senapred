import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileEdit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const typeLabels = {
  fire: 'Incendio',
  hazmat: 'HAZMAT',
  medical: 'Médico',
  rescue: 'Rescate',
  natural_disaster: 'Desastre Natural',
  civil_emergency: 'Emergencia Civil',
  other: 'Otro'
};

const statusLabels = {
  active: 'Activo',
  contained: 'Contenido',
  resolved: 'Resuelto',
  monitoring: 'Monitoreo'
};

const severityConfig = {
  low: { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-700' }
};

const statusConfig = {
  active: 'bg-red-100 text-red-700',
  contained: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  monitoring: 'bg-blue-100 text-blue-700'
};

export default function ReportTable({ incidents, onOpenSCI201 }) {
  if (incidents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500">No se encontraron incidentes con los filtros seleccionados</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Severidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {incidents.map((incident) => {
              const severity = severityConfig[incident.severity] || severityConfig.medium;
              
              return (
                <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-600">
                      #{incident.incident_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {incident.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {typeLabels[incident.type] || incident.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn("text-xs", statusConfig[incident.status])}>
                      {statusLabels[incident.status] || incident.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn("text-xs", severity.color)}>
                      {severity.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 line-clamp-1">
                      {incident.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {incident.start_time 
                        ? format(new Date(incident.start_time), 'dd MMM yyyy', { locale: es })
                        : 'N/A'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`IncidentDetail?id=${incident.id}`)}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      {onOpenSCI201 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onOpenSCI201(incident)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}