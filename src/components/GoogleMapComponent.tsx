'use client';



import React, { useState, useEffect, useCallback, useRef } from 'react';

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

  const mapRef = useRef<google.maps.Map | null>(null);

  const [currentCenter] = useState(defaultCenter);



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



  // Otobüs konumu değiştiğinde haritayı ortalamak için

  useEffect(() => {

    if (mapRef.current && busLocation) {

      mapRef.current.panTo(busLocation);

    }

  }, [busLocation]);



  // Harita yüklenirken veya hata oluşursa erken çıkış

  if (loadError)

    return (

      <div className="text-red-400 p-4">Harita yüklenirken hata oluştu: {loadError.message}</div>

    );

  if (!isLoaded) return <div className="text-slate-400 p-4">Harita yükleniyor...</div>;



  // Harita yüklendiyse, 'google.maps' objesini güvenle kullanabiliriz.

  const googleMapsSymbolPath = google.maps.SymbolPath;



  const busIcon: google.maps.Symbol = {

    // Tip 'google.maps.Symbol' olarak belirlendi

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



  const polylineOptions = {

    strokeColor: '#00BFFF',

    strokeOpacity: 0.8,

    strokeWeight: 4,

    geodesic: true,

  };



  const weatherOverlayStyle: React.CSSProperties = {

    position: 'absolute',

    top: 0,

    left: 0,

    width: '100%',

    height: '100%',

    pointerEvents: 'none',

    zIndex: 1,

    borderRadius: 'inherit',

  };



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

    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      <GoogleMap

        mapContainerStyle={mapContainerStyle}

        center={currentCenter}

        zoom={defaultZoom}

        onLoad={onLoad}

        onUnmount={onUnmount}

        options={{

          zoomControl: true,

          mapTypeControl: false,

          streetViewControl: false,

          fullscreenControl: false,

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

        {/* Rota çizgisi */}

        <Polyline path={routePath} options={polylineOptions} />



        {/* Otobüsün mevcut konumu */}

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



        {/* Şarj İstasyonu İkonu */}

        {currentRouteAction === 'charge_station' && (

          <Marker

            position={busLocation || defaultCenter}

            label={{ text: 'Şarj', color: 'black', fontSize: '12px', fontWeight: 'bold' }}

            icon={chargeStationIcon}

          />

        )}



        {/* Trafik Işığı İkonu */}

        {currentRouteAction === 'stop_traffic_light' && (

          <Marker

            position={busLocation || defaultCenter}

            label={{ text: 'Işık', color: 'black', fontSize: '12px', fontWeight: 'bold' }}

            icon={trafficLightIcon}

          />

        )}

        {/* Dinlenme Alanı İkonu */}

        {currentRouteAction === 'stop_rest_area' && (

          <Marker

            position={busLocation || defaultCenter}

            label={{ text: 'Mola', color: 'white', fontSize: '12px', fontWeight: 'bold' }}

            icon={restAreaIcon}

          />

        )}

        {/* Trafik Sıkışıklığı İkonu */}

        {currentRouteAction === 'stop_traffic_jam' && (

          <Marker

            position={busLocation || defaultCenter}

            label={{ text: 'Trafik', color: 'white', fontSize: '12px', fontWeight: 'bold' }}

            icon={trafficJamIcon}

          />

        )}

        {/* Gişe İkonu */}

        {currentRouteAction === 'stop_toll_gate' && (

          <Marker

            position={busLocation || defaultCenter}

            label={{ text: 'Gişe', color: 'white', fontSize: '12px', fontWeight: 'bold' }}

            icon={tollGateIcon}

          />

        )}

      </GoogleMap>



      {/* Hava durumu overlay'i */}

      {getWeatherOverlay()}



      {/* CSS animasyonlarını tanımla (bu kısmı globals.css'e de taşıyabilirsiniz) */}

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



export default GoogleMapComponent;
