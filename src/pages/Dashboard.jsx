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
  GripVertical,
  FileText
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
import PowerBIPanel from '../components/dashboard/PowerBIPanel';
import { useTheme } from '../components/contexts/ThemeContext';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [panelOrder, setPanelOrder] = useState(() => {
    const saved = localStorage.getItem('dashboardPanelOrder');
    return saved ? JSON.parse(saved) : ['activity', 'powerbi', 'senapred', 'seismic', 'hydrometric', 'windy'];
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
        <div className={cn(
          "flex items-center gap-2 pb-3 border-b mb-4",
          isDarkMode ? "border-slate-800" : "border-slate-300"
        )}>
          <div className="w-1 h-6 bg-blue-500"></div>
          <h2 className={cn(
            "text-lg font-bold tracking-wider",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>MONITOREO TÉCNICO REGIONAL</h2>
        </div>
        {loadingActivities ? (
          <Card className={cn(
            "p-6",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className={cn(
                    "w-3 h-3 rounded-full",
                    isDarkMode ? "bg-slate-800" : "bg-slate-200"
                  )} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={cn(
                      "h-4 w-24",
                      isDarkMode ? "bg-slate-800" : "bg-slate-200"
                    )} />
                    <Skeleton className={cn(
                      "h-4 w-full",
                      isDarkMode ? "bg-slate-800" : "bg-slate-200"
                    )} />
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
    powerbi: <PowerBIPanel />,
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
    <div className={cn(
      "min-h-screen -m-8 p-8 space-y-6 transition-colors duration-300",
      isDarkMode ? "bg-slate-950" : "bg-slate-100"
    )}>
      {/* Header - Command Center Style */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className={cn(
              "text-3xl font-bold tracking-tight",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>CENTRO DE CONTROL DE EMERGENCIAS</h1>
          </div>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>Panel de Mando y Monitoreo | Sistema ICS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-600")}>FECHA</p>
            <p className={cn(
              "text-sm font-mono",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>{new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-600")}>HORA</p>
            <p className={cn(
              "text-sm font-mono",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>{new Date().toLocaleTimeString('es-CL')}</p>
          </div>
          <a 
            href="https://senapred.cl/recomendaciones/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="shadow-lg">
              <FileText className="w-4 h-4 mr-2" />
              Recomendaciones SENAPRED
            </Button>
          </a>
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
        <div className={cn(
          "border-2 border-red-500 rounded-lg p-4 flex items-center gap-4 shadow-2xl",
          isDarkMode 
            ? "bg-gradient-to-r from-red-950 to-red-900 shadow-red-500/20" 
            : "bg-gradient-to-r from-red-100 to-red-50 shadow-red-500/10"
        )}>
          <div className="w-14 h-14 rounded-lg bg-red-500 flex items-center justify-center animate-pulse shadow-lg">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-white" : "text-red-900"
            )}>
              ⚠️ {criticalIncidents.length} INCIDENTE{criticalIncidents.length > 1 ? 'S' : ''} CRÍTICO{criticalIncidents.length > 1 ? 'S' : ''} ACTIVO{criticalIncidents.length > 1 ? 'S' : ''}
            </h3>
            <p className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-red-200" : "text-red-700"
            )}>REQUIERE ATENCIÓN INMEDIATA</p>
          </div>
          <Link to={createPageUrl('Incidents')}>
            <Button className={cn(
              "font-bold shadow-lg",
              isDarkMode 
                ? "bg-white text-red-600 hover:bg-red-50" 
                : "bg-red-600 text-white hover:bg-red-700"
            )}>
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
              <div key={i} className={cn(
                "border rounded-lg p-6",
                isDarkMode 
                  ? "bg-slate-900 border-slate-800" 
                  : "bg-white border-slate-200"
              )}>
                <Skeleton className={cn("h-4 w-24 mb-3", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />
                <Skeleton className={cn("h-8 w-16", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className={cn(
              "border-2 rounded-lg p-6 shadow-xl",
              isDarkMode 
                ? "bg-gradient-to-br from-red-950 to-slate-900 border-red-500/50" 
                : "bg-gradient-to-br from-red-50 to-white border-red-300"
            )}>
              <div className="flex items-center justify-between mb-3">
                <p className={cn(
                  "text-xs font-bold tracking-wider",
                  isDarkMode ? "text-red-300" : "text-red-700"
                )}>INCIDENTES ACTIVOS</p>
                <Flame className={cn("w-5 h-5", isDarkMode ? "text-red-400" : "text-red-600")} />
              </div>
              <p className={cn(
                "text-4xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{activeIncidents.length}</p>
            </div>
            <div className={cn(
              "border-2 rounded-lg p-6 shadow-xl",
              isDarkMode 
                ? "bg-gradient-to-br from-blue-950 to-slate-900 border-blue-500/50" 
                : "bg-gradient-to-br from-blue-50 to-white border-blue-300"
            )}>
              <div className="flex items-center justify-between mb-3">
                <p className={cn(
                  "text-xs font-bold tracking-wider",
                  isDarkMode ? "text-blue-300" : "text-blue-700"
                )}>RECURSOS DESPLEGADOS</p>
                <Package className={cn("w-5 h-5", isDarkMode ? "text-blue-400" : "text-blue-600")} />
              </div>
              <p className={cn(
                "text-4xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{deployedResources.length}</p>
            </div>
            <div className={cn(
              "border-2 rounded-lg p-6 shadow-xl",
              isDarkMode 
                ? "bg-gradient-to-br from-emerald-950 to-slate-900 border-emerald-500/50" 
                : "bg-gradient-to-br from-emerald-50 to-white border-emerald-300"
            )}>
              <div className="flex items-center justify-between mb-3">
                <p className={cn(
                  "text-xs font-bold tracking-wider",
                  isDarkMode ? "text-emerald-300" : "text-emerald-700"
                )}>TOTAL RECURSOS</p>
                <Users className={cn("w-5 h-5", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
              </div>
              <p className={cn(
                "text-4xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{resources.length}</p>
            </div>
            <div className={cn(
              "border-2 rounded-lg p-6 shadow-xl",
              isDarkMode 
                ? "bg-gradient-to-br from-purple-950 to-slate-900 border-purple-500/50" 
                : "bg-gradient-to-br from-purple-50 to-white border-purple-300"
            )}>
              <div className="flex items-center justify-between mb-3">
                <p className={cn(
                  "text-xs font-bold tracking-wider",
                  isDarkMode ? "text-purple-300" : "text-purple-700"
                )}>INCIDENTES HOY</p>
                <Clock className={cn("w-5 h-5", isDarkMode ? "text-purple-400" : "text-purple-600")} />
              </div>
              <p className={cn(
                "text-4xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{incidents.filter(i => {
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
          <div className={cn(
            "flex items-center justify-between pb-3 border-b",
            isDarkMode ? "border-slate-800" : "border-slate-300"
          )}>
            <h2 className={cn(
              "text-lg font-bold tracking-wider flex items-center gap-2",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              <div className="w-1 h-6 bg-orange-500"></div>
              INCIDENTES ACTIVOS
            </h2>
            <Link to={createPageUrl('Incidents')} className={cn(
              "text-sm font-bold flex items-center gap-1",
              isDarkMode 
                ? "text-orange-400 hover:text-orange-300" 
                : "text-orange-600 hover:text-orange-700"
            )}>
              VER TODOS
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingIncidents ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "border rounded-lg p-5",
                  isDarkMode 
                    ? "bg-slate-900 border-slate-800" 
                    : "bg-white border-slate-200"
                )}>
                  <div className="flex gap-4">
                    <Skeleton className={cn(
                      "w-12 h-12 rounded-xl",
                      isDarkMode ? "bg-slate-800" : "bg-slate-200"
                    )} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className={cn(
                        "h-4 w-32",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200"
                      )} />
                      <Skeleton className={cn(
                        "h-5 w-full",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200"
                      )} />
                      <Skeleton className={cn(
                        "h-4 w-48",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200"
                      )} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className={cn(
              "border rounded-lg p-8 text-center",
              isDarkMode 
                ? "bg-slate-900 border-slate-800" 
                : "bg-white border-slate-200"
            )}>
              <div className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4",
                isDarkMode 
                  ? "bg-emerald-900/50 border-emerald-500" 
                  : "bg-emerald-50 border-emerald-300"
              )}>
                <AlertTriangle className={cn(
                  "w-8 h-8",
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                )} />
              </div>
              <h3 className={cn(
                "font-semibold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>SIN INCIDENTES ACTIVOS</h3>
              <p className={cn(
                "text-sm mt-1",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>Todos los incidentes han sido resueltos</p>
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