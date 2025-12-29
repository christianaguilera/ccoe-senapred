import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const priorityConfig = {
  info: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  warning: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  critical: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
};

const categoryConfig = {
  command: 'Comando',
  operations: 'Operaciones',
  planning: 'Planificación',
  logistics: 'Logística',
  finance: 'Finanzas',
  general: 'General'
};

export default function ActivityTimeline({ activities, incidents = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-900 border-2 border-slate-800 rounded-lg p-6">
        <p className="text-center text-slate-400 text-sm">No hay actividades recientes</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-lg p-6">
      <h3 className="font-bold text-white mb-6 tracking-wide">ACTIVIDAD RECIENTE REGIONAL</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const priority = priorityConfig[activity.priority] || priorityConfig.info;
          
          return (
            <div key={activity.id || index} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn("w-3 h-3 rounded-full mt-1.5 shadow-lg", priority.dot)} />
                {index !== activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-700 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={cn("font-bold", priority.color)}>
                    {categoryConfig[activity.category] || 'General'}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">
                    {activity.timestamp 
                      ? format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })
                      : format(new Date(activity.created_date), "dd/MM/yyyy HH:mm", { locale: es })
                    }
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{activity.action}</p>
                {(() => {
                  const incident = incidents.find(inc => inc.id === activity.incident_id);
                  return incident && (
                    <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-medium">
                      {incident.region && <p>📍 Región: {incident.region}</p>}
                      {incident.comuna && <p>🏘️ Comuna: {incident.comuna}</p>}
                    </div>
                  );
                })()}
                {activity.reported_by && (
                  <p className="text-xs text-slate-500 mt-1">Por: {activity.reported_by}</p>
                )}
                </div>
                </div>
                );
                })}
                </div>
                </div>
  );
}