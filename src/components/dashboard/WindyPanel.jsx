import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, ExternalLink, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function WindyPanel() {
  const [userLocation, setUserLocation] = useState({ lat: -41.910, lng: -72.684 });
  const [locating, setLocating] = useState(false);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no disponible en este navegador');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocating(false);
        toast.success('Ubicación obtenida');
      },
      (error) => {
        setLocating(false);
        toast.error('No se pudo obtener la ubicación');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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

      <div className="relative">
        <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: '400px', width: '100%' }}>
          <iframe 
            src={`https://embed.windy.com/embed2.html?lat=${userLocation.lat}&lon=${userLocation.lng}&detailLat=${userLocation.lat}&detailLon=${userLocation.lng}&width=650&height=450&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Windy Weather Map"
          />
        </div>
        <Button
          onClick={handleGeolocation}
          disabled={locating}
          size="sm"
          className="absolute top-2 right-2 z-[1000] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-lg"
        >
          <Navigation className={`w-4 h-4 mr-1 ${locating ? 'animate-pulse' : ''}`} />
          {locating ? 'Ubicando...' : 'Mi ubicación'}
        </Button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <a 
          href={`https://www.windy.com/?${userLocation.lat},${userLocation.lng},8`}
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