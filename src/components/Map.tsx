import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindowF, LoadScript, MarkerF } from '@react-google-maps/api';

interface MapProps {
  height?: string | number;
  onLocationFound?: (lat: number, lng: number) => void;
  userLocation?: Coordinates | null;
  metroStations?: MetroStationMarker[];
  showMetroStations?: boolean;
}

type Coordinates = {
  lat: number;
  lng: number;
};

export type MetroStationMarker = {
  stationName: string;
  sourceName?: string;
  distanceKm?: number;
  lat: number;
  lng: number;
};

const Map: React.FC<MapProps> = ({
  height = 'clamp(320px, 45vh, 520px)',
  onLocationFound,
  userLocation = null,
  metroStations = [],
  showMetroStations = false,
}) => {
  const defaultPosition: Coordinates = { lat: 28.6139, lng: 77.2090 };
  const [position, setPosition] = useState<Coordinates>(userLocation ?? defaultPosition);
  const [activeStation, setActiveStation] = useState<MetroStationMarker | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
      return;
    }

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        const next = {
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
        };
        setPosition(next);
        onLocationFound?.(next.lat, next.lng);
      },
      (error) => {
        console.error('Location access denied or unavailable:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationFound, userLocation]);

  const mapCenter = useMemo(() => {
    if (showMetroStations && metroStations.length > 0) {
      return { lat: metroStations[0].lat, lng: metroStations[0].lng };
    }
    return position;
  }, [showMetroStations, metroStations, position]);

  if (!apiKey) {
    return (
      <div
        style={{
          width: '100%',
          height,
          minHeight: '320px',
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          padding: '12px',
          textAlign: 'center',
        }}
      >
        Google Maps API key missing.
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        center={mapCenter}
        zoom={13}
        mapContainerStyle={{
          width: '100%',
          height: typeof height === 'number' ? `${height}px` : height,
          minHeight: '320px',
        }}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        <MarkerF position={position} label="You" />

        {showMetroStations
          ? metroStations.map((station, index) => (
              <MarkerF
                key={`${station.stationName}-${index}`}
                position={{ lat: station.lat, lng: station.lng }}
                label={`${index + 1}`}
                onClick={() => setActiveStation(station)}
              />
            ))
          : null}

        {activeStation ? (
          <InfoWindowF
            position={{ lat: activeStation.lat, lng: activeStation.lng }}
            onCloseClick={() => setActiveStation(null)}
          >
            <div>
              <strong>{activeStation.stationName}</strong>
              {activeStation.distanceKm ? (
                <div>{activeStation.distanceKm.toFixed(2)} km away</div>
              ) : null}
            </div>
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
