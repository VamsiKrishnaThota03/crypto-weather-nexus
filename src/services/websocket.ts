import { store } from '@/store';
import { updateCryptoPrice } from '@/store/slices/cryptoSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

class CryptoService {
  private static instance: CryptoService;
  private ws: WebSocket | null = null;
  private lastPrices: Record<string, number> = {};
  private lastWeather: Record<string, any> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  public connect(): void {
    if (this.ws || this.isConnecting) return;

    console.log('Starting crypto updates...');
    this.startWebSocket();
    this.startWeatherAlerts();
  }

  private startWebSocket(): void {
    this.isConnecting = true;
    
    // Initial fetch
    this.fetchPrices();

    // Set up WebSocket connection
    try {
      this.ws = new WebSocket('ws://localhost:3000/api/websocket');

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlePriceUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.reconnect();
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnecting = false;
        this.reconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Connection to crypto service lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.startWebSocket();
    }, delay);
  }

  private async fetchPrices(): Promise<void> {
    try {
      const response = await axios.get('/api/crypto?ids=bitcoin,ethereum');
      this.handlePriceUpdate(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to fetch crypto prices');
      }
    }
  }

  private handlePriceUpdate(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((crypto: any) => {
        const price = crypto.current_price;
        const lastPrice = this.lastPrices[crypto.id];
        this.lastPrices[crypto.id] = price;

        if (lastPrice) {
          const change = ((price - lastPrice) / lastPrice) * 100;
          if (Math.abs(change) >= 1) {
            toast(
              `${crypto.name} price ${change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(2)}%`,
              {
                icon: change >= 0 ? '📈' : '📉',
                duration: 5000,
              }
            );
          }
        }

        store.dispatch(updateCryptoPrice({ id: crypto.id, price }));
      });
    }
  }

  private async startWeatherAlerts(): Promise<void> {
    const checkWeather = async () => {
      try {
        const { cities } = store.getState().favorites;
        for (const city of cities) {
          const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
          if (!response.ok) continue;

          const data = await response.json();
          const lastWeather = this.lastWeather[city];

          if (lastWeather) {
            // Check for significant temperature changes
            const tempChange = Math.abs(data.main.temp - lastWeather.main.temp);
            if (tempChange >= 5) {
              toast(
                `Temperature in ${city} changed by ${tempChange.toFixed(1)}°C`,
                {
                  icon: '🌡️',
                  duration: 5000,
                }
              );
            }

            // Check for weather condition changes
            if (data.weather[0].main !== lastWeather.weather[0].main) {
              toast(
                `Weather in ${city} changed to ${data.weather[0].main}`,
                {
                  icon: '🌤️',
                  duration: 5000,
                }
              );
            }
          }

          this.lastWeather[city] = data;
        }
      } catch (error) {
        console.error('Error checking weather:', error);
      }
    };

    // Check weather every 5 minutes
    setInterval(checkWeather, 300000);
    // Initial check
    checkWeather();
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}

export const cryptoService = CryptoService.getInstance(); 