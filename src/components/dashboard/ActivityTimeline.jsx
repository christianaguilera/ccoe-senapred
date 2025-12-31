import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();
  
  if (!activities || activities.length === 0) {
    return (
      <div className={cn(
        "border-2 rounded-lg p-6",
        isDarkMode 
          ? "bg-slate-900 border-slate-800" 
          : "bg-white border-slate-200"
      )}>
        <p className={cn(
          "text-center text-sm",
          isDarkMode ? "text-slate-400" : "text-slate-600"
        )}>No hay actividades recientes</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-2 rounded-lg p-6",
      isDarkMode 
        ? "bg-slate-900 border-slate-800" 
        : "bg-white border-slate-200"
    )}>
      <h3 className={cn(
        "font-bold mb-6 tracking-wide",
        isDarkMode ? "text-white" : "text-slate-900"
      )}>ACTIVIDAD DEL INCIDENTE</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const priority = priorityConfig[activity.priority] || priorityConfig.info;
          
          return (
            <div key={activity.id || index} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn("w-3 h-3 rounded-full mt-1.5 shadow-lg", priority.dot)} />
                {index !== activities.length - 1 && (
                  <div className={cn(
                    "w-0.5 flex-1 mt-2",
                    isDarkMode ? "bg-slate-700" : "bg-slate-300"
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={cn("font-bold", priority.color)}>
                    {categoryConfig[activity.category] || 'General'}
                  </Badge>
                  <span className={cn(
                    "text-xs font-mono",
                    isDarkMode ? "text-slate-500" : "text-slate-600"
                  )}>
                    {activity.timestamp 
                      ? format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })
                      : format(new Date(activity.created_date), "dd/MM/yyyy HH:mm", { locale: es })
                    }
                  </span>
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                )}>{activity.action}</p>
                {(() => {
                  const incident = incidents.find(inc => inc.id === activity.incident_id);
                  return incident && (
                    <div className={cn(
                      "text-xs mt-2 space-y-0.5 font-medium",
                      isDarkMode ? "text-slate-500" : "text-slate-600"
                    )}>
                      {incident.region && <p>📍 Región: {incident.region}</p>}
                      {incident.comuna && <p>🏘️ Comuna: {incident.comuna}</p>}
                    </div>
                  );
                })()}
                {activity.reported_by && (
                  <p className={cn(
                    "text-xs mt-1",
                    isDarkMode ? "text-slate-500" : "text-slate-600"
                  )}>Por: {activity.reported_by}</p>
                )}
                </div>
                </div>
                );
                })}
                </div>
                </div>
  );
}