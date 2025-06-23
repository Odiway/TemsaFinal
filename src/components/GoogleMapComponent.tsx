// src/components/GoogleMapComponent.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

// Harita stilleri
const mapContainerStyle = {
  width: '100%',
  height: '100%', // Yükseklik pmp/page.tsx'ten yönetiliyor
  borderRadius: '8px',
};

// Haritanın varsayılan merkez noktası (Adana, Türkiye)
const defaultCenter = {
  lat: 37.0,
  lng: 35.325,
};

const defaultZoom = 10;
const libraries: ('drawing' | 'geometry' | 'places')[] = ['places'];

interface GoogleMapComponentProps {
  apiKey: string;
  busLocation: { lat: number; lng: number } | null;
  busId: string;
  routePath: Array<{ lat: number; lng: number }>; // Otobüsün kat ettiği rota
  bearingDegrees?: number; // Otobüsün yönü
  weatherCondition?: string; // Hava durumu
  currentRouteAction?: string; // Hangi aksiyonda olduğu (charge_station vb.)
  chargingStatus?: boolean; // Şarjda olup olmadığı
  vehicleSpeed?: number; // Aracın hızı
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  apiKey,
  busLocation,
  busId,
  routePath,
  bearingDegrees,
  weatherCondition,
  currentRouteAction,
  vehicleSpeed,
}) => {
  // mapRef will hold the Google Maps Map instance
  const mapRef = useRef<google.maps.Map | null>(null);
  // componentRootRef will hold the DOM reference to the outermost div of this component
  const componentRootRef = useRef<HTMLDivElement>(null);

  // Use a state for the map center, initialized with busLocation or defaultCenter
  const [currentMapCenter, setCurrentMapCenter] = useState(busLocation || defaultCenter);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Center the map when busLocation changes
  useEffect(() => {
    if (busLocation) {
      setCurrentMapCenter(busLocation);
      // If the map instance is available, directly pan to the new location for smoother transition
      if (mapRef.current) {
        mapRef.current.panTo(busLocation);
      }
    }
  }, [busLocation]);

  // Handle loading and error states for the map script
  if (loadError)
    return (
      <div ref={componentRootRef} className="text-red-400 p-4">Harita yüklenirken hata oluştu: {loadError.message}</div>
    );
  if (!isLoaded) return (
    // Ensure that even in loading state, a div with a ref is returned for consistency
    <div ref={componentRootRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="text-slate-400 p-4">Harita yükleniyor...</div>
    </div>
  );

  // If map is loaded, we can safely use 'google.maps'
  const googleMapsSymbolPath = google.maps.SymbolPath;

  // Define bus marker icon based on current route action
  const busIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.FORWARD_CLOSED_ARROW,
    fillColor:
      currentRouteAction === 'charge_station'
        ? 'blue'
        : currentRouteAction?.includes('stop')
          ? 'orange'
          : 'red',
    fillOpacity: 0.9,
    strokeWeight: 0,
    scale: 6,
    rotation: bearingDegrees || 0,
  };

  // Define icons for various points of interest/actions
  const chargeStationIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.CIRCLE,
    fillColor: 'lime',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'black',
    scale: 6,
  };

  const trafficLightIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.CIRCLE,
    fillColor: vehicleSpeed !== undefined && vehicleSpeed < 1 ? 'red' : 'green',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'black',
    scale: 6,
  };

  const restAreaIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.CIRCLE,
    fillColor: 'cyan',
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 6,
  };

  const trafficJamIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.CIRCLE,
    fillColor: 'gray',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'black',
    scale: 6,
  };

  const tollGateIcon: google.maps.Symbol = {
    path: googleMapsSymbolPath.CIRCLE,
    fillColor: 'purple',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'black',
    scale: 6,
  };

  // Polyline options for the bus route
  const polylineOptions = {
    strokeColor: '#00BFFF',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    geodesic: true,
  };

  // Style for the weather overlay
  const weatherOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allow clicks to pass through to the map
    zIndex: 1, // Ensure overlay is above the map but below other UI
    borderRadius: 'inherit', // Inherit border-radius from parent container
  };

  // Function to determine and return the weather overlay JSX
  const getWeatherOverlay = () => {
    switch (weatherCondition) {
      case 'rainy':
        return (
          <div
            style={{
              ...weatherOverlayStyle,
              background: 'rgba(0, 0, 255, 0.1)',
              backdropFilter: 'blur(1px) brightness(0.8)',
            }}
          >
            <div className="rain-effect" style={{ animation: 'rain 0.5s linear infinite' }}></div>
          </div>
        );
      case 'snowy':
        return (
          <div
            style={{
              ...weatherOverlayStyle,
              background: 'rgba(200, 200, 255, 0.2)',
              backdropFilter: 'blur(0.5px) brightness(0.9)',
            }}
          >
            <div className="snow-effect" style={{ animation: 'snow 1s linear infinite' }}></div>
          </div>
        );
      case 'high_traffic':
        return (
          <div
            style={{
              ...weatherOverlayStyle,
              background: 'rgba(255, 165, 0, 0.1)',
              backdropFilter: 'brightness(0.9)',
            }}
          ></div>
        );
      default:
        return null;
    }
  };

  return (
    // The outermost div now has a ref, ensuring it's always referenceable
    <div ref={componentRootRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentMapCenter} // Use the state variable for centering
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          // Custom map styles for a darker theme
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#263c3f' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6b9a76' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#38414e' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#212a37' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#9ca5b3' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#746855' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1f2835' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#f3d19c' }],
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{ color: '#2f3948' }],
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#17263c' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#515c6d' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#17263c' }],
            },
          ],
        }}
      >
        {/* Polyline to show the bus's traversed route */}
        <Polyline path={routePath} options={polylineOptions} />

        {/* Marker for the current bus location */}
        {busLocation && (
          <Marker
            position={busLocation}
            label={{
              text: busId || 'Otobüs',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            icon={busIcon}
          />
        )}

        {/* Conditional markers for specific route actions */}
        {currentRouteAction === 'charge_station' && (
          <Marker
            position={busLocation || defaultCenter}
            label={{ text: 'Şarj', color: 'black', fontSize: '12px', fontWeight: 'bold' }}
            icon={chargeStationIcon}
          />
        )}

        {currentRouteAction === 'stop_traffic_light' && (
          <Marker
            position={busLocation || defaultCenter}
            label={{ text: 'Işık', color: 'black', fontSize: '12px', fontWeight: 'bold' }}
            icon={trafficLightIcon}
          />
        )}
        {currentRouteAction === 'stop_rest_area' && (
          <Marker
            position={busLocation || defaultCenter}
            label={{ text: 'Mola', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
            icon={restAreaIcon}
          />
        )}
        {currentRouteAction === 'stop_traffic_jam' && (
          <Marker
            position={busLocation || defaultCenter}
            label={{ text: 'Trafik', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
            icon={trafficJamIcon}
          />
        )}
        {currentRouteAction === 'stop_toll_gate' && (
          <Marker
            position={busLocation || defaultCenter}
            label={{ text: 'Gişe', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
            icon={tollGateIcon}
          />
        )}
      </GoogleMap>

      {/* Overlay for weather effects */}
      {getWeatherOverlay()}

      {/* Inline CSS for weather animations */}
      <style jsx>{`
        .rain-effect {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cg opacity='.5'%3E%3Cpath stroke='%23fff' stroke-width='1.5' stroke-linecap='round' d='M5 0v10'/%3E%3C/g%3E%3C/svg%3E");
          animation: rain 0.5s linear infinite;
        }
        .snow-effect {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cg opacity='.6'%3E%3Ccircle cx='5' cy='5' r='2.5' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E");
          animation: snow 1s linear infinite;
        }

        @keyframes rain {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }
        @keyframes snow {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default memo(GoogleMapComponent);
