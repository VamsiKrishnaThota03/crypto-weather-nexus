import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  conditions: string;
  icon?: string;
  timestamp: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon?: string;
  }>;
  dt: number;
}

interface WeatherState {
  data: Record<string, WeatherData>;
  loading: boolean;
  error: string | null;
  /** City -> error message for cities that failed in the last request */
  cityErrors: Record<string, string>;
}

const initialState: WeatherState = {
  data: {},
  loading: false,
  error: null,
  cityErrors: {},
};

const errorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

/** Fetch current weather for each city through the server-side /api/weather route. */
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (cities: string[], { rejectWithValue }) => {
    const results = await Promise.allSettled(
      cities.map(async (city): Promise<WeatherData> => {
        const response = await axios.get('/api/weather', { params: { city } });
        const d = response.data;
        return {
          city,
          temperature: Math.round(d.main.temp),
          humidity: d.main.humidity,
          conditions: d.weather?.[0]?.main ?? 'Unknown',
          icon: d.weather?.[0]?.icon,
          timestamp: Date.now(),
          main: d.main,
          wind: d.wind,
          weather: d.weather,
          dt: d.dt,
        };
      })
    );

    const data: WeatherData[] = [];
    const cityErrors: Record<string, string> = {};
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') data.push(result.value);
      else cityErrors[cities[i]] = errorMessage(result.reason, 'Failed to fetch weather');
    });

    if (data.length === 0 && cities.length > 0) {
      return rejectWithValue({ message: Object.values(cityErrors)[0] ?? 'Failed to fetch weather data', cityErrors });
    }
    return { data, cityErrors };
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        action.payload.data.forEach((weatherData) => {
          state.data[weatherData.city] = weatherData;
          delete state.cityErrors[weatherData.city];
        });
        Object.assign(state.cityErrors, action.payload.cityErrors);
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; cityErrors: Record<string, string> } | undefined;
        state.error = payload?.message || action.error.message || 'Failed to fetch weather data';
        if (payload) Object.assign(state.cityErrors, payload.cityErrors);
      });
  },
});

export default weatherSlice.reducer;
