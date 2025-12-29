import React from 'react';
import { Card } from "@/components/ui/card";
import { Cloud, ExternalLink } from 'lucide-react';

export default function WindyPanel() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Condiciones Meteorológicas</h2>
            <p className="text-xs text-slate-500">Mapa interactivo Windy</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '400px', width: '100%' }}>
        <iframe 
          src="https://embed.windy.com/embed2.html?lat=-41.910&lon=-72.684&detailLat=-41.910&detailLon=-72.684&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Windy Weather Map"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <a 
          href="https://www.windy.com/?-41.910,-72.684,6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
        >
          Abrir en Windy.com
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}