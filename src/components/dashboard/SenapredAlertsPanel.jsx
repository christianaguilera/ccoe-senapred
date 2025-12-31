import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const alertTypeColors = {
  'Roja': 'bg-red-100 text-red-700 border-red-300',
  'Amarilla': 'bg-amber-100 text-amber-700 border-amber-300',
  'Verde': 'bg-green-100 text-green-700 border-green-300',
  'Temprana Preventiva': 'bg-blue-100 text-blue-700 border-blue-300'
};

export default function SenapredAlertsPanel() {
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="bg-slate-50 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Alertas SENAPRED</h3>
            <p className="text-xs text-slate-500">Sistema Nacional de Emergencia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}>

            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}>

            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '400px', width: '100%' }}>
            <iframe 
              key={refreshKey}
              src="https://senapred.cl/alertas/"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Alertas SENAPRED"
              allowFullScreen
            />
          </div>

          <div className="mt-4 pt-4 border-t">
            <a
              href="https://senapred.cl/alertas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 justify-center">

              Abrir en pantalla completa
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </>
      )}
    </Card>);

}