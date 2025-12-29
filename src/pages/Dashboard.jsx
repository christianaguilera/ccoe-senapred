import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  Clock,
  ChevronRight,
  Plus,
  Flame,
  GripVertical
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from '../components/dashboard/StatsCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import IncidentCard from '../components/incidents/IncidentCard';
import SenapredAlertsPanel from '../components/dashboard/SenapredAlertsPanel';
import ChileanSeismicPanel from '../components/dashboard/ChileanSeismicPanel';
import HydrometricStationsPanel from '../components/dashboard/HydrometricStationsPanel';
import WindyPanel from '../components/dashboard/WindyPanel';

export default function Dashboard() {
  const [panelOrder, setPanelOrder] = useState(() => {
    const saved = localStorage.getItem('dashboardPanelOrder');
    return saved ? JSON.parse(saved) : ['activity', 'senapred', 'seismic', 'hydrometric', 'windy'];
  });
  const [pressTimer, setPressTimer] = useState(null);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [pressingPanel, setPressingPanel] = useState(null);
  const [pressProgress, setPressProgress] = useState(0);

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(panelOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPanelOrder(items);
    localStorage.setItem('dashboardPanelOrder', JSON.stringify(items));
    setDragEnabled(false);
    setPressingPanel(null);
    setPressProgress(0);
  };

  const handlePressStart = (panelId) => {
    setPressingPanel(panelId);
    setPressProgress(0);
    
    const interval = setInterval(() => {
      setPressProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDragEnabled(true);
          return 100;
        }
        return prev + (100 / 30); // 30 steps in 3 seconds
      });
    }, 100);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setDragEnabled(true);
    }, 3000);

    setPressTimer({ timer, interval });
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer.timer);
      clearInterval(pressTimer.interval);
    }
    if (!dragEnabled) {
      setPressingPanel(null);
      setPressProgress(0);
    }
  };

  const panels = {
    activity: (
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
          <div className="w-1 h-6 bg-blue-500"></div>
          <h2 className="text-lg font-bold text-white tracking-wider">MONITOREO TÉCNICO REGIONAL</h2>
        </div>
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
    ),
    senapred: <SenapredAlertsPanel />,
    seismic: <ChileanSeismicPanel />,
    hydrometric: <HydrometricStationsPanel />,
    windy: <WindyPanel />
  };

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
    <div className="min-h-screen bg-slate-950 -m-8 p-8 space-y-6">
      {/* Header - Command Center Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-3xl font-bold text-white tracking-tight">CENTRO DE CONTROL DE EMERGENCIAS</h1>
          </div>
          <p className="text-slate-400 text-sm">Panel de Mando y Monitoreo | Sistema ICS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">FECHA</p>
            <p className="text-sm font-mono text-white">{new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">HORA</p>
            <p className="text-sm font-mono text-white">{new Date().toLocaleTimeString('es-CL')}</p>
          </div>
          <Link to={createPageUrl('Incidents')}>
            <Button className="bg-orange-500 hover:bg-orange-600 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Incidente
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alert - Command Center Style */}
      {criticalIncidents.length > 0 && (
        <div className="bg-gradient-to-r from-red-950 to-red-900 border-2 border-red-500 rounded-lg p-4 flex items-center gap-4 shadow-2xl shadow-red-500/20">
          <div className="w-14 h-14 rounded-lg bg-red-500 flex items-center justify-center animate-pulse shadow-lg">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">
              ⚠️ {criticalIncidents.length} INCIDENTE{criticalIncidents.length > 1 ? 'S' : ''} CRÍTICO{criticalIncidents.length > 1 ? 'S' : ''} ACTIVO{criticalIncidents.length > 1 ? 'S' : ''}
            </h3>
            <p className="text-sm text-red-200 font-medium">REQUIERE ATENCIÓN INMEDIATA</p>
          </div>
          <Link to={createPageUrl('Incidents')}>
            <Button className="bg-white text-red-600 hover:bg-red-50 font-bold shadow-lg">
              VER DETALLES
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid - Command Center Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingIncidents ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <Skeleton className="h-4 w-24 mb-3 bg-slate-800" />
                <Skeleton className="h-8 w-16 bg-slate-800" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-red-950 to-slate-900 border-2 border-red-500/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-red-300 tracking-wider">INCIDENTES ACTIVOS</p>
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-4xl font-bold text-white">{activeIncidents.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 border-2 border-blue-500/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-blue-300 tracking-wider">RECURSOS DESPLEGADOS</p>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-white">{deployedResources.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border-2 border-emerald-500/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-emerald-300 tracking-wider">TOTAL RECURSOS</p>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-4xl font-bold text-white">{resources.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-950 to-slate-900 border-2 border-purple-500/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-purple-300 tracking-wider">INCIDENTES HOY</p>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-4xl font-bold text-white">{incidents.filter(i => {
                const today = new Date().toDateString();
                return new Date(i.created_date).toDateString() === today;
              }).length}</p>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid - Command Center Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500"></div>
              INCIDENTES ACTIVOS
            </h2>
            <Link to={createPageUrl('Incidents')} className="text-sm text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
              VER TODOS
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingIncidents ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-slate-800" />
                      <Skeleton className="h-5 w-full bg-slate-800" />
                      <Skeleton className="h-4 w-48 bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900/50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">SIN INCIDENTES ACTIVOS</h3>
              <p className="text-slate-400 text-sm mt-1">Todos los incidentes han sido resueltos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents.slice(0, 5).map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-panels" isDropDisabled={!dragEnabled}>
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {panelOrder.map((panelId, index) => (
                  <Draggable 
                    key={panelId} 
                    draggableId={panelId} 
                    index={index}
                    isDragDisabled={!dragEnabled || pressingPanel !== panelId}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={() => handlePressStart(panelId)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={() => handlePressStart(panelId)}
                        onTouchEnd={handlePressEnd}
                        className={`relative touch-none ${snapshot.isDragging ? 'z-50 opacity-90 scale-105 shadow-2xl' : ''} ${pressingPanel === panelId && !dragEnabled ? 'ring-4 ring-orange-400 ring-opacity-50' : ''} transition-all duration-200`}
                        style={{
                          ...provided.draggableProps.style,
                          cursor: dragEnabled && pressingPanel === panelId ? 'grab' : 'default'
                        }}
                      >
                        {pressingPanel === panelId && !dragEnabled && (
                          <div className="absolute inset-0 bg-orange-500/10 rounded-lg pointer-events-none z-10 flex items-center justify-center">
                            <div className="bg-white rounded-full p-4 shadow-lg">
                              <div className="relative w-16 h-16">
                                <svg className="transform -rotate-90 w-16 h-16">
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="#f97316"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pressProgress / 100)}`}
                                    className="transition-all duration-100"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-orange-600 font-bold text-sm">
                                  {Math.round(pressProgress)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {snapshot.isDragging && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                            📍 Suelta para fijar posición
                          </div>
                        )}
                        {panels[panelId]}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}