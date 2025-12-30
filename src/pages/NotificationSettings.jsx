import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  Cloud, 
  Activity, 
  Package,
  Save,
  CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingPrefs, isLoading } = useQuery({
    queryKey: ['notificationPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserNotificationPreferences.filter({
        user_email: user.email
      });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (existingPrefs) {
      setPreferences(existingPrefs);
    } else if (user && !isLoading) {
      // Set defaults
      setPreferences({
        user_email: user.email,
        critical_incidents: true,
        incident_updates: true,
        senapred_alerts: true,
        meteochile_alerts: true,
        seismic_alerts: true,
        resource_assignments: true,
        activity_updates: false
      });
    }
  }, [existingPrefs, user, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      if (existingPrefs?.id) {
        return await base44.entities.UserNotificationPreferences.update(existingPrefs.id, prefs);
      } else {
        return await base44.entities.UserNotificationPreferences.create(prefs);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferencias guardadas correctamente');
      setSaving(false);
    },
    onError: () => {
      toast.error('Error al guardar preferencias');
      setSaving(false);
    }
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    saveMutation.mutate(preferences);
  };

  const notificationTypes = [
    {
      key: 'critical_incidents',
      icon: AlertTriangle,
      label: 'Incidentes Críticos',
      description: 'Notificaciones cuando se crea o activa un incidente crítico o desastre',
      color: 'text-red-500'
    },
    {
      key: 'incident_updates',
      icon: Activity,
      label: 'Actualizaciones de Incidentes',
      description: 'Cambios de estado, severidad o información importante de incidentes',
      color: 'text-orange-500'
    },
    {
      key: 'senapred_alerts',
      icon: AlertTriangle,
      label: 'Alertas SENAPRED',
      description: 'Alertas y avisos del Sistema Nacional de Prevención y Respuesta ante Desastres',
      color: 'text-yellow-500'
    },
    {
      key: 'meteochile_alerts',
      icon: Cloud,
      label: 'Alertas Meteorológicas',
      description: 'Alertas de condiciones climáticas adversas de Meteochile',
      color: 'text-blue-500'
    },
    {
      key: 'seismic_alerts',
      icon: Activity,
      label: 'Alertas Sísmicas',
      description: 'Notificaciones sobre sismos de magnitud significativa',
      color: 'text-purple-500'
    },
    {
      key: 'resource_assignments',
      icon: Package,
      label: 'Asignaciones de Recursos',
      description: 'Cuando se asignan o despliegan recursos en incidentes',
      color: 'text-indigo-500'
    },
    {
      key: 'activity_updates',
      icon: Activity,
      label: 'Actualizaciones de Actividades',
      description: 'Nuevas entradas en bitácoras y registros de actividad',
      color: 'text-slate-500'
    }
  ];

  if (isLoading || !preferences) {
    return (
      <div className={cn(
        "min-h-screen -m-8 p-8",
        isDarkMode ? "bg-slate-950" : "bg-slate-100"
      )}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <Card className={cn(
            "p-6",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
          )}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between py-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen -m-8 p-8",
      isDarkMode ? "bg-slate-950" : "bg-slate-100"
    )}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className={cn(
              "w-8 h-8",
              isDarkMode ? "text-orange-400" : "text-orange-600"
            )} />
            <h1 className={cn(
              "text-3xl font-bold",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>Preferencias de Notificaciones</h1>
          </div>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Configura qué tipos de notificaciones deseas recibir en el sistema
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const allEnabled = { ...preferences };
              Object.keys(allEnabled).forEach(key => {
                if (key !== 'user_email' && key !== 'id') {
                  allEnabled[key] = true;
                }
              });
              setPreferences(allEnabled);
            }}
            variant="outline"
            className={cn(
              isDarkMode 
                ? "border-slate-700 hover:bg-slate-800" 
                : "border-slate-300 hover:bg-slate-100"
            )}
          >
            <Bell className="w-4 h-4 mr-2" />
            Activar Todas
          </Button>
          <Button
            onClick={() => {
              const allDisabled = { ...preferences };
              Object.keys(allDisabled).forEach(key => {
                if (key !== 'user_email' && key !== 'id') {
                  allDisabled[key] = false;
                }
              });
              setPreferences(allDisabled);
            }}
            variant="outline"
            className={cn(
              isDarkMode 
                ? "border-slate-700 hover:bg-slate-800" 
                : "border-slate-300 hover:bg-slate-100"
            )}
          >
            <BellOff className="w-4 h-4 mr-2" />
            Desactivar Todas
          </Button>
        </div>

        {/* Notification Preferences */}
        <Card className={cn(
          "p-6",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          <div className="space-y-6">
            {notificationTypes.map((type, index) => {
              const Icon = type.icon;
              const isEnabled = preferences[type.key];
              
              return (
                <div 
                  key={type.key}
                  className={cn(
                    "flex items-start justify-between gap-4 pb-6",
                    index < notificationTypes.length - 1 && "border-b",
                    isDarkMode ? "border-slate-800" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100"
                    )}>
                      <Icon className={cn("w-6 h-6", type.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold mb-1",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}>
                        {type.label}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      )}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(type.key)}
                    className={cn(
                      "mt-2",
                      isEnabled && "bg-orange-500"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Preferencias
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className={cn(
          "p-4",
          isDarkMode 
            ? "bg-blue-950/50 border-blue-900" 
            : "bg-blue-50 border-blue-200"
        )}>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={cn(
                "font-semibold mb-1",
                isDarkMode ? "text-blue-300" : "text-blue-900"
              )}>
                Acerca de las Notificaciones
              </h4>
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-blue-200" : "text-blue-700"
              )}>
                Las notificaciones se mostrarán en la campana de notificaciones en la parte superior derecha. 
                Puedes cambiar estas preferencias en cualquier momento.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}