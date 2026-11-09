import axios from 'axios';
import toast from 'react-hot-toast';
import type { AppStore } from '@/store';
import { updateCryptoPrice } from '@/store/slices/cryptoSlice';

/** Coins watched for price alerts. */
export const WATCHED_COINS = ['bitcoin', 'ethereum'];
export const PRICE_POLL_MS = 30_000;
export const WEATHER_POLL_MS = 5 * 60_000;
/** Minimum move between two polls that triggers a toast (percent). */
export const PRICE_ALERT_THRESHOLD = 1;
/** Minimum temperature change that triggers a toast (degrees C). */
export const TEMP_ALERT_THRESHOLD = 5;

interface PriceTick {
  id: string;
  name: string;
  current_price: number;
}

interface WeatherTick {
  main: { temp: number };
  weather: Array<{ main: string }>;
}

/**
 * Polls the app's own API routes for price and weather changes and shows
 * toast alerts. Works on serverless hosts (no long-lived socket server).
 */
export class LiveUpdatesService {
  private lastPrices: Record<string, number> = {};
  private lastWeather: Record<string, WeatherTick> = {};
  private timers: ReturnType<typeof setInterval>[] = [];
  private running = false;
  private failures = 0;

  constructor(private readonly getStore: () => AppStore) {}

  get isRunning() {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    void this.pollPrices();
    void this.pollWeather();
    this.timers.push(setInterval(() => void this.pollPrices(), PRICE_POLL_MS));
    this.timers.push(setInterval(() => void this.pollWeather(), WEATHER_POLL_MS));
  }

  stop(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.running = false;
  }

  async pollPrices(): Promise<void> {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    try {
      const response = await axios.get<PriceTick[]>('/api/crypto', { params: { ids: WATCHED_COINS.join(',') } });
      this.failures = 0;
      this.handlePriceUpdate(response.data);
    } catch {
      this.failures += 1;
      // Only tell the user once per outage
      if (this.failures === 3) toast.error('Live price updates are temporarily unavailable.');
    }
  }

  handlePriceUpdate(data: unknown): void {
    if (!Array.isArray(data)) return;
    for (const coin of data as PriceTick[]) {
      if (!coin || typeof coin.current_price !== 'number') continue;
      const price = coin.current_price;
      const lastPrice = this.lastPrices[coin.id];
      this.lastPrices[coin.id] = price;

      if (lastPrice) {
        const change = ((price - lastPrice) / lastPrice) * 100;
        if (Math.abs(change) >= PRICE_ALERT_THRESHOLD) {
          toast(`${coin.name} ${change >= 0 ? 'rose' : 'fell'} ${Math.abs(change).toFixed(2)}%`, {
            icon: change >= 0 ? '📈' : '📉',
            duration: 5000,
          });
        }
      }
      this.getStore().dispatch(updateCryptoPrice({ id: coin.id, price }));
    }
  }

  async pollWeather(): Promise<void> {
    const { cities } = this.getStore().getState().favorites;
    for (const city of cities) {
      try {
        const response = await axios.get<WeatherTick>('/api/weather', { params: { city } });
        this.handleWeatherUpdate(city, response.data);
      } catch {
        // Ignore: the weather section shows its own error state
      }
    }
  }

  handleWeatherUpdate(city: string, data: WeatherTick): void {
    const last = this.lastWeather[city];
    if (last) {
      const tempChange = data.main.temp - last.main.temp;
      if (Math.abs(tempChange) >= TEMP_ALERT_THRESHOLD) {
        toast(`Temperature in ${city} changed by ${tempChange > 0 ? '+' : ''}${tempChange.toFixed(1)}°C`, {
          icon: '🌡️',
          duration: 5000,
        });
      }
      const now = data.weather?.[0]?.main;
      if (now && now !== last.weather?.[0]?.main) {
        toast(`Weather in ${city} changed to ${now}`, { icon: '🌤️', duration: 5000 });
      }
    }
    this.lastWeather[city] = data;
  }
}
