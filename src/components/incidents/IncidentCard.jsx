import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  User, 
  ChevronRight,
  Flame,
  AlertTriangle,
  Heart,
  Anchor,
  Cloud,
  Users,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const typeConfig = {
  fire: { icon: Flame, label: 'Incendio', color: 'bg-red-500' },
  hazmat: { icon: AlertTriangle, label: 'Materiales Peligrosos', color: 'bg-yellow-500' },
  medical: { icon: Heart, label: 'Emergencia Médica', color: 'bg-pink-500' },
  rescue: { icon: Anchor, label: 'Rescate', color: 'bg-blue-500' },
  natural_disaster: { icon: Cloud, label: 'Desastre Natural', color: 'bg-purple-500' },
  civil_emergency: { icon: Users, label: 'Emergencia Civil', color: 'bg-indigo-500' },
  other: { icon: HelpCircle, label: 'Otro', color: 'bg-slate-500' }
};

const severityConfig = {
  low: { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-700 border-red-200' }
};

const statusConfig = {
  active: { label: 'Activo', color: 'bg-red-500' },
  contained: { label: 'Contenido', color: 'bg-amber-500' },
  resolved: { label: 'Resuelto', color: 'bg-emerald-500' },
  monitoring: { label: 'Monitoreo', color: 'bg-blue-500' }
};

export default function IncidentCard({ incident, onDelete }) {
  const type = typeConfig[incident.type] || typeConfig.other;
  const severity = severityConfig[incident.severity] || severityConfig.medium;
  const status = statusConfig[incident.status] || statusConfig.active;
  const TypeIcon = type.icon;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm(`¿Estás seguro de eliminar el incidente "${incident.name}"?`)) {
      onDelete(incident.id);
    }
  };

  return (
    <Link to={createPageUrl(`IncidentDetail?id=${incident.id}`)}>
      <Card className="group p-5 hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-slate-300 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", type.color)}>
            <TypeIcon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">
                #{incident.incident_number || 'N/A'}
              </span>
              <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
              <span className="text-xs text-slate-500">{status.label}</span>
            </div>
            
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
              {incident.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{incident.location}</span>
              </div>
              {incident.start_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(incident.start_time), 'dd MMM, HH:mm', { locale: es })}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={severity.color}>
                {severity.label}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {type.label}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  );
}