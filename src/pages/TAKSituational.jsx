import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  Users, 
  MapPin, 
  MessageCircle, 
  Send,
  Clock,
  Navigation,
  Activity,
  Eye,
  Share2,
  Target
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../components/contexts/ThemeContext';
import DrawableOperationsMap from '../components/maps/DrawableOperationsMap';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TAKSituational() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [message, setMessage] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Fetch active incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.filter({ status: 'active' }),
  });

  // Fetch resources
  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 100),
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 20),
  });

  // Auto-select first active incident
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  // Create activity mutation
  const createActivity = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.ActivityLog.create({
        incident_id: selectedIncident?.id,
        action: data.message,
        category: 'operations',
        priority: 'info',
        reported_by: user.full_name || user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setMessage('');
    }
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedIncident) {
      createActivity.mutate({ message: message.trim() });
    }
  };

  const deployedResources = resources.filter(r => 
    r.status === 'deployed' && r.incident_id === selectedIncident?.id
  );

  const incidentActivities = activities.filter(a => 
    a.incident_id === selectedIncident?.id
  );

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500',
      deployed: 'bg-blue-500',
      en_route: 'bg-yellow-500',
      out_of_service: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      info: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      warning: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
      critical: isDarkMode ? 'text-red-400' : 'text-red-600'
    };
    return colors[priority] || colors.info;
  };

  return (
    <div className={cn(
      "min-h-screen -m-8 p-8 space-y-6 transition-colors duration-300",
      isDarkMode ? "bg-slate-950" : "bg-slate-100"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between pb-4 border-b",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className={cn(
              "text-3xl font-bold tracking-tight flex items-center gap-3",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              <Radio className="w-8 h-8 text-orange-500" />
              CONCIENCIA SITUACIONAL TÁCTICA
            </h1>
          </div>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Sistema de coordinación y colaboración en tiempo real
          </p>
        </div>
        {selectedIncident && (
          <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
            {selectedIncident.name}
          </Badge>
        )}
      </div>

      {/* Incident Selector */}
      {incidents.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {incidents.map(incident => (
            <Button
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              variant={selectedIncident?.id === incident.id ? "default" : "outline"}
              className={selectedIncident?.id === incident.id ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              <Target className="w-4 h-4 mr-2" />
              {incident.name}
            </Button>
          ))}
        </div>
      )}

      {selectedIncident ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - Main Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className={cn(
              "p-6",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={cn(
                  "text-lg font-bold flex items-center gap-2",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  <MapPin className="w-5 h-5 text-orange-500" />
                  MAPA DE OPERACIONES
                </h2>
                <div className="flex items-center gap-2">
                  {userLocation && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Mi Ubicación
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {deployedResources.length} Recursos Activos
                  </Badge>
                </div>
              </div>
              <div style={{ height: '600px' }}>
                <DrawableOperationsMap 
                  incidentId={selectedIncident.id}
                  incidentCoordinates={selectedIncident.coordinates}
                />
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Resources Panel */}
            <Card className={cn(
              "p-6",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4 flex items-center gap-2",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                <Users className="w-5 h-5 text-blue-500" />
                RECURSOS DESPLEGADOS
              </h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {deployedResources.length === 0 ? (
                    <p className={cn(
                      "text-sm text-center py-8",
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    )}>
                      No hay recursos desplegados
                    </p>
                  ) : (
                    deployedResources.map(resource => (
                      <div
                        key={resource.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(resource.status)
                          )} />
                          <span className={cn(
                            "font-semibold text-sm",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          {resource.quantity > 1 && (
                            <span className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}>
                              x{resource.quantity}
                            </span>
                          )}
                        </div>
                        {resource.assigned_to && (
                          <p className={cn(
                            "text-xs mt-1",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          )}>
                            📍 {resource.assigned_to}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Communications Panel */}
            <Card className={cn(
              "p-6",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4 flex items-center gap-2",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                <MessageCircle className="w-5 h-5 text-green-500" />
                COMUNICACIONES
              </h3>
              <ScrollArea className="h-64 mb-4">
                <div className="space-y-3">
                  {incidentActivities.length === 0 ? (
                    <p className={cn(
                      "text-sm text-center py-8",
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    )}>
                      No hay mensajes
                    </p>
                  ) : (
                    incidentActivities.map(activity => (
                      <div
                        key={activity.id}
                        className={cn(
                          "p-3 rounded-lg border-l-4",
                          isDarkMode ? "bg-slate-800" : "bg-slate-50",
                          activity.priority === 'critical' ? "border-red-500" :
                          activity.priority === 'warning' ? "border-yellow-500" :
                          "border-blue-500"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-semibold",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          )}>
                            {activity.reported_by}
                          </span>
                          <span className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-500" : "text-slate-500"
                          )}>
                            {format(new Date(activity.timestamp || activity.created_date), 'HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-white" : "text-slate-900"
                        )}>
                          {activity.action}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Escribir mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={cn(
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
                  )}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className={cn(
          "p-12 text-center",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          <Target className={cn(
            "w-16 h-16 mx-auto mb-4",
            isDarkMode ? "text-slate-700" : "text-slate-300"
          )} />
          <h3 className={cn(
            "text-xl font-semibold mb-2",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            No hay incidentes activos
          </h3>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Selecciona un incidente activo para visualizar el estado situacional
          </p>
        </Card>
      )}
    </div>
  );
}