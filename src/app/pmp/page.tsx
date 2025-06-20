// src/app/pmp/page.tsx
'use client';

import React, { useState, useEffect } from 'react'; // React, useState, useEffect importlarını kontrol edin
import usePollingData from '../hooks/usePollingData';
import LineChart from '../../components/LineChart';
import GoogleMapComponent from '../../components/GoogleMapComponent';

// Lucide React ikonları
import {
  Activity,
  Battery,
  Thermometer,
  Gauge,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Zap,
  Wind,
  Navigation,
  SquareGanttChart,
  Table,
  Power,
} from 'lucide-react';

// Grafiklerde ve rotada tutulacak maksimum veri noktası (performans için önerilen, ancak kesme işlemi kaldırıldı)
const MAX_DATA_POINTS_FOR_PATH = 500;
const MAX_CHART_DATA_POINTS = 100;

// --- StatusCard Bileşeni (DashboardPage dışına taşındı ve güncellendi) ---
interface StatusCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType; // Lucide icon'ları React component'leridir
  status?: 'normal' | 'warning' | 'error';
  subtitle?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  status = 'normal',
  subtitle,
}) => (
  <div className="group relative overflow-hidden">
    {/* Arka plan efekti */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

    {/* Asıl kart içeriği */}
    <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="flex items-start justify-between mb-4">
        {/* İkon */}
        <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        {/* Durum Etiketi */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'warning'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : status === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {status === 'warning' ? 'UYARI' : status === 'error' ? 'HATA' : 'NORMAL'}
        </div>
      </div>
      {/* Değer ve Başlık */}
      <div className="space-y-2">
        <h3 className="text-slate-200 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {unit && <span className="text-slate-400 text-sm">{unit}</span>}
        </div>
        {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  // Google Maps API Anahtarını .env.local'dan al
  const Maps_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY || '';
  if (!Maps_API_KEY) {
    console.error(
      'Google Maps API Key not found. Please set NEXT_PUBLIC_Maps_API_KEY in .env.local',
    );
  }

  // Polling hook'unu kullan
  const { latestData, isLoading, error, isConnected } = usePollingData(
    'http://localhost:3000/api/can-data',
    { intervalMs: 200 },
  );

  // Grafik verileri için state'ler
  const [labels, setLabels] = useState<string[]>([]);
  const [speedData, setSpeedData] = useState<number[]>([]);
  const [socData, setSocData] = useState<number[]>([]);
  const [motorTempData, setMotorTempData] = useState<number[]>([]);
  const [batteryTempMaxData, setBatteryTempMaxData] = useState<number[]>([]);
  const [ambientTempData, setAmbientTempData] = useState<number[]>([]);
  const [tirePressureData, setTirePressureData] = useState<number[]>([]);
  const [auxBatteryVoltageData, setAuxBatteryVoltageData] = useState<number[]>([]);
  const [coolantTempData, setCoolantTempData] = useState<number[]>([]);

  // Harita için otobüs konumu state'i
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Harita için rota path'i state'i
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);

  // En son gelen tüm veri objesi
  const [currentBusState, setCurrentBusState] = useState<any | null>(null); // BusData interface'i ile daha sıkı tip kontrolü yapılabilir

  // Veri geldiğinde grafik verilerini ve harita konumunu güncelle
  useEffect(() => {
    if (latestData) {
      setCurrentBusState(latestData);

      const timestampSeconds = new Date(latestData.timestamp).toLocaleTimeString('tr-TR', {
        second: '2-digit',
        minute: '2-digit',
        hour: '2-digit',
      });

      // Grafik verilerini güncelle (slice() kaldırıldı)
      setLabels((prev) => [...prev, timestampSeconds]);
      setSpeedData((prev) => [...prev, latestData.vehicleSpeed]);
      setSocData((prev) => [...prev, latestData.batterySOC]);
      setMotorTempData((prev) => [...prev, latestData.motorTemperature]);
      setBatteryTempMaxData((prev) => [...prev, latestData.batteryTempMax]);
      setAmbientTempData((prev) => [...prev, latestData.ambientTemperature]);
      setTirePressureData((prev) => [...prev, latestData.tirePressure]);
      setAuxBatteryVoltageData((prev) => [...prev, latestData.auxBatteryVoltage]);
      setCoolantTempData((prev) => [...prev, latestData.coolantTemp]);

      // Harita konumu güncellemesi (marker ve polyline için)
      if (latestData.latitude !== undefined && latestData.longitude !== undefined) {
        const newLocation = { lat: latestData.latitude, lng: latestData.longitude };
        setBusLocation(newLocation);

        setRoutePath((prevPath) => {
          // Çok yakın noktaları atlayarak rotayı daha temiz tutabiliriz (opsiyonel optimizasyon)
          if (prevPath.length > 0) {
            const lastLocation = prevPath[prevPath.length - 1];
            const distance = Math.sqrt(
              Math.pow(newLocation.lat - lastLocation.lat, 2) +
                Math.pow(newLocation.lng - lastLocation.lng, 2),
            );
            if (distance < 0.000005) {
              // Çok küçük mesafeleri atla
              return prevPath;
            }
          }
          const updatedPath = [...prevPath, newLocation];
          return updatedPath;
        });
      }
    }
  }, [latestData]);

  // Komut gönderme fonksiyonları
  const sendCommand = async (command: any) => {
    try {
      const response = await fetch('http://localhost:8766/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Komut gönderme hatası: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log('Komut başarıyla gönderildi:', result);
      alert(`Komut gönderildi: ${result.message}`);
    } catch (err: any) {
      console.error('Komut gönderme hatası:', err.message);
      alert(`Komut gönderme hatası: ${err.message}. Python komut sunucusu çalışıyor mi?`);
    }
  };

  const handleSetDriverProfile = (profile: string) => {
    sendCommand({ type: 'set_driver_profile', profile: profile });
  };

  const handleInjectFault = (
    faultType: string,
    severity: number,
    intermittent: boolean = false,
    interval: number = 60,
    duration: number = 5,
    details: { [key: string]: any } = {},
  ) => {
    sendCommand({
      type: 'inject_fault',
      fault_type: faultType,
      severity_start: severity,
      intermittent: intermittent,
      intermittent_interval_s: interval,
      intermittent_duration_s: duration,
      details: details,
    });
  };

  const handleClearFaults = () => {
    sendCommand({ type: 'clear_faults' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-500/30">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Elektrikli Otobüs Simülasyon
              </h1>
              <p className="text-slate-300 mt-1">Gerçek zamanlı izleme ve kontrol paneli</p>
            </div>
          </div>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl ${
              isConnected
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {isConnected ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isLoading ? 'Bağlanıyor...' : isConnected ? 'Veri Akışı Aktif' : 'Bağlantı Hatası'}
            </span>
            {error && <span className="text-red-400 ml-2">• {error}</span>}
          </div>
        </div>

        {/* Navigasyon Linkleri */}
        <div className="mb-8 flex flex-wrap gap-4 text-sm font-medium">
          <a
            href="#sim-controls"
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Kontroller
          </a>
          <a
            href="#status-cards"
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2"
          >
            <Gauge className="w-4 h-4" /> Anlık Durum
          </a>
          <a
            href="#raw-data"
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2"
          >
            <Table className="w-4 h-4" /> Ham Veriler
          </a>
          <a
            href="#bus-map"
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Harita
          </a>
          <a
            href="#charts"
            className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2"
          >
            <SquareGanttChart className="w-4 h-4" /> Grafikler
          </a>
        </div>

        {/* Control Panel */}
        <div id="sim-controls" className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Activity className="w-7 h-7 text-cyan-400" />
                Simülatör Kontrolleri
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Driver Profile */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">Sürücü Profili</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['normal', 'aggressive', 'defensive', 'tired'].map((profile) => (
                      <button
                        key={profile}
                        onClick={() => handleSetDriverProfile(profile)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                          currentBusState?.driverProfile === profile
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 text-white shadow-xl shadow-cyan-500/20'
                            : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
                        }`}
                        disabled={isLoading}
                      >
                        {profile.charAt(0).toUpperCase() + profile.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fault Injection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400">Arıza Simülasyonu</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleInjectFault('battery_overheat', 0.2)}
                      className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Batarya Aşırı Isınma
                    </button>
                    <button
                      onClick={() => handleInjectFault('motor_insulation_degradation', 0.2)}
                      className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Motor İzolasyon Hatası
                    </button>
                    <button
                      onClick={() => handleInjectFault('tire_pressure_loss', 0.1)}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-orange-300 rounded-xl hover:from-orange-500/30 hover:to-orange-600/30 hover:border-orange-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Lastik Basıncı Düşük
                    </button>
                    <button
                      onClick={() => handleInjectFault('coolant_pump_failure', 0.1)}
                      className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Soğutma Pompası Arızası
                    </button>
                    <button
                      onClick={() =>
                        handleInjectFault('sensor_frozen', 0.5, true, 30, 5, {
                          sensor: 'motorTemperature',
                        })
                      }
                      className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Sensör Donma (Motor Temp)
                    </button>
                    <button
                      onClick={() =>
                        handleInjectFault('sensor_noisy', 0.5, true, 40, 10, {
                          sensor: 'batteryCurrent',
                        })
                      }
                      className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Sensör Gürültülü (Batarya Akım)
                    </button>
                    <button
                      onClick={handleClearFaults}
                      className="px-4 py-3 bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-500/30 text-slate-300 rounded-xl hover:from-slate-600/30 hover:to-slate-700/30 hover:border-slate-400/50 transition-all duration-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Tüm Arızaları Temizle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {currentBusState && (
          <div id="status-cards" className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Gauge className="w-7 h-7 text-cyan-400" />
              Anlık Otobüs Durumu: {currentBusState.busId}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <StatusCard
                title="Araç Hızı"
                value={currentBusState.vehicleSpeed}
                unit="km/h"
                icon={Gauge}
                status={currentBusState.vehicleSpeed > 80 ? 'warning' : 'normal'}
              />
              <StatusCard
                title="Batarya Şarjı"
                value={currentBusState.batterySOC}
                unit="%"
                icon={Battery}
                status={
                  currentBusState.batterySOC < 20
                    ? 'error'
                    : currentBusState.batterySOC < 50
                      ? 'warning'
                      : 'normal'
                }
              />
              <StatusCard
                title="Motor Sıcaklığı"
                value={currentBusState.motorTemperature}
                unit="°C"
                icon={Thermometer}
                status={
                  currentBusState.motorTemperature > 100
                    ? 'error'
                    : currentBusState.motorTemperature > 80
                      ? 'warning'
                      : 'normal'
                }
              />
              <StatusCard
                title="Toplam Mesafe"
                value={currentBusState.totalDistanceKm}
                unit="km"
                icon={Navigation}
                status={
                  currentBusState.totalDistanceKm < 0.1 && currentBusState.vehicleSpeed < 1
                    ? 'warning'
                    : 'normal'
                }
              />
              <StatusCard
                title="Motor Devri"
                value={currentBusState.motorRPM}
                unit="RPM"
                icon={Activity}
              />
              <StatusCard
                title="Rüzgar Hızı"
                value={currentBusState.windSpeedMps}
                unit="m/s"
                icon={Wind}
              />
              <StatusCard
                title="Lastik Basıncı"
                value={currentBusState.tirePressure}
                unit="PSI"
                icon={Gauge}
                status={currentBusState.tirePressure < 25 ? 'warning' : 'normal'}
              />
              <StatusCard
                title="Sistem Durumu"
                value={currentBusState.chargingStatus ? 'Şarjda' : 'Sürüşte'}
                icon={currentBusState.chargingStatus ? Battery : Activity}
                status={currentBusState.healthStatus !== 'normal_calisma' ? 'error' : 'normal'}
                subtitle={currentBusState.currentCity}
              />
              <StatusCard
                title="Yolda Geçen Süre"
                value={currentBusState.minutesOnRoad}
                unit="dk"
                icon={Activity}
                subtitle={`Hedef: ${currentBusState.currentCity}`}
              />
              <StatusCard
                title="Motor Durumu"
                value={currentBusState.motorStatus === 'on' ? 'Açık' : 'Kapalı'}
                icon={Power}
                status={currentBusState.motorStatus === 'on' ? 'normal' : 'warning'}
              />
            </div>
          </div>
        )}

        {/* Tüm Ham Veriler Tablosu */}
        {currentBusState && (
          <div id="raw-data" className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Table className="w-7 h-7 text-cyan-400" />
              Tüm Ham Veriler
            </h2>
            <div className="bg-white/5 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm text-slate-300">
                {Object.entries(currentBusState).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="font-medium text-slate-400 w-1/2 break-words pr-2">
                      {key}:
                    </span>
                    <span className="w-1/2 break-words">
                      {typeof value === 'object' && value !== null
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        {Maps_API_KEY && busLocation && (
          <div id="bus-map" className="mb-8">
            <div className="relative overflow-hidden h-[450px]">
              {/* Added a solid background to the blurred div to ensure it has a color even if inner content isn't there */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl blur-xl"></div>
              {/* IMPORTANT: Added 'flex', 'flex-col', and 'h-full' here */}
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col h-full">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 flex-shrink-0">
                  {' '}
                  {/* Added flex-shrink-0 */}
                  <MapPin className="w-7 h-7 text-cyan-400" />
                  Otobüs Konumu
                </h2>
                {/* IMPORTANT: Added 'flex-1' here so the map container takes the remaining height */}
                <div className="flex-1 rounded-md overflow-hidden">
                  {' '}
                  {/* Added rounded-md and overflow-hidden for map appearance */}
                  <GoogleMapComponent
                    apiKey={Maps_API_KEY}
                    busLocation={busLocation}
                    busId={currentBusState?.busId || 'Otobüs'}
                    routePath={routePath}
                    bearingDegrees={currentBusState.bearing_degrees}
                    weatherCondition={currentBusState.weatherCondition}
                    currentRouteAction={currentBusState.current_route_action}
                    chargingStatus={currentBusState.chargingStatus}
                    vehicleSpeed={currentBusState.vehicleSpeed}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div id="charts" className="space-y-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <SquareGanttChart className="w-7 h-7 text-cyan-400" />
            Gerçek Zamanlı Grafikler
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="h-64 bg-white/5 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
              <LineChart
                title="Hız Takibi"
                labels={labels}
                data={speedData}
                borderColor="rgb(75, 192, 192)"
                yAxisLabel="Hız (km/h)"
                min={0}
                max={100}
              />
            </div>
            <div className="h-64 bg-white/5 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
              <LineChart
                title="Batarya Şarj Durumu"
                labels={labels}
                data={socData}
                borderColor="rgb(50, 205, 50)"
                yAxisLabel="SOC (%)"
                min={0}
                max={100}
              />
            </div>
            <div className="h-64 bg-white/5 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
              <LineChart
                title="Sıcaklık İzleme"
                labels={labels}
                data={{
                  Motor: motorTempData,
                  'Batarya Max': batteryTempMaxData,
                  Ortam: ambientTempData,
                  Soğutma: coolantTempData,
                }}
                borderColor={{
                  Motor: 'rgb(255, 99, 132)',
                  'Batarya Max': 'rgb(153, 102, 255)',
                  Ortam: 'rgb(255, 159, 64)',
                  Soğutma: 'rgb(0, 128, 255)',
                }}
                yAxisLabel="Sıcaklık (°C)"
                min={-10}
                max={150}
              />
            </div>
            <div className="h-64 bg-white/5 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
              <LineChart
                title="Sistem Parametreleri"
                labels={labels}
                data={{
                  'Lastik Basıncı': tirePressureData,
                  'Yardımcı Akü': auxBatteryVoltageData,
                }}
                borderColor={{
                  'Lastik Basıncı': 'rgb(201, 203, 207)',
                  'Yardımcı Akü': 'rgb(255, 205, 86)',
                }}
                yAxisLabel="Değer"
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
