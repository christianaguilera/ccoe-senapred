import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Wind, Droplets, Sun, CloudRain, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '../contexts/ThemeContext';

export default function InfoCloudPanel() {
  const { isDarkMode } = useTheme();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchWeatherInfo = async () => {
    setLoading(true);
    try {
      // Simular datos meteorológicos (en producción usar API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeatherData({
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        conditions: ['Despejado', 'Parcialmente nublado', 'Nublado', 'Lluvia ligera'][Math.floor(Math.random() * 4)],
        alerts: Math.random() > 0.7 ? ['Viento fuerte esperado'] : []
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherInfo();
    const interval = setInterval(fetchWeatherInfo, 5 * 60 * 1000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const getConditionIcon = (condition) => {
    if (condition.includes('Despejado')) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (condition.includes('Nublado')) return <Cloud className="w-8 h-8 text-slate-400" />;
    if (condition.includes('Lluvia')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div>
      <div className={cn(
        "flex items-center justify-between pb-3 border-b mb-4",
        isDarkMode ? "border-slate-800" : "border-slate-300"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-sky-500"></div>
          <h2 className={cn(
            "text-lg font-bold tracking-wider flex items-center gap-2",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            <Cloud className="w-5 h-5" />
            NUBE DE INFORMACIÓN
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeatherInfo}
            disabled={loading}
            className={cn(
              "h-8 w-8 p-0",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 p-0",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            )}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <Card className={cn(
          "p-6",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          {loading && !weatherData ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Condición principal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getConditionIcon(weatherData?.conditions)}
                  <div>
                    <h3 className={cn(
                      "text-2xl font-bold",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {weatherData?.temperature}°C
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      {weatherData?.conditions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alertas meteorológicas */}
              {weatherData?.alerts?.length > 0 && (
                <div className={cn(
                  "p-3 rounded-lg border-l-4 border-orange-500",
                  isDarkMode ? "bg-orange-900/20" : "bg-orange-50"
                )}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-orange-300" : "text-orange-800"
                      )}>
                        Alertas Activas
                      </p>
                      {weatherData.alerts.map((alert, idx) => (
                        <p key={idx} className={cn(
                          "text-xs mt-1",
                          isDarkMode ? "text-orange-200" : "text-orange-700"
                        )}>
                          {alert}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles meteorológicos */}
              <div className="grid grid-cols-3 gap-3">
                <div className={cn(
                  "p-3 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      Humedad
                    </span>
                  </div>
                  <p className={cn(
                    "text-xl font-bold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>
                    {weatherData?.humidity}%
                  </p>
                </div>

                <div className={cn(
                  "p-3 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-sky-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      Viento
                    </span>
                  </div>
                  <p className={cn(
                    "text-xl font-bold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>
                    {weatherData?.windSpeed} km/h
                  </p>
                </div>

                <div className={cn(
                  "p-3 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-4 h-4 text-slate-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      Estado
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs font-semibold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>
                    Monitoreando
                  </p>
                </div>
              </div>

              {/* Última actualización */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className={cn(
                  "text-xs",
                  isDarkMode ? "text-slate-500" : "text-slate-500"
                )}>
                  Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
                </p>
                <a
                  href="https://www.meteochile.gob.cl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs flex items-center gap-1 hover:underline",
                    isDarkMode ? "text-sky-400" : "text-sky-600"
                  )}
                >
                  Ver pronóstico completo
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}