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
  Archive
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
    <Link to={createPageUrl(`IncidentDetail?id=${incident.id}`)} className="w-[70%]">
      <div className="group p-5 bg-slate-900 border-2 border-slate-800 hover:border-orange-500/50 rounded-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", type.color)}>
            <TypeIcon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-500 font-bold">
                #{incident.incident_number || 'N/A'}
              </span>
              <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
              <span className="text-xs text-slate-400 font-semibold">{status.label}</span>
            </div>
            
            <h3 className="font-bold text-white truncate group-hover:text-orange-400 transition-colors tracking-wide">
              {incident.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400 font-medium">
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
              <Badge className={cn("font-bold border-2", severity.color)}>
                {severity.label}
              </Badge>
              <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
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
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-orange-400 hover:bg-slate-800"
            >
              <Archive className="w-4 h-4" />
            </Button>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}