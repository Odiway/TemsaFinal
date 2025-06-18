'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Harita stilleri (örneğin, daha sade bir görünüm için) - opsiyonel
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

// Haritanın varsayılan merkez noktası (örneğin Adana, Türkiye)
const defaultCenter = {
  lat: 37.0,
  lng: 35.325,
};

// Haritanın varsayılan yakınlaştırma seviyesi
const defaultZoom = 10;

// Google Maps kütüphanesini yüklemek için gerekli yükleme seçenekleri
// Google Haritalar API'sinde geçerli olan Library tiplerini kullanın.
// 'places', 'drawing', 'geometry', 'visualization' gibi.
// Eğer 'localContext' veya başka bir şey hata veriyorsa, kütüphanenin dökümantasyonunu kontrol edin veya kaldırın.
const libraries: ('drawing' | 'geometry' | 'places' | 'visualization')[] = ['places'];

interface GoogleMapComponentProps {
  apiKey: string; // Google Maps API Anahtarınız
  busLocation: { lat: number; lng: number } | null; // Otobüsün anlık GPS konumu
  busId: string; // Otobüs ID'si (marker etiketi için)
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ apiKey, busLocation, busId }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentCenter, setCurrentCenter] = useState(defaultCenter);

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

  useEffect(() => {
    if (mapRef.current && busLocation) {
      mapRef.current.panTo(busLocation);

      // İsterseniz zoom seviyesini de burada ayarlayabilirsiniz
      // if (mapRef.current.getZoom() < 12) {
      //   mapRef.current.setZoom(12);
      // }
    }
  }, [busLocation]);

  if (loadError) return <div>Harita yüklenirken hata oluştu: {loadError.message}</div>;
  if (!isLoaded) return <div>Harita yükleniyor...</div>;

  return (
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
      }}
    >
      {busLocation && (
        <Marker
          position={busLocation}
          label={{
            text: busId || 'Otobüs',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 0.9,
            strokeWeight: 0,
            scale: 8,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
