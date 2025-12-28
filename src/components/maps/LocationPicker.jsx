import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const { BaseLayer } = LayersControl;

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onReverseGeocode }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onReverseGeocode) {
        onReverseGeocode(newPos);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  
  return null;
}

export default function LocationPicker({ coordinates, onCoordinatesChange, address, onAddressChange }) {
  const [position, setPosition] = useState(
    coordinates?.lat && coordinates?.lng 
      ? [coordinates.lat, coordinates.lng] 
      : [19.4326, -99.1332] // Default: Mexico City
  );
  const [mapCenter, setMapCenter] = useState(position);
  const [searchAddress, setSearchAddress] = useState(address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng) {
      const newPos = [coordinates.lat, coordinates.lng];
      setPosition(newPos);
      setMapCenter(newPos);
    }
  }, [coordinates?.lat, coordinates?.lng]);

  useEffect(() => {
    if (address && address !== searchAddress) {
      setSearchAddress(address);
      // Si cambia la dirección desde fuera, buscar las coordenadas automáticamente
      if (!isInitialMount.current && address.trim()) {
        handleSearchForAddress(address);
      }
    }
    isInitialMount.current = false;
  }, [address]);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setMapCenter(newPosition);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        lat: newPosition[0],
        lng: newPosition[1]
      });
    }
  };

  const reverseGeocode = async (pos) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        setSearchAddress(address);
        if (onAddressChange) {
          onAddressChange(address);
        }
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSearchForAddress = async (addressToSearch) => {
    if (!addressToSearch.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToSearch)}&limit=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        handlePositionChange(newPosition);
        setSearchAddress(display_name);
        if (onAddressChange) {
          onAddressChange(display_name);
        }
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    handleSearchForAddress(searchAddress);
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
              onChange={(e) => {
                setSearchAddress(e.target.value);
                if (onAddressChange) {
                  onAddressChange(e.target.value);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ingresa una dirección..."
              className="pl-10"
              disabled={isReverseGeocoding}
            />
            {isReverseGeocoding && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            )}
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
          center={mapCenter}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Mapa Estándar">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="Satélite">
              <TileLayer
                attribution='&copy; Google'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              />
            </BaseLayer>
            <BaseLayer name="Híbrido">
              <TileLayer
                attribution='&copy; Google'
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              />
            </BaseLayer>
          </LayersControl>
          <MapUpdater center={mapCenter} />
          <LocationMarker 
            position={position} 
            setPosition={handlePositionChange}
            onReverseGeocode={reverseGeocode}
          />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Haz clic en el mapa para seleccionar la ubicación del incidente
      </p>
    </div>
  );
}