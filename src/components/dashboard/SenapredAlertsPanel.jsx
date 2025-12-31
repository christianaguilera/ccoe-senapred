import React, { useState } from 'react';
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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

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
          {loading ?
          <div className="space-y-3">
              {[1, 2, 3].map((i) =>
            <div key={i} className="p-3 border rounded-lg">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
            )}
            </div> :

          <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Alerta Roja - Región Metropolitana */}
              <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-900 flex-1">
                    Alerta Roja para la Región Metropolitana por calor extremo
                  </p>
                  <Badge className="bg-red-100 text-red-700 border-red-300 shrink-0">Roja</Badge>
                </div>
                <p className="text-xs text-slate-500">28-12-2025 12:56</p>
              </div>

              {/* Alerta Temprana - Valparaíso */}
              <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-900 flex-1">
                    Alerta Temprana Preventiva para Valparaíso por amenaza de incendios forestales
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 shrink-0">Preventiva</Badge>
                </div>
                <p className="text-xs text-slate-500">28-12-2025 12:37</p>
              </div>

              {/* Alerta Amarilla - Biobío */}
              <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-900 flex-1">
                    Alerta Amarilla para la Región del Biobío por calor intenso
                  </p>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 shrink-0">Amarilla</Badge>
                </div>
                <p className="text-xs text-slate-500">28-12-2025 11:26</p>
              </div>

              {/* Alerta Temprana - Maule */}
              <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-900 flex-1">
                    Alerta Temprana Preventiva para el Maule por amenaza de incendios forestales
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 shrink-0">Preventiva</Badge>
                </div>
                <p className="text-xs text-slate-500">28-12-2025 11:08</p>
              </div>

              {/* Alerta Amarilla - Valparaíso */}
              <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-900 flex-1">
                    Alerta Amarilla para Valparaíso por calor intenso
                  </p>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 shrink-0">Amarilla</Badge>
                </div>
                <p className="text-xs text-slate-500">28-12-2025 10:13</p>
              </div>
            </div>
          }

          <div className="mt-4 pt-4 border-t">
            <a
              href="https://senapred.cl/alertas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 justify-center">

              Ver todas las alertas en SENAPRED
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </>
      )}
    </Card>);

}