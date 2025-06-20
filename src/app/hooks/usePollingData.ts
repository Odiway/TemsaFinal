import { useState, useEffect, useRef } from 'react';

// Python'dan gelen veri yapısını (BusData) buraya kopyalayın
interface BusData {
  _id?: string; // MongoDB ObjectId (opsiyonel, gelmeyebilir veya string olabilir)
  busId: string;
  timestamp: string; // ISO string
  vehicleSpeed: number;
  totalDistanceKm: number;
  brakePedalActive: boolean;
  regenBrakePower: number;
  gear: string;
  auxBatteryVoltage: number;
  cabinTemp: number;
  chargingStatus: boolean;
  tirePressure: number;

  motorRPM: number;
  motorCurrent: number;
  motorVoltage: number;
  motorTemperature: number;
  motorStatus: string;

  batterySOC: number;
  batteryVoltage: number;
  batteryCurrent: number;
  batteryTempMin: number;
  batteryTempMax: number;
  batteryHealth: number;
  bmsFaultActive: boolean;

  ambientTemperature: number;
  weatherCondition: string;
  windSpeedMps: number;
  humidity: number;

  current_slope_degrees: number;
  current_speed_limit_kph: number;
  current_traffic_density: string;
  current_route_action: string;
  current_segment_index: number;
  distance_in_current_segment_km: number;
  latitude: number; // GPS
  longitude: number; // GPS
  bearing_degrees: number; // GPS

  driverProfile: string;
  cruiseControlActive: boolean;
  driverTargetSpeed: number;

  healthStatus: string;
  errorCode: string | null;
  coolantTemp: number;

  minutesOnRoad: number;
  currentCity: string;
}

interface PollingOptions {
  intervalMs?: number; // Sorgulama aralığı (milisaniye)
  initialData?: BusData[];
}

const usePollingData = (url: string, options?: PollingOptions) => {
  // intervalMs'i 1000ms (1 saniye) olarak ayarlıyoruz (Performans ve akıcılık dengesi için)
  const { intervalMs = 1000, initialData = [] } = options || {};
  const [data, setData] = useState<BusData[]>(initialData);
  const [latestData, setLatestData] = useState<BusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchData = async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedData: BusData[] = await response.json();

      if (isMounted.current) {
        setData(fetchedData);
        if (fetchedData.length > 0) {
          setLatestData(fetchedData[0]);
        } else {
          setLatestData(null);
        }
      }
    } catch (e: any) {
      if (isMounted.current) {
        console.error('Error fetching data:', e);
        setError(`Veri çekme hatası: ${e.message}`);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData(); // Bileşen yüklendiğinde ilk çekimi yap

    const intervalId = setInterval(fetchData, intervalMs); // <-- setInterval geri eklendi!

    return () => {
      isMounted.current = false;
      clearInterval(intervalId); // <-- clearInterval geri eklendi!
    };
  }, [url, intervalMs]);

  const isConnected = !error && !isLoading;

  return { data, latestData, isLoading, error, isConnected };
};

export default usePollingData;
