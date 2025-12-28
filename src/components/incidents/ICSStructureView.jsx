import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Info, AlertCircle, Users, Radio, ClipboardList, FileText, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";

const roleConfig = {
  incident_commander: { 
    title: 'Comandante del Incidente', 
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500',
    icon: Shield,
    level: 1
  },
  public_info_officer: { 
    title: 'Oficial de Información Pública', 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    icon: Info,
    level: 2
  },
  safety_officer: { 
    title: 'Oficial de Seguridad', 
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500',
    icon: AlertCircle,
    level: 2
  },
  liaison_officer: { 
    title: 'Oficial de Enlace', 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    icon: Users,
    level: 2
  },
  operations_chief: { 
    title: 'Jefe de Operaciones', 
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-600',
    icon: Radio,
    level: 3
  },
  planning_chief: { 
    title: 'Jefe de Planificación', 
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-600',
    icon: ClipboardList,
    level: 3
  },
  logistics_chief: { 
    title: 'Jefe de Logística', 
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-600',
    icon: FileText,
    level: 3
  },
  finance_chief: { 
    title: 'Jefe de Finanzas/Admin', 
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-600',
    icon: DollarSign,
    level: 3
  }
};

export default function ICSStructureView({ staff = [] }) {
  const getStaffByRole = (role) => staff.find(m => m.role === role);

  const commanderStaff = ['public_info_officer', 'safety_officer', 'liaison_officer'];
  const generalStaff = ['operations_chief', 'planning_chief', 'logistics_chief', 'finance_chief'];

  const renderPosition = (role, config) => {
    const member = getStaffByRole(role);
    const Icon = config.icon;

    return (
      <div className="relative group">
        <div className={cn(
          "bg-white rounded-lg border-2 p-3 transition-all",
          member ? "border-slate-200 hover:border-slate-400 hover:shadow-lg" : "border-dashed border-slate-200"
        )}>
          <div className="flex items-start gap-2">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              config.bgColor
            )}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
                {config.level === 1 ? 'Comando' : config.level === 2 ? 'Staff' : 'Sección'}
              </p>
              <h4 className="font-semibold text-xs text-slate-900 leading-tight">
                {config.title}
              </h4>
              {member ? (
                <div className="mt-1">
                  <p className="text-xs font-medium text-slate-700 truncate">{member.name}</p>
                  {member.radio_channel && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Radio className="w-2.5 h-2.5" />
                      {member.radio_channel}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Sin asignar</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-orange-600" />
        Estructura ICS del Incidente
      </h3>

      <div className="space-y-6">
        {/* Nivel 1 - Comandante */}
        <div className="flex flex-col items-center">
          <div className="w-64">
            {renderPosition('incident_commander', roleConfig.incident_commander)}
          </div>
          <div className="w-px h-6 bg-slate-300" />
        </div>

        {/* Nivel 2 - Staff de Comando */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-slate-300" />
          <div className="grid grid-cols-3 gap-3 pt-6">
            {commanderStaff.map((role) => (
              <div key={role} className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-300 -mt-6" />
                {renderPosition(role, roleConfig[role])}
              </div>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div className="flex flex-col items-center py-2">
          <div className="w-px h-6 bg-slate-300" />
        </div>

        {/* Nivel 3 - Secciones Generales */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-11/12 h-px bg-slate-300" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
            {generalStaff.map((role) => (
              <div key={role} className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-300 -mt-6" />
                {renderPosition(role, roleConfig[role])}
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        {staff.length === 0 && (
          <div className="text-center py-4 border-t">
            <p className="text-sm text-slate-400 italic">
              No hay personal asignado a este incidente
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}