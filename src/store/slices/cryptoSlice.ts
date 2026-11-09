import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
  image: string;
  circulating_supply: number;
  total_supply: number;
}

interface CryptoState {
  data: Record<string, CryptoData>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CryptoState = {
  data: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchCryptoData = createAsyncThunk(
  'crypto/fetchCryptoData',
  async (cryptos: string[], { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/crypto', { params: { ids: cryptos.join(',') } });
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from API');
      }

      const data = response.data.reduce((acc: Record<string, CryptoData>, crypto: any) => {
        try {
          if (!crypto || !crypto.id) {
            console.error('Invalid crypto data received:', crypto);
            return acc;
          }
          
          acc[crypto.id] = {
            id: crypto.id,
            name: crypto.name || 'Unknown',
            symbol: (crypto.symbol || '').toUpperCase(),
            current_price: crypto.current_price || 0,
            price_change_percentage_24h: crypto.price_change_percentage_24h || 0,
            market_cap: crypto.market_cap || 0,
            market_cap_rank: crypto.market_cap_rank || 0,
            image: crypto.image || '',
            circulating_supply: crypto.circulating_supply || 0,
            total_supply: crypto.total_supply || 0,
          };
        } catch (error) {
          console.error(`Error processing crypto data for ${crypto?.id || 'unknown'}:`, error);
        }
        return acc;
      }, {});

      if (Object.keys(data).length === 0) {
        throw new Error('No valid crypto data received');
      }

      return { data, timestamp: Date.now() };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error || 'Failed to fetch crypto data'
        );
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updateCryptoPrice: (state, action) => {
      const { id, price } = action.payload;
      const decodedId = decodeURIComponent(id);
      if (state.data[decodedId] && typeof price === 'number') {
        state.data[decodedId].current_price = price;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        // Merge so that detail pages don't wipe the dashboard list
        state.data = { ...state.data, ...action.payload.data };
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch crypto data';
      });
  },
});

export const { updateCryptoPrice } = cryptoSlice.actions;
export default cryptoSlice.reducer; 