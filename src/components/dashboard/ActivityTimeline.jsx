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

export default function ActivityTimeline({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 border-slate-200">
        <p className="text-center text-slate-500 text-sm">No hay actividades recientes</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-6">Actividad Reciente</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const priority = priorityConfig[activity.priority] || priorityConfig.info;
          
          return (
            <div key={activity.id || index} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn("w-3 h-3 rounded-full mt-1.5", priority.dot)} />
                {index !== activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={priority.color}>
                    {categoryConfig[activity.category] || 'General'}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {activity.timestamp 
                      ? format(new Date(activity.timestamp), "HH:mm", { locale: es })
                      : format(new Date(activity.created_date), "HH:mm", { locale: es })
                    }
                  </span>
                </div>
                <p className="text-sm text-slate-700">{activity.action}</p>
                {activity.reported_by && (
                  <p className="text-xs text-slate-400 mt-1">Por: {activity.reported_by}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}