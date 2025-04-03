import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
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
      const response = await axios.get(`/api/crypto?ids=${cryptos.join(',')}`);
      
      const data = response.data.reduce((acc: Record<string, CryptoData>, crypto: any) => {
        acc[crypto.id] = {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol.toUpperCase(),
          current_price: crypto.current_price,
          price_change_percentage_24h: crypto.price_change_percentage_24h,
          market_cap: crypto.market_cap,
          image: crypto.image,
        };
        return acc;
      }, {});

      return { data, timestamp: Date.now() };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error || 'Failed to fetch crypto data'
        );
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updateCryptoPrice: (state, action) => {
      const { id, price } = action.payload;
      if (state.data[id]) {
        state.data[id].current_price = price;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        if (Object.keys(state.data).length === 0) {
          state.data = {};
        }
      });
  },
});

export const { updateCryptoPrice } = cryptoSlice.actions;
export default cryptoSlice.reducer; 