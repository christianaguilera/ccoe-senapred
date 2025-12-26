import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ coordinates, onCoordinatesChange, address }) {
  const [position, setPosition] = useState(
    coordinates?.lat && coordinates?.lng 
      ? [coordinates.lat, coordinates.lng] 
      : [19.4326, -99.1332] // Default: Mexico City
  );
  const [searchAddress, setSearchAddress] = useState(address || '');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng) {
      setPosition([coordinates.lat, coordinates.lng]);
    }
  }, [coordinates]);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        lat: newPosition[0],
        lng: newPosition[1]
      });
    }
  };

  const handleSearch = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        handlePositionChange(newPosition);
      } else {
        alert('No se encontró la ubicación. Intenta con una dirección más específica.');
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      alert('Error al buscar la ubicación. Por favor, intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="space-y-2">
        <Label>Buscar Ubicación</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ingresa una dirección..."
              className="pl-10"
            />
          </div>
          <Button 
            type="button"
            onClick={handleSearch} 
            disabled={isSearching}
            variant="outline"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Latitud</Label>
          <Input
            type="number"
            step="any"
            value={position[0].toFixed(6)}
            onChange={(e) => {
              const newLat = parseFloat(e.target.value);
              if (!isNaN(newLat)) {
                handlePositionChange([newLat, position[1]]);
              }
            }}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Longitud</Label>
          <Input
            type="number"
            step="any"
            value={position[1].toFixed(6)}
            onChange={(e) => {
              const newLng = parseFloat(e.target.value);
              if (!isNaN(newLng)) {
                handlePositionChange([position[0], newLng]);
              }
            }}
            className="text-sm"
          />
        </div>
      </div>

      {/* Map */}
      <div className="border rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Haz clic en el mapa para seleccionar la ubicación del incidente
      </p>
    </div>
  );
}