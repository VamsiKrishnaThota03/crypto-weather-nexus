import toast from 'react-hot-toast';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from '@/store/slices/cryptoSlice';
import favoritesReducer from '@/store/slices/favoritesSlice';
import type { AppStore } from '@/store';
import { LiveUpdatesService } from '../liveUpdates';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeStore = () =>
  configureStore({
    reducer: { crypto: cryptoReducer, favorites: favoritesReducer },
    preloadedState: {
      crypto: {
        data: {
          bitcoin: {
            id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', current_price: 100, price_change_percentage_24h: 0,
            market_cap: 0, market_cap_rank: 1, image: '', circulating_supply: 0, total_supply: 0,
          },
        },
        loading: false,
        error: null,
        lastUpdated: null,
      },
      favorites: { cities: ['London'], cryptos: [] },
    },
  });

describe('LiveUpdatesService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates prices in the store and alerts on moves of 1% or more', () => {
    const store = makeStore();
    const service = new LiveUpdatesService(() => store as unknown as AppStore);

    service.handlePriceUpdate([{ id: 'bitcoin', name: 'Bitcoin', current_price: 100 }]);
    expect(toast).not.toHaveBeenCalled();

    service.handlePriceUpdate([{ id: 'bitcoin', name: 'Bitcoin', current_price: 100.5 }]);
    expect(toast).not.toHaveBeenCalled();

    service.handlePriceUpdate([{ id: 'bitcoin', name: 'Bitcoin', current_price: 102 }]);
    expect(toast).toHaveBeenCalledTimes(1);
    expect((toast as unknown as jest.Mock).mock.calls[0][0]).toMatch(/Bitcoin rose 1\.49%/);
    expect(store.getState().crypto.data.bitcoin.current_price).toBe(102);
  });

  it('ignores malformed payloads', () => {
    const store = makeStore();
    const service = new LiveUpdatesService(() => store as unknown as AppStore);
    service.handlePriceUpdate({ not: 'an array' });
    service.handlePriceUpdate([null, { id: 'bitcoin', current_price: 'x' }]);
    expect(store.getState().crypto.data.bitcoin.current_price).toBe(100);
  });

  it('alerts on large temperature and condition changes', () => {
    const store = makeStore();
    const service = new LiveUpdatesService(() => store as unknown as AppStore);
    service.handleWeatherUpdate('London', { main: { temp: 10 }, weather: [{ main: 'Clouds' }] });
    service.handleWeatherUpdate('London', { main: { temp: 16 }, weather: [{ main: 'Rain' }] });
    expect(toast).toHaveBeenCalledTimes(2);
  });

  it('polls the app API for favorite cities', async () => {
    const store = makeStore();
    mockedAxios.get.mockResolvedValue({ data: { main: { temp: 10 }, weather: [{ main: 'Clear' }] } });
    const service = new LiveUpdatesService(() => store as unknown as AppStore);
    await service.pollWeather();
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/weather', { params: { city: 'London' } });
  });

  it('start/stop manage timers', () => {
    jest.useFakeTimers();
    mockedAxios.get.mockResolvedValue({ data: [] });
    const store = makeStore();
    const service = new LiveUpdatesService(() => store as unknown as AppStore);
    service.start();
    expect(service.isRunning).toBe(true);
    service.stop();
    expect(service.isRunning).toBe(false);
    jest.useRealTimers();
  });
});
