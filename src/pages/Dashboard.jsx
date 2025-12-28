import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  Clock,
  ChevronRight,
  Plus,
  Flame
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from '../components/dashboard/StatsCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import IncidentCard from '../components/incidents/IncidentCard';
import SenapredAlertsPanel from '../components/dashboard/SenapredAlertsPanel';

export default function Dashboard() {
  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 50),
  });

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 100),
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 10),
  });

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status === 'active');
  const deployedResources = resources.filter(r => r.status === 'deployed');

  // Notificar sobre incidentes críticos activos al cargar
  useEffect(() => {
    const notifyCriticalIncidents = async () => {
      if (criticalIncidents.length > 0 && !loadingIncidents) {
        const user = await base44.auth.me();
        const existingNotifications = await base44.entities.Notification.filter({
          user_email: user.email,
          type: 'critical_alert'
        });
        
        // Solo notificar incidentes críticos que no tienen notificación reciente
        for (const incident of criticalIncidents) {
          const hasRecentNotification = existingNotifications.some(
            n => n.related_incident_id === incident.id && 
            new Date(n.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          );
          
          if (!hasRecentNotification) {
            await base44.entities.Notification.create({
              title: '⚠️ Incidente crítico activo',
              message: `${incident.name} - ${incident.location}`,
              type: 'critical_alert',
              priority: 'critical',
              related_incident_id: incident.id,
              user_email: user.email,
              read: false
            });
          }
        }
      }
    };
    
    notifyCriticalIncidents();
  }, [criticalIncidents.length, loadingIncidents]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Resumen del sistema de comando de incidentes</p>
        </div>
        <Link to={createPageUrl('Incidents')}>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Incidente
          </Button>
        </Link>
      </div>

      {/* Critical Alert */}
      {criticalIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">
              {criticalIncidents.length} Incidente{criticalIncidents.length > 1 ? 's' : ''} Crítico{criticalIncidents.length > 1 ? 's' : ''} Activo{criticalIncidents.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-red-700">Requiere atención inmediata</p>
          </div>
          <Link to={createPageUrl('Incidents')}>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Ver Detalles
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingIncidents ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard 
              title="Incidentes Activos" 
              value={activeIncidents.length}
              icon={Flame}
              color="bg-red-500"
            />
            <StatsCard 
              title="Recursos Desplegados" 
              value={deployedResources.length}
              icon={Package}
              color="bg-blue-500"
            />
            <StatsCard 
              title="Total Recursos" 
              value={resources.length}
              icon={Users}
              color="bg-emerald-500"
            />
            <StatsCard 
              title="Incidentes Hoy" 
              value={incidents.filter(i => {
                const today = new Date().toDateString();
                return new Date(i.created_date).toDateString() === today;
              }).length}
              icon={Clock}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Incidentes Activos</h2>
            <Link to={createPageUrl('Incidents')} className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingIncidents ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-5">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Sin Incidentes Activos</h3>
              <p className="text-slate-500 text-sm mt-1">Todos los incidentes han sido resueltos</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeIncidents.slice(0, 5).map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* SENAPRED Alerts */}
          <SenapredAlertsPanel />

          {/* Activity Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Actividad Reciente Regional</h2>
            {loadingActivities ? (
              <Card className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <ActivityTimeline activities={activities} incidents={incidents} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}